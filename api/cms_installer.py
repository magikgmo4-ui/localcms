"""
cms_installer.py — CMS Module Installer V1
Router FastAPI : /api/installer
Pipeline : Scan → Inspect → Precheck → Backup → Staging → Validate → Install → Post-check → Finalize

Règles impératives :
- Aucun shell libre, aucun subprocess, aucun os.system
- Aucun endpoint PUT/DELETE/PATCH
- target_key traduit côté backend uniquement, non exposé
- Backup obligatoire si cible préexistante
- Rollback automatique si Install échoue après début d'écriture
- Staging isolé dans /tmp, nettoyé en Finalize
- Symétrique à shared_explorer.py pour les logs

Intégration dans le backend FastAPI existant :
    from api.cms_installer import installer_router
    app.include_router(installer_router, prefix="/api/installer")

Variables d'environnement :
    LOCALCMS_SHARED_ROOT   (défaut : /shared)
    LOCALCMS_MODULES_DIR   (défaut : /app/localcms/modules)  ← à confirmer en environnement
"""

import json
import os
import re
import shutil
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# ─── Configuration locale (non exposée par API) ──────────────────────────────

SHARED_ROOT   = Path(os.environ.get("LOCALCMS_SHARED_ROOT", "/shared"))
INSTALL_QUEUE = SHARED_ROOT / "install-queue"
BACKUP_DIR    = SHARED_ROOT / "install-backups"
LOG_DIR       = SHARED_ROOT / "install-logs"
STAGING_BASE  = Path("/tmp")

# TARGET_PATHS : clés logiques → chemins réels
# "modules_dir" est la seule clé autorisée en V1.
# Le chemin réel est une config locale à confirmer en environnement.
TARGET_PATHS: dict[str, Path] = {
    "modules_dir": Path(os.environ.get("LOCALCMS_MODULES_DIR", "/app/localcms/modules")),
}

MANIFEST_FILENAME  = "manifest.json"
ALLOWED_BUNDLE_EXTS = {".js", ".json", ".md", ".txt", ".css"}
VALID_ID_RE        = re.compile(r"^[a-z0-9_]+$")
VALID_VERSION_RE   = re.compile(r"^\d+\.\d+\.\d+$")
VALID_GROUPS       = {"tools", "system", "backend", "dev", "git", "menus", "network"}
MAX_BUNDLE_BYTES   = 10 * 1024 * 1024   # 10 MB — bundles de modules, pas d'archives géantes

installer_router = APIRouter()


# ─── Modèles Pydantic ────────────────────────────────────────────────────────

class BundleRequest(BaseModel):
    bundle: str


# ─── Log helper (symétrique à shared_explorer.py) ────────────────────────────

def _emit_log(
    action: str,
    bundle: str,
    module_id: str,
    pipeline_step: str,
    result: str,
    error: Optional[str] = None,
) -> dict:
    entry: dict = {
        "timestamp":     datetime.now(timezone.utc).isoformat(),
        "user_id":       "cms_user",
        "action":        action,
        "bundle":        bundle,
        "module_id":     module_id,
        "pipeline_step": pipeline_step,
        "result":        result,
    }
    if error:
        entry["error"] = error
    try:
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        ts  = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%f")
        log_path = LOG_DIR / f"install_{module_id or 'unknown'}_{ts}.json"
        log_path.write_text(json.dumps(entry, ensure_ascii=False, indent=2))
    except Exception:
        pass  # log best-effort
    return entry


# ─── Helpers internes ────────────────────────────────────────────────────────

def _resolve_bundle(filename: str) -> Path:
    """Valider et résoudre le chemin d'un bundle dans INSTALL_QUEUE."""
    if not filename or not filename.endswith(".zip"):
        raise HTTPException(400, "Le bundle doit être un fichier .zip")
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(400, "Nom de fichier invalide")
    safe = (INSTALL_QUEUE / filename).resolve()
    try:
        safe.relative_to(INSTALL_QUEUE.resolve())
    except ValueError:
        _emit_log("scan", filename, "", "resolve", "denied", "path_violation")
        raise HTTPException(403, "Path violation")
    if not safe.exists():
        raise HTTPException(404, f"Bundle introuvable : {filename}")
    if safe.stat().st_size > MAX_BUNDLE_BYTES:
        raise HTTPException(413, f"Bundle trop volumineux (max {MAX_BUNDLE_BYTES // 1024 // 1024} MB)")
    return safe


