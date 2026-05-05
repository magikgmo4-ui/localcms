# GO_LOCALCMS_DBLAYER_V2_RELEASE_TAG_01

## VERDICT : PASS

## Tag release

| Champ              | Valeur                                     |
| ------------------ | ------------------------------------------ |
| Tag                | `v0.2.0-dblayer`                           |
| Message tag        | LocalCMS db-layer V2 — rollback and restore APIs |
| Commit pointé      | `3c908875c8067c9de93aa1ec8a7c518e828b68fa` |
| Commit message     | docs: record LocalCMS V2 release prep PASS |
| Tagger             | ghost                                      |
| Tag poussé origin  | oui                                        |
| Commit release prep| `3c90887`                                  |

## État Git final

```text
Branche     : main
main        : synchronisé avec origin/main
Tag local   : v0.2.0-dblayer présent
Tag remote  : v0.2.0-dblayer présent sur origin
```

## Endpoints V2 inclus

```text
POST /api/installer/rollback
GET  /api/installer/backups
POST /api/installer/restore
```

## Suites de tests V2

| Suite                                 |   V1 → V2 |
| ------------------------------------- | --------: |
| `integration_test_pipeline.py`        |   15 → 26 |
| `cms-installer.smoke.js`              |    7 → 10 |
| `integration_test_shared_explorer.py` |   23 → 23 |
| `npm run test:adopt`                  | 540 → 540 |

## Gaps restants hors V2

```text
P3 GAP_ABSOLUTE_PATH_404
P4 GAP_LEGACY_INSTALLER_SIMULE
P5 GAP_PACKAGE_JSON_MODULE_WARN + GAP_UTCNOW_DEPRECATION
P6 GAP_INSTALL_BACKUPS_TTL
```

## Point de reprise

Prochain chantier : choisir un gap P3–P6 indépendamment de la release V2.

```bash
cd "$HOME/localcms"
git status --short --branch
git log --oneline -8
git tag --list "v0.2.0-dblayer"
git show v0.2.0-dblayer --format=short --no-patch
```
