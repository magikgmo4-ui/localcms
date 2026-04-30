# 00_V2_RELEASE_PREP — GO_LOCALCMS_DBLAYER_V2_RELEASE_PREP_01

---

## 1_MASTER_TARGET

Préparer la release `v0.2.0-dblayer` : inventaire complet des commits, validations CI et GitHub Actions, endpoints V2 intégrés, tests ajoutés, gaps restants, et commandes de tag proposées (non exécutées dans ce GO).

---

## 3_INITIAL_NEED

Les deux MUST V2 du scope `GO_LOCALCMS_DBLAYER_V2_SCOPE_01` sont maintenant mergés sur `main` et vérifiés en GitHub Actions :

- **P1** `GAP_ROLLBACK_API_ABSENTE` → résolu par `GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01`
- **P2** `GAP_RESTORE_API_ABSENTE` → résolu par `GO_LOCALCMS_DBLAYER_V2_RESTORE_API_01`

`main` est stable, CI PASS, historique GitHub Actions 5/5 success. Le moment est venu de formaliser la release candidate `v0.2.0-dblayer`.

---

## 4_MASTER_PROJECT_PLAN

```
V1 (tag v0.1.0-dblayer → b94c09e) :
  stack FastAPI + pipeline installer + CI + tests
  1242 validations — 5 GO PASS

V2 (candidat v0.2.0-dblayer → 277f281) :
  API complète rollback + backups inventory + restore explicite
  P1 + P2 MUST intégrés — 16 commits depuis v0.1.0-dblayer
  26 tests intégration + 10 smokes installer + 6 smokes explorer + 540 adopt
```

**Plan de release :**
1. Vérification complète (ce GO)
2. Validation humaine du rapport
3. Exécution des commandes de tag proposées (GO suivant ou action directe)

---

## 7_CANONICAL_STATE

| Champ | Valeur |
|---|---|
| Repo | /home/ghost/localcms |
| Remote | git@github.com:magikgmo4-ui/localcms.git |
| Branche | main |
| HEAD candidat | **277f281** docs: record LocalCMS restore API GitHub Actions verify PASS |
| Tag V1 | v0.1.0-dblayer → b94c09e |
| Tag V2 | **absent** — à créer |
| CI locale | PASS (26/26 + 23/23 + 540/540 + 6/6 + 10/10) |
| GitHub Actions last run | 25143741568 → completed/success |
| Date | 2026-04-30 |

---

## 11_KEY_DECISIONS

| Décision | Justification |
|---|---|
| HEAD candidat = `277f281` | Dernier commit doc sur main après vérification GitHub Actions restore |
| Tag annoté `v0.2.0-dblayer` | Cohérence avec `v0.1.0-dblayer` (tag annoté avec message) |
| P3/P4/P5/P6 hors scope release V2 | Scope V2 défini : MUST only (P1 + P2). SHOULD/COULD = V2.x ou V3 |
| Tag non créé dans ce GO | Séparation prep / exécution — validation humaine intermédiaire |

---

## 12_INVARIANTS

| Invariant | Statut V2 |
|---|---|
| .env non tracké | MAINTENU — `.gitignore:1:.env` confirmé |
| node_modules non tracké | MAINTENU |
| Aucun secret versionné | MAINTENU |
| Tests avant merge | MAINTENU — CI PASS sur chaque GO avant merge |
| Branche dédiée par GO | MAINTENU |
| main = toujours stable | MAINTENU — 5/5 runs GitHub Actions success |
| localcms-v5.html non modifié | MAINTENU — absent de tous les diffs V2 |
| v0.1.0-dblayer non déplacé | MAINTENU — pointe toujours b94c09e |

---

## 13_ESTABLISHED

### Inventaire commits depuis v0.1.0-dblayer (16 commits)

