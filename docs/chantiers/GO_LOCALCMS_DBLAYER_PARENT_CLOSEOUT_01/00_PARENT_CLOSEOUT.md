# 00_PARENT_CLOSEOUT — GO_LOCALCMS_DBLAYER_PARENT_CLOSEOUT_01

---

## 1_MASTER_TARGET

Migrer LocalCMS vers `db-layer` comme repo séparé, avec Claude Code CLI comme worker Ubuntu en mode cowork-like, et valider l'intégralité du pipeline installer (env, installation, backup/rollback, tests adopt) en conditions live.

---

## 2_INITIAL_PROJECT_DOC

Source : `docs/chantiers/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01/00_INITIAL_PROJECT_DOC.md`

- LocalCMS est un projet séparé de `opt-trading`.
- `db-layer` est la machine worker Ubuntu dédiée à LocalCMS.
- Claude Desktop non requis — Claude Code CLI + tmux fournit le mode cowork-like.
- Traçabilité via Git, branche dédiée, documentation chantier, tests/smokes.
- Livrable attendu : repo cloné, CLI fonctionnel, branche dédiée, baseline validé, point de reprise stable.

---

## 3_INITIAL_NEED

L'utilisateur a besoin que Claude travaille sur LocalCMS sur `db-layer` de façon autonome et reproductible, sans dépendre de Claude Desktop. Le chantier doit être documenté, testable, et reprênable à tout moment.

---

## 4_MASTER_PROJECT_PLAN

Plan initial (cf. `00_INITIAL_PROJECT_DOC.md`) — réalisé avec adaptations :

| Étape | Prévu | Réalisé |
|---|---|---|
| 1. Vérifier repo source | Oui | PASS |
| 2. Installer Claude CLI sur db-layer | Oui | PASS (déjà présent) |
| 3. Cloner LocalCMS dans `/opt/localcms` | `/opt/localcms` | Réalisé dans `/home/ghost/localcms` |
| 4. Ouvrir branche dédiée | Oui | PASS — `go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01` |
| 5. Créer documentation chantier | Oui | PASS |
| 6. Lancer Claude CLI tmux | Oui | PASS |
| 7. Auditer repo, détecter stack, smokes | Oui | PASS — 645/645 |
| 8. Changements minimaux validés | Oui | PASS — seuls docs + runner ajoutés |
| 9. Documenter Git, tests, reprise | Oui | PASS |
| 10. Closeout PASS/FAIL | Oui | **PASS** |

---

## 7_CANONICAL_STATE

### État final (2026-04-28)

| Champ | Valeur |
|---|---|
| Machine | db-layer |
| Repo | /home/ghost/localcms |
| Remote | git@github.com:magikgmo4-ui/localcms.git |
| Branche | go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01 |
| HEAD | 361e335 feat: add LocalCMS adopt test runner |
| Working tree | propre |
| Python | 3.13.12 |
| FastAPI | 0.136.1 / uvicorn 0.46.0 |
| Node.js | 22.22.2 / npm 11.13.0 |
| Runtime SHARED_ROOT | /home/ghost/localcms_runtime/shared |
| Runtime MODULES_DIR | /home/ghost/localcms_runtime/modules |
| .env | gitignored, non tracké |
| node_modules | gitignored, non présent |
| Score cumulé | 1242 validations |

### Stack applicative (intacte)

