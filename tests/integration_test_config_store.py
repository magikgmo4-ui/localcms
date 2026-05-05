"""
tests/integration_test_config_store.py
LocalCMS · GO_LOCALCMS_DBLAYER_V3_CONFIG_STORE_API_01

Tests d'intégration backend pour api/config_store.py.
Pattern : appel direct des fonctions backend sans serveur FastAPI live.
Même paradigme que tests/integration_test_shared_explorer.py.

Routes couvertes :
  list_configs  — répertoire vide / après saves
  get_config    — lecture correcte / module inexistant / module_id invalide
  save_config   — sauvegarde valide / écrasement / oversized

Sans FastAPI live : stubs injectés via sys.modules avant import.
"""

import os
import sys
import types
import shutil
import uuid
from pathlib import Path

# ─── Stubs FastAPI (fastapi absent en env test) ───────────────────────────

class HTTPException(Exception):
    def __init__(self, status_code, detail=""):
        self.status_code = status_code
        self.detail      = detail
        super().__init__(f"HTTP {status_code}: {detail}")

class _APIRouter:
    def __init__(self, **kw): pass
    def get(self, *a, **kw):  return lambda f: f
    def post(self, *a, **kw): return lambda f: f

_fastapi_mod               = types.ModuleType("fastapi")
_fastapi_mod.APIRouter     = _APIRouter
_fastapi_mod.HTTPException = HTTPException

sys.modules.setdefault("fastapi", _fastapi_mod)

# ─── Racine de test isolée ────────────────────────────────────────────────

TEST_ROOT   = Path(f"/tmp/localcms_cs_integ_{uuid.uuid4().hex[:8]}")
SHARED_ROOT = TEST_ROOT / "shared"
SHARED_ROOT.mkdir(parents=True, exist_ok=True)

os.environ["LOCALCMS_SHARED_ROOT"] = str(SHARED_ROOT)

# ─── Import du module backend ─────────────────────────────────────────────

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import api.config_store as cs

# Monkeypatch CONFIG_DIR → répertoire de test isolé
cs.CONFIG_DIR = SHARED_ROOT / "config"

# ─── Mini runner (identique à integration_test_shared_explorer.py) ───────

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

# ─── Helper ───────────────────────────────────────────────────────────────

def _payload(data):
    return cs.ConfigPayload(data=data)

# ─══════════════════════════════════════════════════════════════════════════
# BLOC C — config_store (8 tests)
# ═══════════════════════════════════════════════════════════════════════════

def test_c1():
    """C1 — list_configs : répertoire vide → configs=[], count=0."""
    r = cs.list_configs()
    a(isinstance(r, dict),        "doit retourner un dict")
    a("configs" in r,             "clé configs absente")
    a("count"   in r,             "clé count absente")
    a(isinstance(r["configs"], list), "configs doit être une liste")
    a(r["count"] == 0,            f"count attendu 0, obtenu {r['count']}")
t("C1 — list_configs : répertoire vide", test_c1)

def test_c2():
    """C2 — save_config valide → result=ok, module_id correct."""
    r = cs.save_config("env_global", _payload({"site_name": "test", "port": 8080}))
    a(r["result"]    == "ok",         f"result attendu 'ok', obtenu {r['result']!r}")
    a(r["module_id"] == "env_global", f"module_id incorrect: {r['module_id']!r}")
t("C2 — save_config : sauvegarde valide", test_c2)

def test_c3():
    """C3 — get_config après save → data correspond."""
    cs.save_config("test_mod", _payload({"key": "val", "num": 42}))
    r = cs.get_config("test_mod")
    a(r["module_id"]      == "test_mod", f"module_id: {r['module_id']!r}")
    a("data" in r,                       "clé data absente")
    a(r["data"]["key"]    == "val",      f"key incorrect: {r['data']['key']!r}")
    a(r["data"]["num"]    == 42,         f"num incorrect: {r['data']['num']!r}")
t("C3 — get_config : lecture après save", test_c3)

def test_c4():
    """C4 — list_configs après saves → modules apparaissent dans la liste."""
    r = cs.list_configs()
    a(len(r["configs"]) >= 2,          f"au moins 2 configs attendues, obtenu {r['configs']}")
    a("env_global" in r["configs"],    f"env_global absent: {r['configs']}")
    a("test_mod"   in r["configs"],    f"test_mod absent: {r['configs']}")
    a(r["count"] == len(r["configs"]), "count incohérent avec la liste")
t("C4 — list_configs : configs présentes après saves", test_c4)

def test_c5():
    """C5 — module_id invalide → 400."""
    raises(lambda: cs.get_config("invalid-id!"),              400)
    raises(lambda: cs.save_config("UPPER", _payload({})),     400)
    raises(lambda: cs.get_config("../traversal"),              400)
t("C5 — module_id invalide → 400", test_c5)

def test_c6():
    """C6 — get_config module inexistant → 404."""
    raises(lambda: cs.get_config("module_nexiste_pas_xyz"), 404)
t("C6 — get_config : module inexistant → 404", test_c6)

def test_c7():
    """C7 — payload trop volumineux → 413."""
    big_data = {"key": "x" * (256 * 1024 + 1)}
    raises(lambda: cs.save_config("test_big", _payload(big_data)), 413)
t("C7 — save_config : payload oversized → 413", test_c7)

def test_c8():
    """C8 — save deux fois → deuxième valeur écrase la première."""
    cs.save_config("overwrite_test", _payload({"v": 1}))
    cs.save_config("overwrite_test", _payload({"v": 2}))
    r = cs.get_config("overwrite_test")
    a(r["data"]["v"] == 2, f"valeur attendue 2, obtenu {r['data']['v']}")
t("C8 — save_config : écrasement de config existante", test_c8)

# ─── Cleanup ──────────────────────────────────────────────────────────────

shutil.rmtree(TEST_ROOT, ignore_errors=True)

# ─── Résumé ───────────────────────────────────────────────────────────────

print()
print("Config Store Backend — Tests d'intégration")
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