| Hash | Type | Message |
|---|---|---|
| 277f281 | docs | record LocalCMS restore API GitHub Actions verify PASS |
| 02587dc | docs | record LocalCMS restore API merge main PASS |
| **0da703b** | **merge** | **LocalCMS V2 restore API — backups inventory and explicit restore** |
| 64b0031 | feat | expose installer restore API |
| 649bb0c | docs | record LocalCMS rollback API GitHub Actions verify PASS |
| 1ebc178 | docs | record LocalCMS rollback API merge main PASS |
| **f06799a** | **merge** | **LocalCMS V2 rollback API — POST /api/installer/rollback** |
| da4b50c | feat | expose installer rollback API |
| aaa05c6 | docs | record LocalCMS db-layer V2 scope PASS |
| 53ef3d6 | docs | record LocalCMS CI GitHub Actions verify PASS |
| 3990cb7 | docs | record LocalCMS CI merge main PASS |
| **ef263af** | **merge** | **LocalCMS CI pipeline — script, GitHub Actions, installer fixtures** |
| 10c9ac7 | feat | add CI installer fixtures |
| b2c2705 | feat | add LocalCMS CI pipeline |
| b326781 | docs | record LocalCMS db-layer frontend audit PASS |
| 6768665 | docs | record LocalCMS db-layer API coverage PASS |

**Commits feat/merge strictement V2 rollback/restore :**

| Hash | Commit |
|---|---|
| f06799a | merge: LocalCMS V2 rollback API — POST /api/installer/rollback |
| da4b50c | feat: expose installer rollback API |
| 0da703b | merge: LocalCMS V2 restore API — backups inventory and explicit restore |
| 64b0031 | feat: expose installer restore API |

### Endpoints V2 ajoutés

| Endpoint | Type | Statut |
|---|---|---|
| `POST /api/installer/rollback` | Rollback automatique (dernier backup) | **merged + Actions PASS** |
| `GET /api/installer/backups` | Inventaire backups (filtre `?module_id=`) | **merged + Actions PASS** |
| `POST /api/installer/restore` | Restore explicite par `backup_name` | **merged + Actions PASS** |

**Endpoints V1 inchangés :**
`GET /scan`, `GET /inspect`, `POST /precheck`, `POST /install`, `GET /history`

### Fichiers applicatifs modifiés depuis v0.1.0-dblayer

| Fichier | Delta principal |
|---|---|
| `api/cms_installer.py` | +150 lignes — `VALID_BACKUP_RE`, `RollbackRequest`, `RestoreRequest`, 3 nouveaux endpoints |
| `tests/integration_test_pipeline.py` | +218 lignes — `run_rollback_api`, `run_backups_api`, `run_restore_api`, I16–I26 |
| `tests/cms-installer.smoke.js` | +135 lignes — mocks rollback/backups/restore, S8–S10 |
| `scripts/run-ci-local.sh` | +171 lignes — script CI complet (ajouté dans ce cycle V2) |
| `.github/workflows/localcms-ci.yml` | +33 lignes — workflow Actions (ajouté dans ce cycle V2) |
| `tests/fixtures/cms-installer/` | fixtures bundles CI (2 modules) |

### Tests — état V2

| Suite | V1 | V2 | Δ |
|---|---|---|---|
| `integration_test_pipeline.py` | 15 tests (I1–I15) | **26 tests (I1–I26)** | +11 |
| `integration_test_shared_explorer.py` | 23 tests | 23 tests | 0 |
| `cms-installer.smoke.js` | 7 smokes (S1–S7) | **10 smokes (S1–S10)** | +3 |
| `shared-explorer.smoke.js` | 6 smokes | 6 smokes | 0 |
| `npm run test:adopt` | 540 | 540 | 0 |
| **Total** | **~591** | **~605** | **+14** |

### CI locale

```
bash scripts/run-ci-local.sh
  integration_test_pipeline.py          26/26 PASS
  integration_test_shared_explorer.py   23/23 PASS
  npm run test:adopt (9 suites)          540/540 PASS
  shared-explorer.smoke.js (live)       6/6 PASS
  cms-installer.smoke.js (live)         10/10 PASS
  LocalCMS CI — PASS
```

### GitHub Actions vérifiés

| GO | Run ID | Commit | Conclusion |
|---|---|---|---|
| V2 rollback merge main | 25107813480 | 1ebc178 | ✓ success |
| V2 restore merge main | 25143741568 | 02587dc | ✓ success |
| Dernier run sur HEAD | 25143741568 | 02587dc | ✓ success |

Historique complet : 5/5 runs main en success (depuis intégration CI pipeline).

