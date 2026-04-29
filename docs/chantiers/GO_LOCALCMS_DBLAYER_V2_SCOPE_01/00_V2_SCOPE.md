# 00_V2_SCOPE — GO_LOCALCMS_DBLAYER_V2_SCOPE_01

---

## 1_MASTER_TARGET

Cadrer le périmètre V2 de LocalCMS db-layer : définir les GOs enfants prioritaires à partir des gaps V1 établis, sans patch applicatif. Produire un scope clair, priorisé, avec critères d'entrée et de sortie par GO enfant.

---

## 3_INITIAL_NEED

V1 est clôturée : branche `go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01` mergée sur `main`, tag `v0.1.0-dblayer`, CI locale + GitHub Actions PASS, 1242 validations cumulées. Les gaps restants sont documentés dans 8 rapports GO. Ce GO formalise le plan d'attaque V2 sans rien paticher.

---

## 4_MASTER_PROJECT_PLAN

### Périmètre V2 retenu — vision

```
V1 (stable) :  stack FastAPI + pipeline installer + CI + tests
V2 (visé)   :  API complète + frontend nettoyé + UX cohérente + runtime robuste
```

V2 vise à transformer LocalCMS d'un démonstrateur validé en un outil opérationnel complet : rollback/restore accessibles via HTTP, panel installer unifié, runtime sans accumulation silencieuse, sécurité renforcée sur les edge cases.

### Approche

- GO enfants indépendants (chacun a son propre branch + merge)
- Chaque GO doit PASS avant merge sur main
- CI (`bash scripts/run-ci-local.sh`) exécutée à chaque GO
- Aucune modification de `localcms-v5.html` sans GO frontend dédié

---

## 7_CANONICAL_STATE

| Champ | Valeur |
|---|---|
| Repo | /home/ghost/localcms |
| Branche | main |
| HEAD | 53ef3d6 |
| Tag V1 | v0.1.0-dblayer → b94c09e |
| CI | PASS locale + GitHub Actions (run 25099943209) |
| Date scope | 2026-04-29 |

---

## 11_KEY_DECISIONS

| Décision | Justification |
|---|---|
| V2 = GOs indépendants, pas un monobloc | Minimise les risques de régression, permet rollback par GO |
| `localcms-v5.html` = fichier à modifier uniquement dans GOs frontend dédiés | Invariant architectural — toute modif frontend hors GO = violation de contrainte |
| GAP_INSPECT_NO_VALIDATION laissé hors scope V2 | Comportement voulu : inspect lit sans valider, c'est precheck qui valide |
| GAP_GH_CLI_NOT_AUTHENTICATED hors scope V2 | Contourné via API REST publique ; auth optionnelle |
| `install-backups/install-logs` purge = COULD V2 | Non bloquant, mais accumulation à long terme est un risque opérationnel |
| IA runner = COULD V2 long terme | Dépend d'un choix d'intégration externe (ollama/openai) — hors scope core V2 |

---

## 12_INVARIANTS

Invariants V1 maintenus en V2 :

| Invariant | Statut V2 |
|---|---|
| .env non tracké | MAINTENU |
| node_modules non tracké | MAINTENU |
| Aucun secret versionné | MAINTENU |
| Tests avant merge | MAINTENU |
| Branche dédiée par GO | MAINTENU |
| CI obligatoire avant merge | MAINTENU |
| main = toujours stable | MAINTENU |

---

## 13_ESTABLISHED

### Inventaire complet des gaps V1

#### Catégorie : API backend

| Gap | Source | Description | Priorité V2 |
|---|---|---|---|
| GAP_ROLLBACK_API_ABSENTE | API_COVERAGE + FRONTEND_AUDIT + PARENT_CLOSEOUT | Pas de route `/api/installer/rollback` HTTP — rollback 100% interne à `/install` step 7 | MUST |
| GAP_RESTORE_API_ABSENTE | API_COVERAGE + FRONTEND_AUDIT | Pas de route `/api/installer/restore` — restore depuis backup non exposé | MUST |
| GAP_ABSOLUTE_PATH_404 | API_COVERAGE | `/api/shared/read?path=/etc/passwd` → 404 au lieu de 403 | SHOULD |
| GAP_INSPECT_NO_VALIDATION | API_COVERAGE | `/api/installer/inspect` retourne manifest sans valider | OUT (comportement voulu) |
| GAP_INSTALL_BACKUPS_TTL | PARENT_CLOSEOUT + API_COVERAGE | Backups/logs s'accumulent sans TTL/purge automatique | COULD |

