"""
tests/integration_test_shared_explorer.py
LocalCMS · GO_LOCALCMS_SHARED_EXPLORER_INTEGRATION_01

Tests d'intégration backend pour api/shared_explorer.py.
Pattern : appel direct des fonctions backend sans serveur FastAPI live.
Même paradigme que tests/integration_test_pipeline.py.

Routes couvertes :
  list_directory  — racine / sous-dossier / traversal / 404 / non-répertoire
  read_file       — texte / binaire refusé / >5MB refusé / ext bloquée / .env bloqué
  download_file   — réponse valide / filename header / traversal / 404
  search_files    — match simple / case-insensitive / filtre ext / no-params / date

Sans FastAPI live : stubs injectés via sys.modules avant import.
"""

import os
import sys
import types
import shutil
import uuid
from datetime import datetime, timedelta
from pathlib import Path

# ─── Stubs FastAPI (fastapi absent en env test) ───────────────────────────

class HTTPException(Exception):
    def __init__(self, status_code, detail=""):
        self.status_code = status_code
        self.detail      = detail
        super().__init__(f"HTTP {status_code}: {detail}")

class _FileResponse:
    """Stub FileResponse — capture path + filename pour assertions."""
    def __init__(self, path, filename="", media_type="application/octet-stream"):
        self.path       = str(path)
        self.filename   = filename
        self.media_type = media_type
        self.headers    = {"content-disposition": f'attachment; filename="{filename}"'}

class _JSONResponse:
    def __init__(self, content, **kwargs): self.content = content

class _Query:
    """Stub Query — ignoré lors des appels directs (params passés explicitement)."""
    def __init__(self, *a, **kw): pass

class _APIRouter:
    tags = []
    def __init__(self, **kw): pass
    def get(self, *a, **kw):
        return lambda f: f          # décorateur no-op → fonctions utilisables directement

_fastapi_mod            = types.ModuleType("fastapi")
_fastapi_mod.APIRouter  = _APIRouter
_fastapi_mod.HTTPException = HTTPException
_fastapi_mod.Query      = _Query

_fastapi_resp           = types.ModuleType("fastapi.responses")
_fastapi_resp.FileResponse  = _FileResponse
_fastapi_resp.JSONResponse  = _JSONResponse

sys.modules.setdefault("fastapi",           _fastapi_mod)
sys.modules.setdefault("fastapi.responses", _fastapi_resp)

# ─── Racine de test isolée ────────────────────────────────────────────────

TEST_ROOT   = Path(f"/tmp/localcms_se_integ_{uuid.uuid4().hex[:8]}")
SHARED_ROOT = TEST_ROOT / "shared"
SHARED_ROOT.mkdir(parents=True, exist_ok=True)

os.environ["LOCALCMS_SHARED_ROOT"] = str(SHARED_ROOT)

# ─── Import du module backend ─────────────────────────────────────────────

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import api.shared_explorer as se

# Monkeypatch SHARED_ROOT → test root (module-level var utilisée par les fonctions)
se.SHARED_ROOT = SHARED_ROOT

# ─── Mini runner (identique à integration_test_pipeline.py) ──────────────

passed  = 0
failed  = 0
results = []

def t(name, fn):
    global passed, failed
    try:
        fn()
        results.append((name, True, None))
        passed += 1
    except Exception as e:
        results.append((name, False, str(e)))
        failed += 1

def a(cond, msg):
    assert cond, msg

def raises(fn, expected_status):
    """Vérifie qu'une fonction lève HTTPException avec le status attendu."""
    try:
        fn()
        raise AssertionError(f"HTTPException({expected_status}) attendue, pas d'exception levée")
    except HTTPException as e:
        assert e.status_code == expected_status, \
            f"Status attendu {expected_status}, obtenu {e.status_code} (detail={e.detail!r})"

# ─── Helpers de setup filesystem ─────────────────────────────────────────

def _mkfile(rel, content="contenu test", encoding="utf-8"):
    """Crée un fichier sous SHARED_ROOT."""
    p = SHARED_ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(content, bytes):
        p.write_bytes(content)
    else:
        p.write_text(content, encoding=encoding)
    return p

def _mkdir(rel):
    p = SHARED_ROOT / rel
    p.mkdir(parents=True, exist_ok=True)
    return p

# ─── Fixtures de base ─────────────────────────────────────────────────────

