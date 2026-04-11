@echo off
REM run.bat — LocalCMS Host Minimal (Windows)
REM Lance le host FastAPI avec uvicorn sur le port 8000.
REM Prérequis : pip install -r requirements.txt depuis ce dossier.

cd /d "%~dp0"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
