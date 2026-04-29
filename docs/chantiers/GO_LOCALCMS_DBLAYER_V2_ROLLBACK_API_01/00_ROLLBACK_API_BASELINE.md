# 00_ROLLBACK_API_BASELINE — GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01

---

## 1_MASTER_TARGET

Exposer `POST /api/installer/rollback` : restauration de la version précédente d'un module depuis le backup le plus récent, avec validation sécurisée du `module_id`, sans modifier `localcms-v5.html`, sans casser le pipeline installer V1.

---

## 3_INITIAL_NEED

`GAP_ROLLBACK_API_ABSENTE` identifié en V1 : `_rollback()` n'était appelable qu'en interne depuis `/install` step 7 en cas d'échec du pipeline. Aucune route HTTP ne permettait au frontend de déclencher un rollback explicite vers un backup existant.

---

## 4_MASTER_PROJECT_PLAN

```
1. Lire l'état canonique et les contraintes (docs V1, API coverage, CICD baseline)
2. Lire le code source : api/cms_installer.py, main.py
3. Lire les tests : integration_test_pipeline.py, cms-installer.smoke.js, cms-installer.test.js
4. Établir le contrat API rollback minimal avant toute modification
5. Confirmer H1 : _rollback() extractible ou nouvelle logique HTTP nécessaire
6. Patch dans api/cms_installer.py uniquement
7. Tests : integration_test_pipeline.py (I16/I17/I18) + cms-installer.smoke.js (S8)
8. CI locale complète : bash scripts/run-ci-local.sh
9. Vérification artefacts (aucun secret, aucun runtime)
10. Documentation baseline + réponse TXT
```

---

## 7_CANONICAL_STATE

| Champ | Valeur |
|---|---|
| Repo | /home/ghost/localcms |
| Remote | git@github.com:magikgmo4-ui/localcms.git |
| Branche | go/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01 |
| Base | main HEAD aaa05c6 docs: record LocalCMS db-layer V2 scope PASS |
| Tag release | v0.1.0-dblayer (pointe b94c09e, inchangé) |
| Date | 2026-04-29 |
| Python | 3.13 + FastAPI 0.136.1 |
| Node | 22.22.2 |
| BACKUP_DIR | SHARED_ROOT / "install-backups" |
| TARGET_PATHS | {"modules_dir": Path(LOCALCMS_MODULES_DIR)} |
| VALID_ID_RE | r"^[a-z0-9_]+$" |

---

## 9_SELECTED_SOLUTION

**Route HTTP ajoutée :** `POST /api/installer/rollback`

**Modèle Pydantic :** `RollbackRequest(BaseModel) { module_id: str }`

