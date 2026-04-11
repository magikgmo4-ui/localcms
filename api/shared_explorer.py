"""
api/shared_explorer.py — MOD_SHARED_EXPLORER V1 Backend
Extension du backend LocalCMS existant (FastAPI)
Spec: MOD_SHARED_EXPLORER V1 LOCKED 2026-03-15

Intégration dans le backend LocalCMS existant :
    from api.shared_explorer import shared_router
    app.include_router(shared_router, prefix="/api/shared")

Variables d'environnement :
    LOCALCMS_SHARED_ROOT  (défaut: /shared)
"""

import os
import json
import mimetypes
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse
import logging

# ─── CONFIGURATION ───────────────────────────────────────────
SHARED_ROOT = Path(os.environ.get("LOCALCMS_SHARED_ROOT", "/shared")).resolve()
MAX_PREVIEW_BYTES = 5 * 1024 * 1024  # 5 MB — décision figée spec V1

# Whitelist complète V1
WHITELIST_EXTS = frozenset({
    # texte / config
    ".txt", ".md", ".json", ".yaml", ".yml", ".log", ".conf", ".ini", ".toml",
    # code
    ".py", ".sh", ".js", ".ts", ".sql", ".css", ".html",
    # image
    ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp",
    # archive (téléchargement seulement, non extraite)
    ".zip", ".tar", ".gz",
    # PDF (téléchargement seulement, pas de rendu)
    ".pdf",
})

PREVIEW_EXTS = frozenset({
    ".txt", ".md", ".json", ".yaml", ".yml", ".log", ".conf", ".ini", ".toml",
    ".py", ".sh", ".js", ".ts", ".sql", ".css", ".html",
})

# Noms de fichiers bloqués — .env exclu en V1
BLOCKED_NAMES = frozenset({".env"})

logger = logging.getLogger("shared_explorer")

# ─── LOGGING ────────────────────────────────────────────────
def _emit_log(
    action: str,
    path: str,
    result: str,
    error: Optional[str] = None,
    user_id: str = "cms_user",
) -> Dict[str, Any]:
    """
    Émet une entrée de log structurée.
    Format: { timestamp, user_id, action, path_relative, result, error? }
    """
    entry: Dict[str, Any] = {
        "timestamp":     datetime.utcnow().isoformat() + "Z",
        "user_id":       user_id,
        "action":        action,
        "path_relative": path,
        "result":        result,
    }
    if error:
        entry["error"] = error
    logger.info(json.dumps(entry))
    return entry


# ─── SÉCURITÉ — PATH RESOLUTION ─────────────────────────────
def _resolve_safe(relative: str) -> Path:
    """
    Résout un chemin relatif sous SHARED_ROOT.
    Protège contre :
    - path traversal  (../../etc/passwd)
    - symlinks sortant de /shared
    Lève HTTPException 403 ou 400 en cas de violation.
    """
    # Refuser les chemins absolus en entrée
    relative = relative.strip("/").strip()

    try:
        candidate = (SHARED_ROOT / relative).resolve()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid path")

    # Vérifier que le chemin résolu est bien sous la racine
    try:
        candidate.relative_to(SHARED_ROOT)
    except ValueError:
        _emit_log("path_violation", relative, "denied", "path_traversal_attempt")
        raise HTTPException(status_code=403, detail="Access denied")

    # Vérifier que le symlink ne sort pas de /shared
    if candidate.is_symlink():
        real = candidate.resolve()
        try:
            real.relative_to(SHARED_ROOT)
        except ValueError:
            _emit_log("access_denied", relative, "denied", "symlink_escape")
            raise HTTPException(status_code=403, detail="Access denied")

    return candidate


def _check_name_blocked(path: Path, rel: str) -> None:
    """Vérifie que le nom de fichier n'est pas dans la liste de blocage."""
    if path.name.lower() in BLOCKED_NAMES:
        _emit_log("access_denied", rel, "denied", "blocked_filename")
        raise HTTPException(status_code=403, detail="Access denied")


def _get_effective_ext(path: Path) -> str:
    """Retourne l'extension effective (.tar.gz inclus)."""
    name = path.name.lower()
    if name.endswith(".tar.gz"):
        return ".tar.gz"
    return path.suffix.lower()


# ─── HELPERS ─────────────────────────────────────────────────
def _build_entry(p: Path) -> Dict[str, Any]:
    """Construit un dict d'entrée fichier/dossier."""
    rel = str(p.relative_to(SHARED_ROOT)).replace("\\", "/")
    try:
        stat = p.stat()
        mtime = datetime.fromtimestamp(stat.st_mtime).isoformat()
        size  = stat.st_size if p.is_file() else None
    except PermissionError:
        mtime = None
        size  = None
    return {
        "name"  : p.name,
        "path"  : rel,
        "type"  : "dir" if p.is_dir() else "file",
        "size"  : size,
        "mtime" : mtime,
    }


# ─── ROUTER ──────────────────────────────────────────────────
# Monter avec : app.include_router(shared_router, prefix="/api/shared")
shared_router = APIRouter(tags=["shared-explorer"])