#### Catégorie : frontend / UX

| Gap | Source | Description | Priorité V2 |
|---|---|---|---|
| GAP_LEGACY_INSTALLER_SIMULE | FRONTEND_AUDIT | `MOD_INSTALLER` (panel "Installer") simulé avec setTimeout, référence `./available/` inexistant | SHOULD |
| GAP_IA_RUNNER_SIMULE | FRONTEND_AUDIT | Panel `ia_run` : fetch simulé, aucun backend IA connecté | COULD |

#### Catégorie : runtime / infrastructure

| Gap | Source | Description | Priorité V2 |
|---|---|---|---|
| GAP_PACKAGE_JSON_MODULE_WARN | API_COVERAGE + CICD | Warning Node.js `"type":"module"` absent de `package.json` | SHOULD |
| GAP_UTCNOW_DEPRECATION | CICD | `datetime.utcnow()` deprecated Python 3.12+ dans `integration_test_shared_explorer.py` | SHOULD |

#### Catégorie : CI/CD

| Gap | Source | Description | Priorité V2 |
|---|---|---|---|
| ~~GAP_CICD_NO_BUNDLE_FIXTURES~~ | CICD_FIXTURES | **FERMÉ** — fixtures versionnées, 0 skip GitHub Actions | — |
| ~~GAP_GH_CLI_NOT_AUTHENTICATED~~ | ACTIONS_VERIFY | Contourné via API REST publique | HORS SCOPE |

#### Catégorie : sécurité

| Gap | Source | Description | Priorité V2 |
|---|---|---|---|
| GAP_ABSOLUTE_PATH_404 | API_COVERAGE | Chemin absolu → 404 (pas 403) sur `/shared/read` | SHOULD |

---

### Périmètre V2 retenu

#### MUST V2 — bloquants pour considérer V2 complète

1. **Exposer `/api/installer/rollback`** — déclencher le rollback manuellement via HTTP
2. **Exposer `/api/installer/restore`** — restaurer depuis un backup via HTTP

Ces deux routes transforment le pipeline installer d'un pipeline automatique-only en pipeline avec contrôle opérateur.

#### SHOULD V2 — importants mais non bloquants

3. **Corriger GAP_ABSOLUTE_PATH_404** — `/shared/read` chemin absolu → 403 (cohérence sécurité)
4. **Réconcilier MOD_INSTALLER legacy** — masquer ou connecter le panel "Installer" simulé
5. **`"type": "module"` dans `package.json`** — supprimer le warning Node cosmétique
6. **Corriger `datetime.utcnow()`** — aligner sur Python 3.12+ sans warning

#### COULD V2 — améliorations non urgentes

7. **TTL purge `install-backups/install-logs`** — éviter accumulation silencieuse
8. **Badge CI dans README** — visibilité statut CI
9. **IA runner réel** — connecter ollama/openai (dépend décision externe)

#### OUT OF SCOPE V2

- GAP_INSPECT_NO_VALIDATION — comportement voulu par design
- GAP_GH_CLI_NOT_AUTHENTICATED — API REST publique suffit
- Refactoring global de stack
- Migration vers pytest runner unifié (Node adopt runner est stable)

---

### Roadmap GO enfants V2

#### GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01

| Champ | Valeur |
|---|---|
| Priorité | MUST — P1 |
| Objectif | Exposer `POST /api/installer/rollback` : déclenche `_rollback()` sur le dernier backup disponible pour un `module_id` |
| Fichiers probables | `api/cms_installer.py`, `tests/integration_test_pipeline.py`, `tests/cms-installer.smoke.js` |
| Tests attendus | Route HTTP 200/404/400 ; rollback appliqué sur backup existant ; rollback refusé si aucun backup ; log émis |
| Risques | Modifier `cms_installer.py` → régression pipeline `/install` possible ; backup path resolution complexe |
| Critère PASS | Route HTTP fonctionnelle + test intégration rollback via HTTP + CI PASS |
| Dépendances | Aucune — indépendant |

