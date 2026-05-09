# GO_LOCALCMS_DBLAYER_V3_POST_RELEASE_BASELINE_01

## Objectif

Établir une baseline applicative LocalCMS V3 / DBLayer depuis main après réalignement Git.

## Base canonique

- Repo: /home/ghost/localcms
- Branche: go/GO_LOCALCMS_DBLAYER_V3_POST_RELEASE_BASELINE_01
- Base: main @ 229cfa1
- Remote: git@github.com:magikgmo4-ui/localcms.git
- Tag de release: v0.3.0-dblayer

## Décision héritée

- GO_LOCALCMS_GIT_REALIGNMENT_DECISION_01: PASS — main est la base canonique
- GO_LOCALCMS_NEXT_WORK_BRANCH_OPEN_01: PASS — mergé dans main @ 229cfa1

---

## 1. État Git de départ

| Élément     | Valeur                                                         |
| ----------- | -------------------------------------------------------------- |
| Branch      | go/GO_LOCALCMS_DBLAYER_V3_POST_RELEASE_BASELINE_01            |
| Base        | main @ 229cfa1                                                 |
| Remote      | git@github.com:magikgmo4-ui/localcms.git                      |
| Tags        | v0.1.0-dblayer, v0.2.0-dblayer, v0.3.0-dblayer                |
| Status      | propre (aucun fichier non suivi, aucune modification en attente) |

## 2. Inventaire applicatif DBLayer

### Backend Python (FastAPI)

| Fichier                         | Rôle                                         |
| ------------------------------- | -------------------------------------------- |
| `main.py`                       | Hôte FastAPI V103 — monte M1, M2, M3         |
| `api/shared_explorer.py`        | M1 — shared explorer                         |
| `api/cms_installer.py`          | M2 — CMS installer                           |
| `api/config_store.py`           | M3 — config store                            |

Routes exposées :
- `/api/shared/*` → M1
- `/api/installer/*` → M2
- `/api/config/*` → M3
- `/health` → health check

### Modules JS (config adopt)

| Module                      | Smoke                        |
| --------------------------- | ---------------------------- |
| `modules/apps-config.js`    | `modules/apps-config.smoke.js` |
| `modules/data-sources.js`   | `modules/data-sources.smoke.js` |
| `modules/devtools-config.js`| `modules/devtools-config.smoke.js` |
| `modules/env-global.js`     | `modules/env-global.smoke.js` |
| `modules/ia-config.js`      | `modules/ia-config.smoke.js` |
| `modules/machines-config.js`| `modules/machines-config.smoke.js` |
| `modules/queue-config.js`   | `modules/queue-config.smoke.js` |
| `modules/sec-config.js`     | `modules/sec-config.smoke.js` |
| `modules/shared-explorer.js`| —                            |
| `modules/cms-installer.js`  | —                            |

### Suites de test disponibles

**JS / adopt (non-destructif) :**
- `tests/apps-config-adopt.test.js`
- `tests/data-sources-adopt.test.js`
- `tests/devtools-config-adopt.test.js`
- `tests/env-global-adopt.test.js`
- `tests/ia-config-adopt.test.js`
- `tests/machines-config-adopt.test.js`
- `tests/memory-view-adopt.test.js`
- `tests/queue-config-adopt.test.js`
- `tests/sec-config-adopt.test.js`
- `tests/shared-explorer.test.js`
- `tests/cms-installer.test.js`

**JS / smoke :**
- `tests/cms-config.smoke.mjs`
- `tests/cms-installer.smoke.mjs`
- `tests/shared-explorer.smoke.js`
- `tests/smoke_cond_valid.js`

**Python / intégration :**
- `tests/integration_test_config_store.py`
- `tests/integration_test_pipeline.py`
- `tests/integration_test_shared_explorer.py`

**Runner adopt :** `npm run test:adopt` (via `scripts/run-adopt.js`)

## 3. Runtimes disponibles

| Runtime  | Version    | Statut |
| -------- | ---------- | ------ |
| Python   | 3.13.12    | OK     |
| Node     | v22.22.2   | OK     |
| FastAPI  | installé   | OK     |
| uvicorn  | installé   | OK     |

## 4. Tests exécutés (non-destructifs)

### npm run test:adopt

```
ADOPT RUNNER — 9 suites : 9 PASS  0 FAIL
50 tests — 50 ✓  0 ✗
STATUT : PASS
```

### Python integration tests

Non exécutés dans ce GO (nécessitent serveur démarré — réservés à la campagne complète).

### Smoke tests

Non exécutés dans ce GO (réservés à la campagne complète).

## 5. Surfaces prouvées

- Adopt runner JS : 9/9 suites PASS, 50/50 tests PASS
- FastAPI + uvicorn importables sans erreur
- Modules M1 / M2 / M3 présents et importés dans main.py
- Tags de release cohérents : v0.1.0 → v0.2.0 → v0.3.0-dblayer
- Remote Git synchronisé

## 6. Gaps restants

| Gap                                            | Sévérité |
| ---------------------------------------------- | -------- |
| Tests intégration Python non exécutés (host off) | moyen   |
| Smoke tests non exécutés (host off)            | moyen    |
| Pas de run CI local complet (`scripts/run-ci-local.sh`) | faible |

## 7. Verdict

**PASS**

Baseline applicative V3 établie. Les surfaces adopt JS sont prouvées vertes.
Les suites intégration et smoke nécessitent un host démarré — elles font l'objet du prochain GO.

## 8. Prochain GO recommandé

```
GO_LOCALCMS_FULL_TEST_CAMPAIGN_01
```

Campagne test complète : adopt + intégration Python + smoke, en séquence, avec host démarré.
Nettoyage branches mortes après campagne verte.