| Fichier | État |
|---|---|
| main.py | Non modifié |
| api/cms_installer.py | Non modifié |
| api/shared_explorer.py | Non modifié |
| localcms-v5.html | Non modifié |
| modules/*.js | Non modifiés (sauf runtime) |
| requirements.txt | Non modifié |
| .gitignore | Non modifié |

---

## 11_KEY_DECISIONS

| Décision | Justification |
|---|---|
| Repo dans `/home/ghost/localcms` au lieu de `/opt/localcms` | Répertoire utilisateur, droits suffisants, pas de sudo requis |
| Runner adopt = Node natif (`spawnSync`) | Tests sans describe/it/expect — vitest/Jest inutiles, 0 dépendance npm |
| GAP_ROLLBACK_API_ABSENTE non bloquant | Rollback interne au pipeline est suffisant pour V1 ; route dédiée hors périmètre |
| Pas de `npm install` | Adopt tests = Node built-ins uniquement ; pas de package-lock.json généré |
| Tests mock et live séparés | Intégrité : les smokes live ne polluent pas les tests unitaires statiques |
| Backup automatique (step 4) | Déclenché si et seulement si fichier dest préexistant — comportement confirmé v1→v2 |
| Rollback interne (step 7) | Déclenché sur exception shutil.copy2/mkdir — result:"rollback" retourné, pas d'erreur HTTP |

---

## 12_INVARIANTS

Tous respectés sur l'ensemble du chantier :

| Invariant | Respecté |
|---|---|
| Ne pas mélanger LocalCMS et opt-trading | OUI |
| Ne pas travailler directement sur main | OUI — branche dédiée tout au long |
| Ne pas patcher sans état Git | OUI — vérification git status à chaque GO |
| Ne pas refactorer globalement | OUI |
| Toujours documenter diff, tests, limites, reprise | OUI |
| .env non tracké | OUI |
| node_modules non tracké | OUI |
| Aucun secret versionné | OUI |
| Aucun artefact runtime tracké | OUI |

---

## 13_ESTABLISHED

### Tableau des GO clôturés

| # | GO | Commit HEAD | Verdict | Tests validés |
|---|---|---|---|---|
| 0 | GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01 | 588d7c6 → c2d3993 | PASS | 645/645 |
| 1 | GO_LOCALCMS_DBLAYER_ENV_SETUP_01 | e06763f / f124672 | PASS live | 13 live |
| 2 | GO_LOCALCMS_DBLAYER_INSTALL_PIPELINE_01 | cb73b40 / a4ef0a4 | PASS live | 22 live |
| 3 | GO_LOCALCMS_DBLAYER_BACKUP_ROLLBACK_01 | 7f821d5 | PASS live | 22 live |
| 4 | GO_LOCALCMS_DBLAYER_ADOPT_RUNNER_01 | 361e335 | PASS | 540 |
| **TOTAL** | | | **5/5 PASS** | **1242** |

### Progression des scores

| Étape | Delta | Cumulé |
|---|---|---|
| Baseline (645/645) | +645 | 645 |
| ENV_SETUP live (13 smokes) | +13 | 658 |
| INSTALL_PIPELINE live (22 tests) | +22 | 680 |
| BACKUP_ROLLBACK live (22 tests) | +22 | 702 |
| ADOPT_RUNNER (540/540) | +540 | **1242** |

### Commits exacts sur la branche

| Hash | Message |
|---|---|
| 588d7c6 | docs: open LocalCMS db-layer Claude CLI migration |
| c2d3993 | docs: record LocalCMS db-layer baseline PASS |
| e06763f | docs: record LocalCMS db-layer env setup PASS |
| f124672 | docs: archive LocalCMS env setup push response |
| cb73b40 | docs: record LocalCMS db-layer install pipeline PASS |
| a4ef0a4 | docs: archive LocalCMS install pipeline push response |
| 7f821d5 | docs: record LocalCMS db-layer backup rollback PASS |
| 361e335 | feat: add LocalCMS adopt test runner ← HEAD |

### Commandes stables validées

```bash
# Environnement
set -a && source .env && set +a

# Serveur
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 &

# Santé
curl -s http://127.0.0.1:8000/health

# Adopt tests
npm run test:adopt

# Smoke live (avec BACKEND_URL)
BACKEND_URL=http://127.0.0.1:8000 node tests/cms-installer.smoke.js
BACKEND_URL=http://127.0.0.1:8000 node tests/shared-explorer.smoke.js

# Tests unitaires JS
node tests/cms-installer.test.js
node tests/shared-explorer.test.js

# Tests Python
python3 -m pytest tests/integration_test_pipeline.py -v
python3 -m pytest tests/integration_test_shared_explorer.py -v

# Arrêt propre
kill $(lsof -ti:8000)
```

### Runtime local validé

| Chemin | Usage |
|---|---|
| `/home/ghost/localcms_runtime/shared/install-queue/` | Bundles .zip à installer |
| `/home/ghost/localcms_runtime/shared/install-backups/` | Backups automatiques pre-upgrade |
| `/home/ghost/localcms_runtime/shared/install-logs/` | Historique pipeline |
| `/home/ghost/localcms_runtime/modules/` | Modules installés |

---

## 14_HYPOTHESIS

| Hypothèse | Statut |
|---|---|
| H1 — FastAPI + uvicorn stable avec .env réel | Confirmé — 5 sessions live PASS |
| H2 — Backup déclenché sur fichier préexistant | Confirmé — v1→v2 backup ok |
| H3 — Rollback automatique sur exception install | Confirmé — `result: "rollback"` |
| H4 — Adopt tests Node-only, 0 dépendance | Confirmé — pas de npm install |
| H5 — node_modules déjà ignoré | Confirmé — `.gitignore` contient `node_modules/` |
| H6 — Aucune route /rollback dédiée | Confirmé — GAP documenté, non bloquant |

---

## 15_REMAINING_GAP

| Gap | Description | Bloquant |
|---|---|---|
| GAP_ROLLBACK_API_ABSENTE | Pas de route `/api/installer/rollback` — rollback 100% interne | Non — voulu V1 |
| Restauration depuis backup | Rollback restaure backup si disponible — scénario complet v1→v2→rollback→restore non testé | Non |
| install-backups purge | Backups s'accumulent sans TTL | Non |
| localcms-v5.html | Frontend non audité dans ce chantier | Non |
| CI/CD | Aucun workflow GitHub Actions | Non |
| pytest runner unifié | Pas de script npm-equivalent côté Python | Non |
| Merge dans main | Branche non mergée — résultat branche dédiée uniquement | À décider |

---

## 16_TODO

- [ ] Merge optionnel `go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01` → `main` si chantier considéré stable
- [ ] Tester scénario rollback complet : install v1 → v2 (backup) → v3 échec (rollback+restore backup)
- [ ] Configurer TTL purge pour `install-backups/`
- [ ] Ajouter GitHub Actions workflow pour `npm run test:adopt`
- [ ] Auditer `localcms-v5.html` (frontend)

---

## 17_RESUME_POINT

```bash
cd /home/ghost/localcms
git status --short --branch
# HEAD attendu : 361e335 + docs closeout non commités

# Committer le closeout :
git add docs/chantiers/GO_LOCALCMS_DBLAYER_PARENT_CLOSEOUT_01/ \
        docs/responses/response_11_GO_LOCALCMS_DBLAYER_PARENT_CLOSEOUT_01.txt \
        docs/chantiers/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01/SESSION_REPRISE.txt
git commit -m "docs: record LocalCMS db-layer parent closeout PASS"
git push

# Vérifier runner adopt :
npm run test:adopt

# Relancer le backend :
set -a && source .env && set +a
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000
```

---

## VERDICT

```
PASS
```

| Critère | Statut |
|---|---|
| 5/5 GO parent clôturés PASS | PASS |
| Score cumulé 1242/1242 | PASS |
| npm run test:adopt 540/540 | PASS |
| Aucun fichier applicatif modifié | PASS |
| .env toujours ignoré | PASS |
| node_modules non tracké | PASS |
| Aucun secret tracké | PASS |
| Aucun artefact runtime tracké | PASS |
| Documentation chantier complète | PASS |
| SESSION_REPRISE mis à jour | PASS |
| Closeout écrit | PASS |

---

## Prochain chantier recommandé

`GO_LOCALCMS_DBLAYER_API_COVERAGE_01`

Objectif : étendre la couverture API :
- Scénario rollback complet (v1→v2→rollback→restore backup)
- Routes edge cases non couvertes
- Audit `localcms-v5.html` frontend
- Ou : merge branche → main + tag de release