#### GO_LOCALCMS_DBLAYER_V2_RESTORE_API_01

| Champ | Valeur |
|---|---|
| Priorité | MUST — P2 |
| Objectif | Exposer `POST /api/installer/restore` : restaurer depuis un backup spécifique (module_id + timestamp) |
| Fichiers probables | `api/cms_installer.py`, `tests/integration_test_pipeline.py` |
| Tests attendus | Restore depuis backup horodaté ; 404 si backup absent ; 400 si module_id invalide ; log émis |
| Risques | Résolution des chemins backup — doit rester dans `SHARED_ROOT` (path traversal) |
| Critère PASS | Route HTTP fonctionnelle + test intégration restore depuis backup + CI PASS |
| Dépendances | Indépendant (mais logiquement après ROLLBACK_API) |

#### GO_LOCALCMS_DBLAYER_V2_SECURITY_EDGE_CASES_01

| Champ | Valeur |
|---|---|
| Priorité | SHOULD — P3 |
| Objectif | Corriger `GAP_ABSOLUTE_PATH_404` : `/api/shared/read?path=/etc/passwd` → 403 au lieu de 404 |
| Fichiers probables | `api/shared_explorer.py`, `tests/integration_test_shared_explorer.py` |
| Tests attendus | Chemin absolu → 403 ; test ajouté dans `integration_test_shared_explorer.py` |
| Risques | Faible — logique de résolution déjà robuste, seul le code de retour change |
| Critère PASS | Test R_ABS → 403 confirmé + CI PASS |
| Dépendances | Aucune |

#### GO_LOCALCMS_DBLAYER_V2_FRONTEND_LEGACY_RECONCILE_01

| Champ | Valeur |
|---|---|
| Priorité | SHOULD — P4 |
| Objectif | Résoudre `GAP_LEGACY_INSTALLER_SIMULE` : masquer `MOD_INSTALLER` (panel "Installer") ou le connecter à `MOD_CMS_INSTALLER` |
| Fichiers probables | `localcms-v5.html` (modification autorisée dans ce GO uniquement) |
| Tests attendus | Panel "Installer" masqué OU connecté à `/api/installer/*` ; adopt 540/540 PASS |
| Risques | `localcms-v5.html` est le seul fichier HTML — régression UI possible ; audit préalable requis |
| Critère PASS | Panel résolu + aucune régression adopt + CI PASS |
| Dépendances | Audit frontend (déjà fait : `GO_LOCALCMS_DBLAYER_FRONTEND_AUDIT_01` valide) |

#### GO_LOCALCMS_DBLAYER_V2_PACKAGE_TYPE_MODULE_WARN_01

| Champ | Valeur |
|---|---|
| Priorité | SHOULD — P5 |
| Objectif | Corriger `GAP_PACKAGE_JSON_MODULE_WARN` + `GAP_UTCNOW_DEPRECATION` — 2 warnings cosmétiques |
| Fichiers probables | `package.json`, `tests/integration_test_shared_explorer.py` |
| Tests attendus | `npm run test:adopt` sans warning MODULE_TYPELESS ; test S7 sans DeprecationWarning |
| Risques | `"type":"module"` dans `package.json` peut affecter les scripts CommonJS — vérifier `run-adopt.js` et smoke files |
| Critère PASS | 0 warning sur CI PASS + adopt 540/540 |
| Dépendances | Aucune — mais tester en isolement avant |

#### GO_LOCALCMS_DBLAYER_V2_RUNTIME_PURGE_01

| Champ | Valeur |
|---|---|
| Priorité | COULD — P6 |
| Objectif | Implémenter TTL purge pour `install-backups/` et `install-logs/` |
| Fichiers probables | `api/cms_installer.py` ou script de maintenance `scripts/purge-runtime.sh` |
| Tests attendus | Logs/backups > N jours supprimés ; fichiers récents conservés ; test dans `integration_test_pipeline.py` |
| Risques | Suppression accidentelle si TTL mal calculé — log préalable recommandé |
| Critère PASS | Purge fonctionnelle + test isolation + CI PASS |
| Dépendances | Indépendant |

