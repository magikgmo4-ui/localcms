#!/usr/bin/env bash
# run.sh — LocalCMS Host Minimal (Linux / macOS)
# Lance le host FastAPI avec uvicorn sur le port 8000.
# Prérequis : pip install -r requirements.txt depuis ce dossier.

set -e
cd "$(dirname "$0")"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
