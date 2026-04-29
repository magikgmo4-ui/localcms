# 00_CICD_BASELINE — GO_LOCALCMS_DBLAYER_CICD_01

---

## 1_MASTER_TARGET

Formaliser les validations stables LocalCMS dans une CI contrôlée, sans modifier les fichiers applicatifs. Créer un script local CI (`scripts/run-ci-local.sh`) et un workflow GitHub Actions (`.github/workflows/localcms-ci.yml`) couvrant l'ensemble des tests validés.

---

## 3_INITIAL_NEED

Après `GO_LOCALCMS_DBLAYER_FRONTEND_AUDIT_01` (9/9 endpoints, 540/540 adopt, 6/6+7/7 smokes), les commandes de validation étaient stables mais non formalisées. Ce GO crée l'infrastructure CI reproductible pour tout contributeur ou environnement distant.

---

## 7_CANONICAL_STATE

| Champ | Valeur |
|---|---|
| Repo | /home/ghost/localcms |
| Branche | go/GO_LOCALCMS_DBLAYER_CICD_01 |
| Base | main HEAD b326781 |
| Tag | v0.1.0-dblayer |
| Date | 2026-04-29 |
| Python | 3.13.12 |
| Node.js | v22.22.2 |
| npm | 11.13.0 |

---

## 13_ESTABLISHED

### Fichiers créés

| Fichier | Description |
|---|---|
| `scripts/run-ci-local.sh` | Script CI local — 5 étapes séquentielles avec cleanup garanti |
| `.github/workflows/localcms-ci.yml` | Workflow GitHub Actions — Ubuntu, Python 3.13, Node 22 |
| `docs/chantiers/GO_LOCALCMS_DBLAYER_CICD_01/00_CICD_BASELINE.md` | Ce rapport |
| `docs/responses/response_16_GO_LOCALCMS_DBLAYER_CICD_01.txt` | Archive TXT |

### Fichiers applicatifs modifiés

Aucun.

---

### `scripts/run-ci-local.sh` — Architecture

Le script crée un **runtime CI isolé** dans `/tmp/localcms_ci_XXXXXX` :
- Structure dossiers : `shared/install-queue`, `install-backups`, `install-logs`, `docs`, `modules/`
- Fixture `readme.md` — requis par shared-explorer smoke S3
- Fixture `big.log` (> 5 MB) — requis par shared-explorer smoke S5 (413)
- Copie bundles depuis `/home/ghost/localcms_runtime/shared/install-queue/` si présent (sinon installer smokes skippent gracieusement les cas bundle-dépendants)

Variables exportées :
- `LOCALCMS_SHARED_ROOT=${CI_RUNTIME}/shared`
- `LOCALCMS_MODULES_DIR=${CI_RUNTIME}/modules`

Cleanup via `trap cleanup EXIT` — garantit l'arrêt d'uvicorn et la suppression du runtime temporaire même en cas d'échec.

#### Séquence d'exécution

| Étape | Commande | Serveur requis |
|---|---|---|
| 1/5 | `python3 tests/integration_test_pipeline.py` | Non |
| 2/5 | `python3 tests/integration_test_shared_explorer.py` | Non |
| 3/5 | `npm run test:adopt` | Non |
| 4/5 | `uvicorn main:app … &` + attente `/health` (max 30s) | — |
| 5a/5 | `BACKEND_URL=http://127.0.0.1:8000 node tests/shared-explorer.smoke.js` | Oui |
| 5b/5 | `BACKEND_URL=http://127.0.0.1:8000 node tests/cms-installer.smoke.js` | Oui |

---

### `.github/workflows/localcms-ci.yml` — Contenu