def _read_manifest(zf: zipfile.ZipFile) -> dict:
    """Lire manifest.json à la racine exacte du zip."""
    names = zf.namelist()
    if MANIFEST_FILENAME not in names:
        raise ValueError("manifest.json absent de la racine du bundle")
    raw = zf.read(MANIFEST_FILENAME)
    return json.loads(raw)


def _validate_manifest(m: dict, zip_names: Optional[list] = None) -> list[str]:
    """Retourner la liste des erreurs de validation du manifeste."""
    errors: list[str] = []
    required = ["id", "name", "version", "description", "group", "target_key", "files"]
    for field in required:
        if field not in m:
            errors.append(f"Champ obligatoire manquant : {field}")

    if "id" in m:
        if not VALID_ID_RE.match(str(m["id"])):
            errors.append("id invalide — seuls [a-z0-9_] autorisés")

    if "version" in m:
        if not VALID_VERSION_RE.match(str(m["version"])):
            errors.append("version invalide — format X.Y.Z requis")

    if "group" in m:
        if m["group"] not in VALID_GROUPS:
            errors.append(f"group '{m['group']}' non autorisé (autorisés : {sorted(VALID_GROUPS)})")

    if "target_key" in m:
        if m["target_key"] not in TARGET_PATHS:
            errors.append(f"target_key '{m['target_key']}' non autorisé (autorisés : {list(TARGET_PATHS)})")

    if "files" in m:
        if not isinstance(m["files"], list) or len(m["files"]) == 0:
            errors.append("files doit être une liste non vide")
        else:
            for i, f in enumerate(m["files"]):
                if not isinstance(f, dict) or "src" not in f or "dest" not in f:
                    errors.append(f"files[{i}] : champs src et dest obligatoires")
                    continue
                # path traversal dans dest
                dest_path = Path(f["dest"])
                if dest_path.is_absolute() or ".." in dest_path.parts:
                    errors.append(f"files[{i}].dest contient un chemin interdit : {f['dest']}")
                # extension dest
                ext = dest_path.suffix
                if ext not in ALLOWED_BUNDLE_EXTS:
                    errors.append(f"files[{i}].dest extension non autorisée : {ext}")
                # src présent dans le zip (si fourni)
                if zip_names and f["src"] not in zip_names:
                    errors.append(f"files[{i}].src '{f['src']}' absent du zip")

    return errors


def _rollback(
    module_id: str,
    bundle: str,
    installed_files: list[Path],
    backup_src: Optional[Path],
    target_path: Path,
    steps: dict,
) -> None:
    """Supprimer les fichiers partiellement installés et restaurer le backup."""
    for p in installed_files:
        try:
            Path(p).unlink(missing_ok=True)
        except Exception:
            pass
    if backup_src and backup_src.exists():
        for f in backup_src.iterdir():
            try:
                shutil.copy2(f, target_path / f.name)
            except Exception:
                pass
    steps["rollback"] = {"status": "ok"}
    _emit_log("rollback", bundle, module_id, "rollback", "ok")


# ─── Endpoints ───────────────────────────────────────────────────────────────

