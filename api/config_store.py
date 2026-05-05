"""
api/config_store.py — LocalCMS M3 Config Store
Router FastAPI : /api/config
Spec: M3 V1

Intégration dans le backend LocalCMS existant :
    from api.config_store import config_router
    app.include_router(config_router, prefix="/api/config")

Variables d'environnement :
    LOCALCMS_SHARED_ROOT  (défaut: /shared)
"""

import json
import os
import re
from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# ─── Configuration ───────────────────────────────────────────────────────────

SHARED_ROOT      = Path(os.environ.get("LOCALCMS_SHARED_ROOT", "/shared"))
CONFIG_DIR       = SHARED_ROOT / "config"
VALID_ID_RE      = re.compile(r"^[a-z0-9_]+$")
MAX_CONFIG_BYTES = 256 * 1024  # 256 KB

config_router = APIRouter()


# ─── Modèles Pydantic ────────────────────────────────────────────────────────

class ConfigPayload(BaseModel):
    data: Dict[str, Any]


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _validate_id(module_id: str) -> None:
    if not module_id or not VALID_ID_RE.match(module_id):
        raise HTTPException(400, "module_id invalide — seuls [a-z0-9_] autorisés")


def _config_path(module_id: str) -> Path:
    return CONFIG_DIR / f"{module_id}.json"


# ─── Routes ──────────────────────────────────────────────────────────────────

@config_router.get("")
def list_configs():
    """
    Lister les configs sauvegardées.
    GET /api/config
    """
    try:
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        configs = [
            f.stem for f in sorted(CONFIG_DIR.iterdir())
            if f.is_file() and f.suffix == ".json" and VALID_ID_RE.match(f.stem)
        ]
        return {"configs": configs, "count": len(configs)}
    except Exception as e:
        raise HTTPException(500, str(e))


@config_router.get("/{module_id}")
def get_config(module_id: str):
    """
    Lire la config d'un module.
    GET /api/config/{module_id}
    """
    _validate_id(module_id)
    path = _config_path(module_id)
    if not path.exists():
        raise HTTPException(404, f"Aucune config sauvegardée pour : {module_id}")
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return {"module_id": module_id, "data": data}
    except Exception as e:
        raise HTTPException(500, str(e))


@config_router.post("/{module_id}")
def save_config(module_id: str, payload: ConfigPayload):
    """
    Sauvegarder la config d'un module.
    POST /api/config/{module_id}
    Body : { "data": { ... } }
    """
    _validate_id(module_id)
    raw = json.dumps(payload.data, ensure_ascii=False)
    if len(raw.encode("utf-8")) > MAX_CONFIG_BYTES:
        raise HTTPException(413, f"Config trop volumineuse (max {MAX_CONFIG_BYTES // 1024} KB)")
    try:
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        _config_path(module_id).write_text(raw, encoding="utf-8")
        return {"result": "ok", "module_id": module_id}
    except Exception as e:
        raise HTTPException(500, str(e))