---

### Ordre d'exécution recommandé

```
P1  GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01           (MUST)
P2  GO_LOCALCMS_DBLAYER_V2_RESTORE_API_01             (MUST)
P3  GO_LOCALCMS_DBLAYER_V2_SECURITY_EDGE_CASES_01     (SHOULD)
P4  GO_LOCALCMS_DBLAYER_V2_PACKAGE_TYPE_MODULE_WARN_01 (SHOULD)
P5  GO_LOCALCMS_DBLAYER_V2_FRONTEND_LEGACY_RECONCILE_01 (SHOULD — après P1/P2)
P6  GO_LOCALCMS_DBLAYER_V2_RUNTIME_PURGE_01           (COULD)
```

Raison de l'ordre : P1/P2 sont le cœur V2 et peuvent révéler des contraintes sur `cms_installer.py`. P3/P4 sont sans risque de régression. P5 (frontend) s'exécute après P1/P2 pour inclure potentiellement des boutons rollback/restore dans l'UI.

---

### Critères de release V2

Une release `v0.2.0-dblayer` peut être taguée quand :
- P1 + P2 sont mergés sur `main` et CI PASS
- Documentation mise à jour
- `npm run test:adopt` 540/540
- `bash scripts/run-ci-local.sh` PASS
- GitHub Actions PASS sur main

P3/P4/P5/P6 sont facultatifs pour la release V2.

---

### Commandes de validation existantes

```bash
# CI complète
bash scripts/run-ci-local.sh

# Tests individuels
npm run test:adopt
python3 tests/integration_test_pipeline.py
python3 tests/integration_test_shared_explorer.py

# Smokes live
set -a && source .env && set +a
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 &
BACKEND_URL=http://127.0.0.1:8000 node tests/shared-explorer.smoke.js
BACKEND_URL=http://127.0.0.1:8000 node tests/cms-installer.smoke.js
kill $(lsof -ti:8000)

# Vérification GitHub Actions
curl -s "https://api.github.com/repos/magikgmo4-ui/localcms/actions/runs?per_page=5&branch=main" \
  | python3 -c "import sys,json; [print(r['id'],r['status'],r['conclusion'],r['head_sha'][:7]) for r in json.load(sys.stdin)['workflow_runs']]"
```

---

## 14_HYPOTHESIS

| Hypothèse | Statut |
|---|---|
| H1 — `_rollback()` dans `cms_installer.py` est extractible en route HTTP | À CONFIRMER — lecture code requise en GO V2_ROLLBACK_API |
| H2 — Backups horodatés permettent un restore adressable par timestamp | À CONFIRMER — format `module_id_YYYYMMDDTHHMMSS` présent, adressage reste à valider |
| H3 — `"type":"module"` compatible avec `run-adopt.js` (CommonJS require) | À VÉRIFIER — `spawnSync` dans run-adopt.js utilise `require`, incompatible module ESM direct |
| H4 — Masquer MOD_INSTALLER n'affecte pas les 540 adopt tests | Probable — adopt tests couvrent les modules de config, pas MOD_INSTALLER |
| H5 — Absolute path fix dans shared_explorer.py est une ligne | Probable — `raise HTTPException(403)` sur `path.is_absolute()` |

---

## 15_REMAINING_GAP

Gaps ouverts après ce scope (non traités dans ce GO, à adresser dans les GOs V2) :