# ─── GET /api/shared/list ────────────────────────────────────
@shared_router.get("/list")
def list_directory(path: str = Query(default="")):
    """
    Liste le contenu d'un dossier sous /shared.
    Retourne : { path, entries: [{name, path, type, size, mtime}] }
    """
    target = _resolve_safe(path)

    if not target.exists():
        _emit_log("list", path or "/", "error", "not_found")
        raise HTTPException(status_code=404, detail="Path not found")

    if not target.is_dir():
        _emit_log("list", path or "/", "error", "not_a_directory")
        raise HTTPException(status_code=400, detail="Not a directory")

    try:
        entries = [_build_entry(child) for child in sorted(target.iterdir())]
    except PermissionError:
        _emit_log("list", path or "/", "denied", "permission_denied")
        raise HTTPException(status_code=403, detail="Access denied")

    _emit_log("list", path or "/", "ok")
    return {"path": path or "/", "entries": entries}


# ─── GET /api/shared/read ────────────────────────────────────
@shared_router.get("/read")
def read_file(path: str = Query(...)):
    """
    Retourne le contenu texte d'un fichier autorisé (≤ 5 MB).
    Retourne : { path, content, truncated }
    """
    target = _resolve_safe(path)
    _check_name_blocked(target, path)

    if not target.exists() or not target.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    ext = _get_effective_ext(target)

    # Extension hors whitelist preview → refus
    if ext not in PREVIEW_EXTS:
        _emit_log("access_denied", path, "denied", "preview_not_available_for_type")
        raise HTTPException(status_code=403, detail="Access denied")

    # Vérification taille avant lecture
    size = target.stat().st_size
    if size > MAX_PREVIEW_BYTES:
        _emit_log("read", path, "denied", "file_too_large")
        raise HTTPException(status_code=413, detail="File too large for preview (max 5 MB)")

    try:
        content = target.read_text(encoding="utf-8", errors="replace")
    except PermissionError:
        _emit_log("read", path, "denied", "permission_denied")
        raise HTTPException(status_code=403, detail="Access denied")

    _emit_log("read", path, "ok")
    return {"path": path, "content": content, "truncated": False}


# ─── GET /api/shared/download ────────────────────────────────
@shared_router.get("/download")
def download_file(path: str = Query(...)):
    """
    Télécharge un fichier autorisé (whitelist).
    Retourne : FileResponse
    """
    target = _resolve_safe(path)
    _check_name_blocked(target, path)

    if not target.exists() or not target.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    ext = _get_effective_ext(target)

    # Extension hors whitelist → refus téléchargement
    if ext not in WHITELIST_EXTS:
        _emit_log("access_denied", path, "denied", "extension_not_downloadable")
        raise HTTPException(status_code=403, detail="Access denied")

    _emit_log("download", path, "ok")
    media_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
    return FileResponse(
        path        = str(target),
        filename    = target.name,
        media_type  = media_type,
    )


# ─── GET /api/shared/search ──────────────────────────────────
@shared_router.get("/search")
def search_files(
    q     : Optional[str] = Query(default=None, description="Filtre nom"),
    ext   : Optional[str] = Query(default=None, description="Filtre extension (sans point)"),
    from_ : Optional[str] = Query(default=None, alias="from", description="Date min ISO"),
    to    : Optional[str] = Query(default=None, description="Date max ISO"),
):
    """
    Recherche dans /shared par nom, extension, plage de dates.
    PAS de full-text — nom + extension + date seulement (décision figée V1).
    Retourne : { results: [...entries], total: int }
    """
    if not any([q, ext, from_, to]):
        raise HTTPException(status_code=400, detail="At least one search parameter required")

    # Parse dates
    from_dt: Optional[datetime] = None
    to_dt:   Optional[datetime] = None
    try:
        if from_: from_dt = datetime.fromisoformat(from_)
        if to:    to_dt   = datetime.fromisoformat(to)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {e}")

    ext_filter = ext.lower().lstrip(".") if ext else None

    results: List[Dict[str, Any]] = []

    try:
        for p in SHARED_ROOT.rglob("*"):
            if not p.is_file():
                continue
            # Filtre nom
            if q and q.lower() not in p.name.lower():
                continue
            # Filtre extension
            if ext_filter:
                file_ext = p.suffix.lower().lstrip(".")
                if file_ext != ext_filter:
                    continue
            # Filtre dates
            try:
                mtime = datetime.fromtimestamp(p.stat().st_mtime)
            except PermissionError:
                continue
            if from_dt and mtime < from_dt:
                continue
            if to_dt   and mtime > to_dt:
                continue

            results.append(_build_entry(p))

    except PermissionError:
        _emit_log("search", q or "*", "denied", "permission_denied")
        raise HTTPException(status_code=403, detail="Access denied")

    _emit_log("search", q or "*", "ok")
    # Limite résultats à 200 en V1
    return {"results": results[:200], "total": len(results)}


# ─── AUCUNE ROUTE D'ÉCRITURE ─────────────────────────────────
# Pas de POST, PUT, PATCH, DELETE dans ce module.
# Toute tentative d'ajout doit être rejetée en code review
# (cf. critère V13 : grep POST/PUT/DELETE/PATCH dans le scope).