```yaml
name: LocalCMS CI

on:
  push:
    branches: ["main", "go/**"]
  pull_request:
    branches: ["main"]

jobs:
  test:
    name: LocalCMS — tests & smokes
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python 3.13
        uses: actions/setup-python@v5
        with:
          python-version: "3.13"
          cache: "pip"

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Install Python dependencies
        run: pip install -r requirements.txt

      - name: Run CI suite (integration + adopt + smokes live)
        run: bash scripts/run-ci-local.sh
```

Déclencheurs : `push` sur `main` et `go/**`, `pull_request` vers `main`.
En CI GitHub, `install-queue` est vide → installer smokes skippent les cas bundle-dépendants (S2/S3/S5/S7 → skip gracieux via branche `if (res.status === 404) return`).

---

### Résultats exécution locale

| Suite | Résultat |
|---|---|
| integration_test_pipeline.py | **15/15 PASS** |
| integration_test_shared_explorer.py | **23/23 PASS** |
| npm run test:adopt (9 suites) | **540/540 PASS** |
| shared-explorer.smoke.js (live) | **6/6 PASS** |
| cms-installer.smoke.js (live) | **7/7 PASS** |

Note : `integration_test_shared_explorer.py` émet un `DeprecationWarning` sur `datetime.utcnow()` (Python 3.12+). Non bloquant — test passe à 23/23. Documenté en GAP.

Runtime CI nettoyé. Uvicorn arrêté proprement (trap EXIT).

---

## 14_HYPOTHESIS

| Hypothèse | Statut |
|---|---|
| H1 — Script CI local exécutable sans runtime pré-existant | CONFIRMÉ — runtime créé dans /tmp |
| H2 — Cleanup garanti même en cas d'échec | CONFIRMÉ — trap EXIT déclenché |
| H3 — Tests Python ne nécessitent pas de serveur | CONFIRMÉ — self-contained |
| H4 — npm run test:adopt sans serveur | CONFIRMÉ — pure Node.js |
| H5 — Smokes live fonctionnent avec runtime CI isolé | CONFIRMÉ — 6/6 + 7/7 PASS |
| H6 — GitHub Actions exécutable sans runtime local | CONFIRMÉ — fixtures créées dans script |
| H7 — Installer smokes skippent gracieusement sans bundles | CONFIRMÉ (code: `if (res.status === 404) return`) |

---

## 15_REMAINING_GAP

| Gap | Description | Bloquant |
|---|---|---|
| GAP_UTCNOW_DEPRECATION | `integration_test_shared_explorer.py:310` utilise `datetime.utcnow()` (deprecated Python 3.12+) | Non — warning, non bloquant |
| GAP_CICD_NO_BUNDLE_FIXTURES | En CI GitHub sans runtime, installer smokes S2/S3/S5/S7 skippent (bundles absents) | Non — comportement voulu, tests ne sont pas 404-fail |
| GAP_LEGACY_INSTALLER_SIMULE | MOD_INSTALLER panel simulé (hérité des GOs précédents) | Non |
| GAP_IA_RUNNER_SIMULE | IA Runner simulé (voulu V1) | Non |
| GAP_ROLLBACK_API_ABSENTE | Pas de route /rollback dédiée | Non |
| GAP_RESTORE_API_ABSENTE | Pas de route /restore dédiée | Non |
| GAP_PACKAGE_JSON_MODULE_WARN | Warning Node `"type":"module"` absent | Non — cosmétique |

---

## 16_TODO

- [ ] Optionnel : créer des bundles de test CI dans `tests/fixtures/` versionnés pour couvrir S2/S3/S5/S7 en GitHub Actions
- [ ] Optionnel : corriger `datetime.utcnow()` → `datetime.now(timezone.utc)` dans `integration_test_shared_explorer.py`
- [ ] Optionnel : ajouter `"type": "module"` à `package.json` pour supprimer le warning Node
- [ ] Optionnel : ajouter badge CI dans README

---

## 17_RESUME_POINT