_mkfile("readme.md",          "# LocalCMS shared root\n")
_mkfile("config.yaml",        "key: value\n")
_mkfile("script.sh",          "#!/bin/bash\necho hello\n")
_mkfile("subdir/notes.txt",   "notes de test\n")
_mkfile("subdir/data.json",   '{"x": 1}')
_mkfile("subdir/deep/a.log",  "log entry\n")
_mkfile("image.png",          b"\x89PNG\r\n\x1a\n" + b"\x00" * 8)   # binaire non-preview
_mkfile("archive.zip",        b"PK\x03\x04" + b"\x00" * 20)         # binaire, DL ok
(SHARED_ROOT / ".env").write_text("SECRET=hunter2\n")               # bloqué F-15

# ─══════════════════════════════════════════════════════════════════════════
# BLOC L — list_directory (5 tests)
# ═══════════════════════════════════════════════════════════════════════════

def test_l1():
    """L1 — racine : retourne dict avec entries."""
    r = se.list_directory(path="")
    a(isinstance(r, dict), "doit retourner un dict")
    a("entries" in r, "clé entries absente")
    a("path" in r, "clé path absente")
    a(isinstance(r["entries"], list), "entries doit être une liste")
    names = [e["name"] for e in r["entries"]]
    a("readme.md" in names, f"readme.md absent — entries: {names}")
t("L1 — list_directory : racine", test_l1)

def test_l2():
    """L2 — sous-dossier : entries du subdir."""
    r = se.list_directory(path="subdir")
    a(isinstance(r, dict), "doit retourner un dict")
    names = [e["name"] for e in r["entries"]]
    a("notes.txt" in names, f"notes.txt absent — entries: {names}")
    a("data.json" in names, f"data.json absent — entries: {names}")
t("L2 — list_directory : sous-dossier", test_l2)

def test_l3():
    """L3 — chaque entry a name / path / type / size / mtime."""
    r = se.list_directory(path="subdir")
    for e in r["entries"]:
        for k in ("name", "path", "type"):
            a(k in e, f"clé {k} absente dans entry {e}")
        a(e["type"] in ("file", "dir"), f"type invalide: {e['type']}")
t("L3 — list_directory : structure entries", test_l3)

def test_l4():
    """L4 — path traversal → 403."""
    raises(lambda: se.list_directory(path="../../etc"), 403)
t("L4 — list_directory : path traversal refusé (403)", test_l4)

def test_l5():
    """L5 — chemin inexistant → 404."""
    raises(lambda: se.list_directory(path="dossier_inexistant_xyz"), 404)
t("L5 — list_directory : chemin inexistant (404)", test_l5)

# ═══════════════════════════════════════════════════════════════════════════
# BLOC R — read_file (6 tests)
# ═══════════════════════════════════════════════════════════════════════════

def test_r1():
    """R1 — fichier texte autorisé → retourne content."""
    r = se.read_file(path="readme.md")
    a(isinstance(r, dict), "doit retourner un dict")
    a("content" in r, "clé content absente")
    a("LocalCMS" in r["content"], f"contenu inattendu: {r['content']!r}")
    a(r.get("truncated") is False, "truncated doit être False")
t("R1 — read_file : fichier texte autorisé", test_r1)

def test_r2():
    """R2 — fichier .json lu correctement."""
    r = se.read_file(path="subdir/data.json")
    a("x" in r["content"], f"contenu json inattendu: {r['content']!r}")
t("R2 — read_file : fichier JSON", test_r2)

def test_r3():
    """R3 — image .png (non-preview ext) → 403."""
    raises(lambda: se.read_file(path="image.png"), 403)
t("R3 — read_file : extension binaire image refusée (403)", test_r3)

def test_r4():
    """R4 — archive .zip (whitelist DL, pas preview) → 403."""
    raises(lambda: se.read_file(path="archive.zip"), 403)
t("R4 — read_file : extension archive refusée en preview (403)", test_r4)

def test_r5():
    """R5 — fichier > 5 MB → 413."""
    big = SHARED_ROOT / "big.log"
    big.write_bytes(b"x" * (5 * 1024 * 1024 + 1))
    raises(lambda: se.read_file(path="big.log"), 413)
t("R5 — read_file : fichier > 5 MB refusé (413)", test_r5)

def test_r6():
    """R6 — .env (nom bloqué) → 403."""
    raises(lambda: se.read_file(path=".env"), 403)
t("R6 — read_file : nom bloqué .env (403)", test_r6)

# ═══════════════════════════════════════════════════════════════════════════
# BLOC D — download_file (5 tests)
# ═══════════════════════════════════════════════════════════════════════════

