"""
main.py — LocalCMS Host Minimal V101
Backend hôte FastAPI pour M1 (shared_explorer) et M2 (cms_installer).

Ce fichier est le point d'entrée unique du serveur de validation.
Il ne contient aucune logique hors du montage des routers et du health check.

Lancement :
    cd localcms
    uvicorn main:app --host 0.0.0.0 --port 8000

Routes montées :
    /api/shared/*    → shared_explorer (M1)
    /api/installer/* → cms_installer (M2)
    /health          → health check
"""

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Imports exacts tirés des docstrings des fichiers sources — ne pas modifier
from api.shared_explorer import shared_router
from api.cms_installer import installer_router

app = FastAPI(
    title="LocalCMS Host",
    description="Hôte minimal de validation pour M1 (shared_explorer) et M2 (cms_installer).",
    version="1.0.1",
)

# ── M1 : Shared Explorer ──────────────────────────────────────────────────────
# Préfixe défini ici conformément à la doc d'intégration de shared_explorer.py
app.include_router(shared_router, prefix="/api/shared")

# ── M2 : CMS Installer ───────────────────────────────────────────────────────
# Préfixe défini ici conformément à la doc d'intégration de cms_installer.py
app.include_router(installer_router, prefix="/api/installer")


# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}


# ── Frontend statique ─────────────────────────────────────────────────────────
# Sert localcms-v5.html et modules/*.js depuis le même port (8000)
# afin que les URLs relatives /api/... et /modules/... résolvent correctement.
@app.get("/")
def serve_frontend():
    return FileResponse("localcms-v5.html")

app.mount("/modules", StaticFiles(directory="modules"), name="modules")
