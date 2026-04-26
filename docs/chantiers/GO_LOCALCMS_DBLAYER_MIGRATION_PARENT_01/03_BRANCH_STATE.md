# 03_BRANCH_STATE — GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01

## État branche

| Champ | Valeur |
|---|---|
| Machine | db-layer (/home/ghost/localcms) |
| Repo path | /home/ghost/localcms |
| Remote | git@github.com:magikgmo4-ui/localcms.git |
| Branche source | main (HEAD: 9aa4c3f) |
| Branche chantier | go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01 |
| HEAD chantier | 588d7c6 |
| Date baseline | 2026-04-26 |
| Opérateur | ghost |
| Agent | Claude Code CLI (claude-sonnet-4-6) |

## Commandes de preuve exécutées

```
pwd → /home/ghost/localcms
git status --short --branch → ## go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01 (clean)
git remote -v → origin git@github.com:magikgmo4-ui/localcms.git
git branch -vv → * go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01 588d7c6
git log --oneline -5 → 588d7c6 docs: open LocalCMS db-layer Claude CLI migration
```

## Stack réelle détectée

| Composant | Version |
|---|---|
| Python | 3.13.12 |
| pip | 26.0.1 |
| fastapi | 0.136.1 |
| uvicorn | 0.46.0 |
| pydantic | 2.13.3 |
| aiofiles | 25.1.0 |
| Node.js | 22.22.2 |
| npm | 11.13.0 |

Framework : FastAPI + uvicorn (ASGI)
Point d'entrée : main.py → /health, /api/shared/*, /api/installer/*, /
Frontend : localcms-v5.html (fichier statique servi sur /)
Modules JS : modules/ (StaticFiles sur /modules)

## Résultat réel — Smoke Baseline PASS

### Python (stubs FastAPI — sans serveur)

| Test | Résultat |
|---|---|
| integration_test_pipeline.py | 15/15 PASS |
| integration_test_shared_explorer.py | 23/23 PASS |
| **Sous-total Python** | **38/38** |

### HTTP live (/health)

| Test | Résultat |
|---|---|
| uvicorn main:app --port 8000 → démarrage | OK |
| curl http://localhost:8000/health → {"status":"ok"} | PASS |

### JavaScript (mode mock — sans serveur)

| Test | Résultat |
|---|---|
| shared-explorer.smoke.js | 6/6 PASS |
| cms-installer.smoke.js | 7/7 PASS |
| smoke_cond_valid.js | 26/26 PASS |
| apps-config-adopt.test.js | 75/75 PASS |
| cms-installer.test.js | 15/15 PASS |
| shared-explorer.test.js | 13/13 PASS |
| data-sources-adopt.test.js | 52/52 PASS |
| devtools-config-adopt.test.js | 69/69 PASS |
| env-global-adopt.test.js | 49/49 PASS |
| ia-config-adopt.test.js | 73/73 PASS |
| machines-config-adopt.test.js | 84/84 PASS |
| memory-view-adopt.test.js | 38/38 PASS |
| queue-config-adopt.test.js | 50/50 PASS |
| sec-config-adopt.test.js | 50/50 PASS |
| **Sous-total JS** | **607/607** |

### TOTAL BASELINE

**645/645 assertions — PASS**

## Prérequis installés durant le baseline

Les dépendances Python n'étaient pas installées avant ce baseline.
Commande exécutée (non destructive, dépendances applicatives uniquement) :

```bash
pip3 install fastapi uvicorn pydantic aiofiles
```

Versions installées conformes à requirements.txt (voir tableau stack ci-dessus).

## Limites restantes

- `.env` non configuré (LOCALCMS_SHARED_ROOT et LOCALCMS_MODULES_DIR vides).
- Tests Python d'intégration tournent avec stubs FastAPI — pas de test live HTTP complet sur /api/shared/* et /api/installer/*.
- Tests JS en mode mock uniquement — pas de test live contre backend réel.
- `tests/*.adopt.test.js` ne peuvent pas être appelés via glob shell (pas de package.json, pas de runner).
- localcms-v5.html non testé (frontend statique, non audité dans ce baseline).

## GAP_INDEXATION

| Champ | Valeur |
|---|---|
| Chemin chantier | docs/chantiers/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01/ |
| Branche | go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01 |
| HEAD | 588d7c6 |
| Prochain GO logique | GO_LOCALCMS_DBLAYER_ENV_SETUP_01 — configurer .env (SHARED_ROOT, MODULES_DIR) puis valider tests live HTTP |

## Prochain GO logique

`GO_LOCALCMS_DBLAYER_ENV_SETUP_01`

Objectif : créer `.env` avec valeurs réelles, relancer les smokes en mode LIVE (BACKEND_URL=http://localhost:8000), valider les routes /api/shared/* et /api/installer/* avec un backend réel.

## Point de reprise

```bash
cd /home/ghost/localcms
git status --short --branch
# → go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01 (clean)
# Baseline : 645/645 PASS
# Étape suivante : configurer .env → GO_LOCALCMS_DBLAYER_ENV_SETUP_01
```