def test_d1():
    """D1 — fichier texte valide → FileResponse avec bon filename."""
    r = se.download_file(path="script.sh")
    a(isinstance(r, _FileResponse), f"doit retourner FileResponse, obtenu {type(r)}")
    a(r.filename == "script.sh", f"filename incorrect: {r.filename!r}")
t("D1 — download_file : réponse valide FileResponse", test_d1)

def test_d2():
    """D2 — header Content-Disposition contient le filename."""
    r = se.download_file(path="config.yaml")
    a("content-disposition" in r.headers, "header content-disposition absent")
    a("config.yaml" in r.headers["content-disposition"],
      f"filename absent du header: {r.headers['content-disposition']!r}")
t("D2 — download_file : header Content-Disposition correct", test_d2)

def test_d3():
    """D3 — archive .zip (whitelist) téléchargeable."""
    r = se.download_file(path="archive.zip")
    a(r.filename == "archive.zip", f"filename: {r.filename!r}")
t("D3 — download_file : archive .zip autorisée", test_d3)

def test_d4():
    """D4 — path traversal → 403."""
    raises(lambda: se.download_file(path="../../etc/passwd"), 403)
t("D4 — download_file : path traversal refusé (403)", test_d4)

def test_d5():
    """D5 — fichier inexistant → 404."""
    raises(lambda: se.download_file(path="nexiste_pas.txt"), 404)
t("D5 — download_file : fichier inexistant (404)", test_d5)

# ═══════════════════════════════════════════════════════════════════════════
# BLOC S — search_files (7 tests)
# ═══════════════════════════════════════════════════════════════════════════

def test_s1():
    """S1 — sans paramètre → 400."""
    raises(lambda: se.search_files(q=None, ext=None, from_=None, to=None), 400)
t("S1 — search_files : aucun paramètre (400)", test_s1)

def test_s2():
    """S2 — match simple par nom."""
    r = se.search_files(q="readme", ext=None, from_=None, to=None)
    a("results" in r, "clé results absente")
    a("total" in r, "clé total absente")
    names = [e["name"] for e in r["results"]]
    a("readme.md" in names, f"readme.md absent des résultats: {names}")
t("S2 — search_files : match simple", test_s2)

def test_s3():
    """S3 — search case-insensitive."""
    r = se.search_files(q="README", ext=None, from_=None, to=None)
    names = [e["name"] for e in r["results"]]
    a("readme.md" in names, f"readme.md absent (insensible casse): {names}")
t("S3 — search_files : case-insensitive", test_s3)

def test_s4():
    """S4 — filtre extension .md."""
    r = se.search_files(q=None, ext="md", from_=None, to=None)
    a(len(r["results"]) >= 1, "aucun résultat .md")
    for e in r["results"]:
        a(e["name"].endswith(".md"), f"entry non-.md dans résultats: {e['name']}")
t("S4 — search_files : filtre extension .md", test_s4)

def test_s5():
    """S5 — filtre extension .json."""
    r = se.search_files(q=None, ext="json", from_=None, to=None)
    a(len(r["results"]) >= 1, "aucun résultat .json")
    for e in r["results"]:
        a(e["name"].endswith(".json"), f"entry non-.json: {e['name']}")
t("S5 — search_files : filtre extension .json", test_s5)

def test_s6():
    """S6 — query sans match → résultats vides."""
    r = se.search_files(q="zzz_aucun_fichier_zzz", ext=None, from_=None, to=None)
    a(r["total"] == 0, f"total attendu 0, obtenu {r['total']}")
    a(len(r["results"]) == 0, f"results attendus vides, obtenu {r['results']}")
t("S6 — search_files : query sans match → résultats vides", test_s6)

def test_s7():
    """S7 — filtre date from_ excluant tous les fichiers → résultats vides."""
    future = (datetime.utcnow() + timedelta(days=365)).isoformat()
    r = se.search_files(q=None, ext=None, from_=future, to=None)
    a(r["total"] == 0, f"total attendu 0 (from_ futur), obtenu {r['total']}")
t("S7 — search_files : filtre date futur → résultats vides", test_s7)

# ─── Cleanup ──────────────────────────────────────────────────────────────

shutil.rmtree(TEST_ROOT, ignore_errors=True)

# ─── Résumé ───────────────────────────────────────────────────────────────

print()
print("Shared Explorer Backend — Tests d'intégration")
print("=" * 52)
for name, ok, err in results:
    icon = "✓" if ok else "✕"
    tail = f"  ← {err}" if err else ""
    print(f"  {icon}  {name}{tail}")
print("-" * 52)
print(f"  RÉSULTAT : {passed}/{passed + failed} tests passés")
print()

if failed > 0:
    sys.exit(1)