**Logique :**
1. Valider `module_id` via `VALID_ID_RE` → 400 si invalide
2. Lister `BACKUP_DIR` pour les dossiers correspondant à `{module_id}_*`
3. Trier descendant (tri lexicographique sur le nom — le timestamp `%Y%m%dT%H%M%S%f` garantit l'ordre)
4. Si aucun candidat → 404
5. Vérifier confinement : `backup_src.resolve().relative_to(BACKUP_DIR.resolve())` → 403 si violation
6. `target_path = TARGET_PATHS["modules_dir"]` (jamais fourni par l'utilisateur)
7. Copier chaque fichier du backup vers `target_path`
8. Log `_emit_log("rollback", ...)` + retour JSON stable

**Décision clé :** La logique interne `_rollback()` existante prend `installed_files` (liste des fichiers du pipeline courant) et `backup_src` (chemin déjà résolu). Elle n'est pas réutilisable directement pour une route HTTP post-hoc. La route HTTP implémente sa propre logique de sélection du backup, conforme aux mêmes invariants de sécurité.

---

## 11_KEY_DECISIONS

| Décision | Raison |
|---|---|
| Nouvelle logique HTTP distincte de `_rollback()` interne | `_rollback()` prend `installed_files` du pipeline courant, non disponible à posteriori |
| `module_id` seul comme paramètre (pas de `timestamp` ou `backup_name`) | Minimal et sans ambiguïté — le plus récent est le plus pertinent |
| Tri lexicographique descendant sur le nom du backup | Le format `{module_id}_%Y%m%dT%H%M%S%f` garantit l'ordre chronologique par tri string |
| `target_path` issu exclusivement de `TARGET_PATHS` | Interdit toute redirection vers un chemin arbitraire |
| 404 si aucun backup (pas 200 + résultat vide) | Comportement REST explicite — l'absence de backup est une condition d'erreur |
| S8 live : réinstall avant rollback | Première install = backup skipped. S8 réinstalle pour créer un backup puis valide le rollback |

---

## 12_INVARIANTS

- `module_id` : seuls `[a-z0-9_]` autorisés → interdit `..`, `/`, `\`, espaces
- `backup_src` : toujours `relative_to(BACKUP_DIR)` — confiné dans `install-backups/`
- `target_path` : toujours `TARGET_PATHS["modules_dir"]` — jamais fourni par l'utilisateur
- `localcms-v5.html` : non modifié
- Pas de subprocess, pas d'os.system, pas d'endpoint DELETE/PUT/PATCH
- Pas de commit, pas de push, pas de merge, pas de tag

---

## 13_ESTABLISHED

### Route ajoutée

```
POST /api/installer/rollback
Montée dans : main.py via installer_router (prefix "/api/installer")
Fichier : api/cms_installer.py
```

### Contrat API retenu

| Champ | Valeur |
|---|---|
| Méthode | POST |
| URL | `/api/installer/rollback` |
| Body | `{"module_id": "my_module"}` |
| 200 OK | `{"result": "ok", "module_id": "...", "backup_used": "...", "restored_files": [...]}` |
| 400 | `module_id` invalide (hors `[a-z0-9_]+`) |
| 403 | Path violation (backup hors BACKUP_DIR) |
| 404 | Aucun backup trouvé pour ce `module_id` |
| 500 | Erreur de copie |

### Cas refusés

| Cas | Réponse |
|---|---|
| `module_id: "../etc"` | 400 — VALID_ID_RE |
| `module_id: "mod/evil"` | 400 — VALID_ID_RE |
| `module_id: ""` | 400 — VALID_ID_RE |
| `module_id: "module_inexistant"` | 404 — aucun backup |
| Backup manipulé hors BACKUP_DIR | 403 — relative_to check |

### Tests ajoutés

| Test | Fichier | Couverture |
|---|---|---|
| I16 | integration_test_pipeline.py | backup existant → fichier restauré + result=ok |
| I17 | integration_test_pipeline.py | module_id invalide → HTTPException 400 |
| I18 | integration_test_pipeline.py | aucun backup → HTTPException 404 |
| S8 | cms-installer.smoke.js | POST live → result=ok (réinstall → backup → rollback) |

### Résultats CI

```
integration_test_pipeline.py          18/18 PASS  (était 15/15 → +3)
integration_test_shared_explorer.py   23/23 PASS
npm run test:adopt                    540/540 PASS
shared-explorer.smoke.js (live)       6/6 PASS
cms-installer.smoke.js (live)         8/8 PASS   (était 7/7 → +1)

LocalCMS CI — PASS
```

### Fichiers modifiés

| Fichier | Modification | +/- |
|---|---|---|
| `api/cms_installer.py` | `RollbackRequest` + `POST /rollback` (49 lignes) | +55 |
| `tests/integration_test_pipeline.py` | `run_rollback_api()` + I16/I17/I18 | +68 |
| `tests/cms-installer.smoke.js` | Mock rollback + S8 | +45 |
| `scripts/run-ci-local.sh` | Résumé `7/7` → `8/8` | +1/-1 |

---

## 14_HYPOTHESIS

| Hypothèse | Statut | Résultat |
|---|---|---|
| H1 — `_rollback()` extractible en route HTTP | **CONFIRMÉE PARTIELLE** | Non réutilisable directement (prend `installed_files` courants). Logique HTTP propre implémentée avec mêmes invariants. |
| H2 — Backups horodatés adressables par timestamp | **CONFIRMÉE** | Tri lexicographique sur `{module_id}_%Y%m%dT%H%M%S%f` correct. |
| H_SAFETY — path traversal bloqué par VALID_ID_RE | **CONFIRMÉE** | `r"^[a-z0-9_]+$"` interdit tout caractère de traversal. |

---

## 15_REMAINING_GAP

| Gap | Description | Priorité V2 |
|---|---|---|
| GAP_RESTORE_API_ABSENTE | POST /api/installer/restore non exposé | P2 |
| GAP_ABSOLUTE_PATH_404 | Chemin absolu → 404 au lieu de 403 | P3 |
| GAP_PACKAGE_JSON_MODULE_WARN | Warning Node `type:module` absent | P4 |
| GAP_LEGACY_INSTALLER_SIMULE | MOD_INSTALLER simulé (frontend) | P5 |
| GAP_INSTALL_BACKUPS_TTL | Pas de purge TTL install-backups | P6 |

---

## 16_TODO

- [ ] GO_LOCALCMS_DBLAYER_V2_RESTORE_API_01 — POST /api/installer/restore (P2)
- [ ] Merge ce GO sur main après validation GitHub Actions

---

## 17_RESUME_POINT

```bash
cd /home/ghost/localcms
git status --short --branch
# go/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01
# M api/cms_installer.py
# M scripts/run-ci-local.sh
# M tests/cms-installer.smoke.js
# M tests/integration_test_pipeline.py
# ?? docs/chantiers/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01/
# ?? docs/responses/response_21_GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01.txt

# Commit quand autorisé :
git add \
  api/cms_installer.py \
  tests/integration_test_pipeline.py \
  tests/cms-installer.smoke.js \
  scripts/run-ci-local.sh \
  docs/chantiers/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01/ \
  docs/responses/response_21_GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01.txt
git commit -m "feat: expose POST /api/installer/rollback — GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01 PASS"
```

---

## Commandes exécutées

```bash
pwd
git status --short --branch
git remote -v
git branch -vv
git log --oneline -12
git tag --list "v0.1.0-dblayer"
git check-ignore -v .env
git check-ignore -v node_modules || true
bash scripts/run-ci-local.sh          # baseline avant patch
# Read : api/cms_installer.py, main.py, tests/cms-installer.test.js,
#         tests/cms-installer.smoke.js, tests/integration_test_pipeline.py,
#         scripts/run-ci-local.sh
# Read : docs/chantiers/GO_LOCALCMS_DBLAYER_V2_SCOPE_01/00_V2_SCOPE.md
# Read : docs/chantiers/GO_LOCALCMS_DBLAYER_BACKUP_ROLLBACK_01/00_BACKUP_ROLLBACK_BASELINE.md
# Edit : api/cms_installer.py (+RollbackRequest +POST /rollback)
# Edit : tests/integration_test_pipeline.py (+run_rollback_api +I16/I17/I18)
# Edit : tests/cms-installer.smoke.js (+mock rollback +S8)
# Edit : scripts/run-ci-local.sh (7/7 → 8/8)
bash scripts/run-ci-local.sh          # après patch → PASS
git diff --stat
git status --short --branch
```

---

## État Git final

```
## go/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01
 M api/cms_installer.py
 M scripts/run-ci-local.sh
 M tests/cms-installer.smoke.js
 M tests/integration_test_pipeline.py
?? docs/chantiers/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01/
?? docs/responses/response_21_GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01.txt

localcms-v5.html → non modifié
.env → non tracké (.gitignore:1:.env)
node_modules → non présent
artefacts runtime → non trackés (CI dans /tmp, trap cleanup EXIT)
```

---

## VERDICT

```
PASS
```

| Critère | Statut |
|---|---|
| Branche dédiée créée (go/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01) | PASS |
| Endpoint POST /api/installer/rollback exposé | PASS |
| Validation module_id (VALID_ID_RE) | PASS |
| Sécurité path backup (relative_to BACKUP_DIR) | PASS |
| target_path issu de TARGET_PATHS uniquement | PASS |
| Refus module_id invalide → 400 | PASS |
| Refus aucun backup → 404 | PASS |
| Refus path traversal → 400 (VALID_ID_RE bloque avant résolution) | PASS |
| Test I16 — rollback valide depuis backup existant | PASS |
| Test I17 — module_id invalide → 400 | PASS |
| Test I18 — aucun backup → 404 | PASS |
| Smoke S8 — rollback live → result=ok | PASS |
| integration_test_pipeline.py 18/18 | PASS |
| integration_test_shared_explorer.py 23/23 | PASS |
| npm run test:adopt 540/540 | PASS |
| cms-installer.smoke.js live 8/8 | PASS |
| bash scripts/run-ci-local.sh PASS | PASS |
| localcms-v5.html non modifié | PASS |
| .env non tracké | PASS |
| node_modules non tracké | PASS |
| Aucun artefact runtime tracké | PASS |
| Documentation baseline écrite | PASS |
| Réponse TXT écrite | PASS |

---

## Prochain GO logique

`GO_LOCALCMS_DBLAYER_V2_RESTORE_API_01`
  Exposer `POST /api/installer/restore`
  Base : merge de ce GO sur main, puis branche dédiée