| Gap | Priorité V2 | GO cible |
|---|---|---|
| GAP_ROLLBACK_API_ABSENTE | MUST P1 | GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01 |
| GAP_RESTORE_API_ABSENTE | MUST P2 | GO_LOCALCMS_DBLAYER_V2_RESTORE_API_01 |
| GAP_ABSOLUTE_PATH_404 | SHOULD P3 | GO_LOCALCMS_DBLAYER_V2_SECURITY_EDGE_CASES_01 |
| GAP_PACKAGE_JSON_MODULE_WARN | SHOULD P4 | GO_LOCALCMS_DBLAYER_V2_PACKAGE_TYPE_MODULE_WARN_01 |
| GAP_UTCNOW_DEPRECATION | SHOULD P4 | GO_LOCALCMS_DBLAYER_V2_PACKAGE_TYPE_MODULE_WARN_01 |
| GAP_LEGACY_INSTALLER_SIMULE | SHOULD P5 | GO_LOCALCMS_DBLAYER_V2_FRONTEND_LEGACY_RECONCILE_01 |
| GAP_INSTALL_BACKUPS_TTL | COULD P6 | GO_LOCALCMS_DBLAYER_V2_RUNTIME_PURGE_01 |
| GAP_IA_RUNNER_SIMULE | COULD futur | Non planifié |

---

## 16_TODO

- [ ] Lancer GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01 en premier
- [ ] Lire `api/cms_installer.py` avant le GO pour confirmer H1/H2
- [ ] Vérifier compatibilité `"type":"module"` avec `scripts/run-adopt.js` avant P4

---

## 17_RESUME_POINT

```bash
cd /home/ghost/localcms
git status --short --branch
# main (clean, sync origin)

bash scripts/run-ci-local.sh
# → LocalCMS CI — PASS

# Premier GO V2 recommandé :
# GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01
# Branche : go/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01
# Base : main HEAD 53ef3d6
```

---

## Commandes exécutées

```bash
pwd && git status --short --branch && git remote -v && git branch -vv
git log --oneline -12
git tag --list "v0.1.0-dblayer"
git check-ignore -v .env

bash scripts/run-ci-local.sh   # → LocalCMS CI — PASS

# Lecture docs canoniques
cat docs/chantiers/GO_LOCALCMS_DBLAYER_PARENT_CLOSEOUT_01/00_PARENT_CLOSEOUT.md
cat docs/chantiers/GO_LOCALCMS_DBLAYER_API_COVERAGE_01/00_API_COVERAGE_REPORT.md
cat docs/chantiers/GO_LOCALCMS_DBLAYER_FRONTEND_AUDIT_01/00_FRONTEND_AUDIT_REPORT.md
cat docs/chantiers/GO_LOCALCMS_DBLAYER_CICD_01/00_CICD_BASELINE.md
cat docs/chantiers/GO_LOCALCMS_DBLAYER_CICD_FIXTURES_01/00_CICD_FIXTURES_BASELINE.md
cat docs/chantiers/GO_LOCALCMS_DBLAYER_CICD_ACTIONS_VERIFY_01/00_ACTIONS_VERIFY.md
```

---

## Fichiers créés/modifiés

| Fichier | Action |
|---|---|
| `docs/chantiers/GO_LOCALCMS_DBLAYER_V2_SCOPE_01/00_V2_SCOPE.md` | Créé |
| `docs/responses/response_20_GO_LOCALCMS_DBLAYER_V2_SCOPE_01.txt` | Créé |
| Fichiers applicatifs | **Non modifiés** |
| `.env` | **Non tracké** |
| `node_modules` | **Absent** |

---

## État Git final

```
main (clean, sync origin)
HEAD : 53ef3d6 docs: record LocalCMS CI GitHub Actions verify PASS
?? docs/chantiers/GO_LOCALCMS_DBLAYER_V2_SCOPE_01/
?? docs/responses/response_20_GO_LOCALCMS_DBLAYER_V2_SCOPE_01.txt
```

---

## VERDICT

```
PASS
```

| Critère | Statut |
|---|---|
| Scope V2 documenté | PASS |
| Aucun fichier applicatif modifié | PASS |
| Gaps V1 repris proprement | PASS |
| GO enfants proposés (6) | PASS |
| Priorités V2 claires (MUST/SHOULD/COULD/OUT) | PASS |
| CI locale revalidée | PASS |
| Documentation écrite | PASS |
| Réponse TXT écrite | PASS |
| Working tree final limité aux docs V2 | PASS |

---

## Prochain GO recommandé

`GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01`

Exposer `POST /api/installer/rollback` — le cœur manquant de V2.