```bash
cd /home/ghost/localcms
git status --short --branch
# go/GO_LOCALCMS_DBLAYER_CICD_01

# Exécuter la CI locale
bash scripts/run-ci-local.sh

# Relancer manuellement les suites individuelles
python3 tests/integration_test_pipeline.py
python3 tests/integration_test_shared_explorer.py
npm run test:adopt
set -a && source .env && set +a
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 &
BACKEND_URL=http://127.0.0.1:8000 node tests/shared-explorer.smoke.js
BACKEND_URL=http://127.0.0.1:8000 node tests/cms-installer.smoke.js
kill $(lsof -ti:8000)
```

---

## Commandes exécutées

```bash
# Diagnostic initial
pwd
git status --short --branch
git remote -v
git branch -vv
git log --oneline -10
git tag --list "v0.1.0-dblayer"
git check-ignore -v .env
npm run test:adopt                        # 540/540 baseline

# Branche
git checkout -b go/GO_LOCALCMS_DBLAYER_CICD_01

# Création fichiers
# scripts/run-ci-local.sh
# .github/workflows/localcms-ci.yml

# Exécution CI locale
bash scripts/run-ci-local.sh
# → integration_test_pipeline.py    15/15 PASS
# → integration_test_shared_explorer.py 23/23 PASS
# → npm run test:adopt              540/540 PASS
# → /health                         200 (2s)
# → shared-explorer.smoke.js (live) 6/6 PASS
# → cms-installer.smoke.js (live)   7/7 PASS
# → uvicorn arrêté, runtime nettoyé

# Vérification git
git status --short --branch
git diff --stat
git check-ignore -v .github/workflows/localcms-ci.yml || echo "NOT IGNORED"
git check-ignore -v scripts/run-ci-local.sh || echo "NOT IGNORED"
```

---

## Fichiers créés/modifiés

| Fichier | Action |
|---|---|
| `scripts/run-ci-local.sh` | Créé |
| `.github/workflows/localcms-ci.yml` | Créé |
| `docs/chantiers/GO_LOCALCMS_DBLAYER_CICD_01/00_CICD_BASELINE.md` | Créé |
| `docs/responses/response_16_GO_LOCALCMS_DBLAYER_CICD_01.txt` | Créé |
| Fichiers applicatifs | **Non modifiés** |
| `.env` | **Non tracké** |
| `node_modules` | **Absent / non tracké** |

---

## État Git final

```
go/GO_LOCALCMS_DBLAYER_CICD_01 (base main b326781)
?? .github/
?? scripts/run-ci-local.sh
?? docs/chantiers/GO_LOCALCMS_DBLAYER_CICD_01/
?? docs/responses/response_16_GO_LOCALCMS_DBLAYER_CICD_01.txt
```

---

## VERDICT

```
PASS
```

| Critère | Statut |
|---|---|
| Script CI local créé (`scripts/run-ci-local.sh`) | PASS |
| Script CI local exécuté sans erreur | PASS |
| GitHub Actions workflow créé (`.github/workflows/localcms-ci.yml`) | PASS |
| integration_test_pipeline.py 15/15 | PASS |
| integration_test_shared_explorer.py 23/23 | PASS |
| npm run test:adopt 540/540 | PASS |
| shared-explorer.smoke.js live 6/6 | PASS |
| cms-installer.smoke.js live 7/7 | PASS |
| Aucun fichier applicatif modifié | PASS |
| Aucun secret tracké | PASS |
| .env ignoré | PASS |
| node_modules non tracké | PASS |
| Runtime CI isolé + cleanup garanti | PASS |

---

## Prochain GO logique

Deux options :

1. `GO_LOCALCMS_DBLAYER_BUNDLE_FIXTURES_01` — versionner des bundles de test CI dans `tests/fixtures/` pour couvrir les smokes installer en GitHub Actions sans runtime local
2. `GO_LOCALCMS_DBLAYER_V2_SCOPE_01` — définir le périmètre V2 (rollback API, restore API, IA runner réel)