### Tag v0.2.0-dblayer

```
git tag --list "v0.2.0-dblayer"
→ (aucun résultat) — TAG ABSENT ✓
```

---

## 14_HYPOTHESIS

- Le HEAD `277f281` est stable : CI PASS locale + GitHub Actions PASS sur `02587dc` (commit fonctionnel direct parent). Le commit `277f281` est un commit doc pur (aucune modification applicative).
- Le tag annoté `v0.2.0-dblayer` peut être posé sur `277f281` ou sur le merge commit `0da703b` selon la convention souhaitée. Recommandation : `277f281` (HEAD courant, dernier état vérifié).

---

## 15_REMAINING_GAP

Gaps non inclus dans la release V2 :

| Gap | Priorité scope | Description |
|---|---|---|
| GAP_ABSOLUTE_PATH_404 | SHOULD P3 | `/api/shared/read?path=/etc/passwd` → 404 au lieu de 403 |
| GAP_LEGACY_INSTALLER_SIMULE | SHOULD P4 | Panel "Installer" frontend simulé avec setTimeout |
| GAP_PACKAGE_JSON_MODULE_WARN | SHOULD P5 | Warning Node `"type":"module"` absent de `package.json` |
| GAP_UTCNOW_DEPRECATION | SHOULD P5 | `datetime.utcnow()` deprecated Python 3.12+ |
| GAP_INSTALL_BACKUPS_TTL | COULD P6 | Pas de purge TTL install-backups/install-logs |
| GAP_GH_CLI_NOT_AUTHENTICATED | HORS SCOPE | Contourné via API REST publique |

Ces gaps constituent le périmètre V2.x ou V3.

---

## 16_TODO

- [ ] Validation humaine de ce rapport
- [ ] Exécution des commandes de tag ci-dessous (GO suivant ou action directe)

---

## 17_RESUME_POINT

```bash
cd "$HOME/localcms"
git status --short --branch
# main (clean, sync origin)
git log --oneline -5
# Vérifier HEAD = 277f281

# Commandes de tag proposées (à exécuter manuellement) :
git tag -a v0.2.0-dblayer -m "LocalCMS db-layer V2 — rollback and restore APIs"
git push origin v0.2.0-dblayer
```

---

## Commandes exécutées

```bash
pwd
git status --short --branch
git remote -v
git branch -vv
git log --oneline -15
git tag --list "v0.1.0-dblayer"
git tag --list "v0.2.0-dblayer"
git check-ignore -v .env
git check-ignore -v node_modules || true
git fetch origin
git checkout main
git pull --rebase origin main
bash scripts/run-ci-local.sh                          # PASS
git log --oneline v0.1.0-dblayer..HEAD                # 16 commits
git diff --stat v0.1.0-dblayer..HEAD                  # 35 fichiers
git tag --list "v0.2.0-dblayer" | wc -l               # 0 — absent confirmé
```

## Commandes proposées — NON exécutées

```bash
git tag -a v0.2.0-dblayer \
  -m "LocalCMS db-layer V2 — rollback and restore APIs"
git push origin v0.2.0-dblayer
```

---

## VERDICT

```
PASS
```

| Critère | Statut |
|---|---|
| main clean et sync origin | PASS |
| bash scripts/run-ci-local.sh PASS | PASS |
| tag v0.2.0-dblayer absent | PASS |
| P1 rollback API établi | PASS — f06799a mergé + run 25107813480 success |
| P2 restore API établi | PASS — 0da703b mergé + run 25143741568 success |
| GitHub Actions P1/P2 PASS | PASS — 5/5 runs main success |
| Inventaire commits complet | PASS — 16 commits depuis v0.1.0-dblayer |
| Endpoints V2 documentés | PASS — 3 nouveaux endpoints |
| Tests documentés | PASS — +11 intégration, +3 smokes |
| Gaps restants documentés | PASS — P3/P4/P5/P6 listés |
| Commandes tag proposées | PASS — non exécutées |
| Rapport release prep écrit | PASS |
| Réponse TXT écrite | PASS |
| Aucun fichier applicatif modifié | PASS |
| .env non tracké | PASS |
| node_modules non tracké | PASS |