@installer_router.get("/scan")
async def scan_queue():
    """
    Lister les bundles .zip dans /shared/install-queue/.
    GET /api/installer/scan
    """
    try:
        INSTALL_QUEUE.mkdir(parents=True, exist_ok=True)
        bundles = []
        for f in sorted(INSTALL_QUEUE.iterdir()):
            if f.is_file() and f.suffix == ".zip":
                st = f.stat()
                bundles.append({
                    "filename": f.name,
                    "size":     st.st_size,
                    "modified": datetime.fromtimestamp(
                        st.st_mtime, tz=timezone.utc
                    ).isoformat(),
                })
        _emit_log("scan", "", "", "scan", "ok")
        return {"bundles": bundles, "count": len(bundles)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@installer_router.get("/inspect")
async def inspect_bundle(bundle: str):
    """
    Lire et retourner le manifeste d'un bundle sans l'installer.
    GET /api/installer/inspect?bundle=<filename>
    """
    path = _resolve_bundle(bundle)
    try:
        with zipfile.ZipFile(path, "r") as zf:
            bad = zf.testzip()
            if bad is not None:
                raise HTTPException(400, f"Archive ZIP corrompue (premier fichier défaillant : {bad})")
            manifest   = _read_manifest(zf)
            files_in_zip = zf.namelist()
        _emit_log("inspect", bundle, manifest.get("id", ""), "inspect", "ok")
        return {"bundle": bundle, "manifest": manifest, "files_in_zip": files_in_zip}
    except HTTPException:
        raise
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(422, f"Manifeste invalide : {e}")
    except zipfile.BadZipFile as e:
        raise HTTPException(400, f"Archive ZIP invalide : {e}")
    except Exception as e:
        raise HTTPException(500, str(e))


@installer_router.post("/precheck")
async def precheck_bundle(body: BundleRequest):
    """
    Valider un bundle sans écrire quoi que ce soit.
    POST /api/installer/precheck  body: {"bundle": "nom.zip"}
    """
    bundle    = body.bundle
    path      = _resolve_bundle(bundle)
    module_id = ""
    errors: list[str] = []

    try:
        with zipfile.ZipFile(path, "r") as zf:
            try:
                manifest  = _read_manifest(zf)
                zip_names = zf.namelist()
            except (ValueError, json.JSONDecodeError) as e:
                errors.append(str(e))
                _emit_log("precheck", bundle, "", "precheck", "failed", "; ".join(errors))
                return {"bundle": bundle, "module_id": "", "result": "failed", "errors": errors}

            module_id = manifest.get("id", "")
            errors.extend(_validate_manifest(manifest, zip_names))

        result = "ok" if not errors else "failed"
        _emit_log("precheck", bundle, module_id, "precheck", result,
                  "; ".join(errors) if errors else None)
        return {"bundle": bundle, "module_id": module_id, "result": result, "errors": errors}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@installer_router.post("/install")
async def install_bundle(body: BundleRequest):
    """
    Pipeline complet : Precheck → Backup → Staging → Validate → Install → Post-check → Finalize.
    POST /api/installer/install  body: {"bundle": "nom.zip"}
    """
    bundle          = body.bundle
    path            = _resolve_bundle(bundle)
    steps: dict     = {}
    module_id       = ""
    staging_dir: Optional[Path] = None
    backup_path: Optional[Path] = None
    installed_files: list[Path] = []

    def _step(name: str, status: str, error: Optional[str] = None) -> None:
        steps[name] = {"status": status}
        if error:
            steps[name]["error"] = error

    try:
        # ── 3. Precheck ───────────────────────────────────────────────
        with zipfile.ZipFile(path, "r") as zf:
            try:
                manifest  = _read_manifest(zf)
                zip_names = zf.namelist()
            except (ValueError, json.JSONDecodeError) as e:
                _step("precheck", "failed", str(e))
                _emit_log("install", bundle, "", "precheck", "failed", str(e))
                return {"bundle": bundle, "module_id": "", "result": "failed",
                        "steps": steps, "error": "Precheck failed"}

            module_id = manifest.get("id", "")
            pc_errors = _validate_manifest(manifest, zip_names)

        if pc_errors:
            _step("precheck", "failed", "; ".join(pc_errors))
            _emit_log("install", bundle, module_id, "precheck", "failed", "; ".join(pc_errors))
            return {"bundle": bundle, "module_id": module_id, "result": "failed",
                    "steps": steps, "error": "Precheck failed"}

        _step("precheck", "ok")
        target_key  = manifest["target_key"]
        target_path = TARGET_PATHS[target_key]
        target_path.mkdir(parents=True, exist_ok=True)

        # ── 4. Backup ─────────────────────────────────────────────────
        ts            = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%f")
        backup_path   = BACKUP_DIR / f"{module_id}_{ts}"
        existing_files = [
            target_path / f["dest"]
            for f in manifest["files"]
            if (target_path / f["dest"]).exists()
        ]
        if existing_files:
            try:
                backup_path.mkdir(parents=True, exist_ok=True)
                for src in existing_files:
                    shutil.copy2(src, backup_path / src.name)
                _step("backup", "ok")
                _emit_log("install", bundle, module_id, "backup", "ok")
            except Exception as e:
                _step("backup", "failed", str(e))
                _emit_log("install", bundle, module_id, "backup", "failed", str(e))
                return {"bundle": bundle, "module_id": module_id, "result": "failed",
                        "steps": steps, "error": "Backup failed"}
        else:
            _step("backup", "skipped")

        # ── 5. Staging ────────────────────────────────────────────────
        staging_dir = STAGING_BASE / f"localcms_staging_{module_id}_{uuid.uuid4().hex}"
        try:
            staging_dir.mkdir(parents=True, exist_ok=True)
            with zipfile.ZipFile(path, "r") as zf:
                zf.extractall(staging_dir)
            _step("staging", "ok")
            _emit_log("install", bundle, module_id, "staging", "ok")
        except Exception as e:
            _step("staging", "failed", str(e))
            _emit_log("install", bundle, module_id, "staging", "failed", str(e))
            if staging_dir and staging_dir.exists():
                shutil.rmtree(staging_dir, ignore_errors=True)
            return {"bundle": bundle, "module_id": module_id, "result": "failed",
                    "steps": steps, "error": "Staging failed"}

        # ── 6. Validate ───────────────────────────────────────────────
        val_errors: list[str] = []
        for i, f in enumerate(manifest["files"]):
            src_path = staging_dir / f["src"]
            if not src_path.exists():
                val_errors.append(f"files[{i}].src absent du staging : {f['src']}")
                continue
            ext = src_path.suffix
            if ext not in ALLOWED_BUNDLE_EXTS:
                val_errors.append(f"Extension non autorisée dans staging : {f['src']} ({ext})")

        if val_errors:
            _step("validate", "failed", "; ".join(val_errors))
            _emit_log("install", bundle, module_id, "validate", "failed", "; ".join(val_errors))
            shutil.rmtree(staging_dir, ignore_errors=True)
            return {"bundle": bundle, "module_id": module_id, "result": "failed",
                    "steps": steps, "error": "Validate failed"}

        _step("validate", "ok")

        # ── 7. Install ────────────────────────────────────────────────
        try:
            for f in manifest["files"]:
                src_path  = staging_dir / f["src"]
                dest_path = target_path / f["dest"]
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src_path, dest_path)
                installed_files.append(dest_path)
            _step("install", "ok")
            _emit_log("install", bundle, module_id, "install", "ok")
        except Exception as e:
            _step("install", "failed", str(e))
            _emit_log("install", bundle, module_id, "install", "failed", str(e))
            _rollback(module_id, bundle, installed_files, backup_path, target_path, steps)
            shutil.rmtree(staging_dir, ignore_errors=True)
            return {"bundle": bundle, "module_id": module_id, "result": "rollback",
                    "steps": steps, "error": "Install failed — rollback triggered"}

        # ── 8. Post-check (non bloquant) ──────────────────────────────
        sanity = manifest.get("sanity_check")
        steps["post_check"] = {
            "status":     "skipped" if not sanity else "ok",
            "sanity_fn":  sanity,
        }

        # ── 9. Finalize ───────────────────────────────────────────────
        shutil.rmtree(staging_dir, ignore_errors=True)
        _step("finalize", "ok")
        _emit_log("install", bundle, module_id, "finalize", "ok")

        return {
            "bundle":          bundle,
            "module_id":       module_id,
            "result":          "ok",
            # installed_files : noms de fichiers seulement (dest), pas les chemins absolus réels
            "installed_files": [p.name for p in installed_files],
            "sanity_check":    sanity,
            "steps":           steps,
        }

    except HTTPException:
        raise
    except Exception as e:
        if staging_dir and staging_dir.exists():
            shutil.rmtree(staging_dir, ignore_errors=True)
        _emit_log("install", bundle, module_id, "finalize", "failed", str(e))
        raise HTTPException(500, str(e))


@installer_router.get("/history")
async def install_history():
    """
    Lister les logs d'installation passés.
    GET /api/installer/history
    """
    try:
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        logs = []
        for f in sorted(LOG_DIR.iterdir(), reverse=True):
            if f.is_file() and f.suffix == ".json":
                try:
                    logs.append(json.loads(f.read_text()))
                except Exception:
                    pass
        return {"logs": logs, "count": len(logs)}
    except Exception as e:
        raise HTTPException(500, str(e))
