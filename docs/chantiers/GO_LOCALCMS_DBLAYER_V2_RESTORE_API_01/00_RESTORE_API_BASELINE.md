# 00_RESTORE_API_BASELINE — GO_LOCALCMS_DBLAYER_V2_RESTORE_API_01

---

## 1_MASTER_TARGET

Exposer deux nouveaux endpoints REST dans le CMS Module Installer :
- `GET /api/installer/backups` — lister les backups disponibles (filtre optionnel `?module_id=`)
- `POST /api/installer/restore` — restaurer un backup explicitement ciblé par `backup_name`

Distinction fondamentale : rollback = dernier backup automatiquement ; restore = backup nommé explicitement.

---

## 3_INITIAL_NEED

Après l'intégration de `POST /api/installer/rollback` (GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01), le prochain gap prioritaire est l'exposition du restore explicite. L'utilisateur doit pouvoir lister les backups disponibles puis restaurer un backup précis par son nom.

---

## 7_CANONICAL_STATE

| Champ | Valeur |
|---|---|
| Repo | /home/ghost/localcms |
| Branche | go/GO_LOCALCMS_DBLAYER_V2_RESTORE_API_01 |
| HEAD base | 649bb0c docs: record LocalCMS rollback API GitHub Actions verify PASS |
| Date | 2026-04-29 |

---

## 13_ESTABLISHED

### Fichiers modifiés

| Fichier | Type | Détail |
|---|---|---|
| `api/cms_installer.py` | +94 lignes | `VALID_BACKUP_RE` + `RestoreRequest` + `GET /backups` + `POST /restore` |
| `tests/integration_test_pipeline.py` | +150 lignes | `VALID_BACKUP_RE` + `run_backups_api` + `run_restore_api` + I19–I26 |
| `tests/cms-installer.smoke.js` | +90 lignes | `MOCK_BACKUPS` + mock GET/backups + mock POST/restore + S9 + S10 |
| `scripts/run-ci-local.sh` | +1/-1 | résumé `8/8` → `10/10` |

### Nouveaux endpoints

#### GET /api/installer/backups

- Paramètre optionnel : `?module_id=<id>` (validé via `VALID_ID_RE`)
- Lit `BACKUP_DIR`, filtre les dossiers conformes à `VALID_BACKUP_RE`
- Tri décroissant (le plus récent en premier)
- Retourne `{"result":"ok","backups":[{"module_id","backup_name","timestamp","files"}],"count":N}`
- Erreurs : 400 si `module_id` invalide, 500 si erreur filesystem

#### POST /api/installer/restore

- Body : `{"module_id": "...", "backup_name": "..."}`
- Validations : `VALID_ID_RE` sur `module_id`, pas de `/ \ ..` dans `backup_name`, `backup_name` doit commencer par `{module_id}_`
- Confinement : `backup_src.resolve().relative_to(BACKUP_DIR.resolve())`
- Copie les fichiers du backup vers `TARGET_PATHS["modules_dir"]`
- Retourne `{"result":"ok","module_id","backup_used","restored_files"}`
- Erreurs : 400 invalide, 403 path violation, 404 backup absent, 500 échec copie

### Constante ajoutée

```python
VALID_BACKUP_RE = re.compile(r"^([a-z0-9_]+)_(\d{8}T\d{12})$")
```

Group 1 = `module_id`, Group 2 = `timestamp`. Le `T` majuscule force la frontière correcte même si `module_id` contient des underscores.

### Tests ajoutés

#### integration_test_pipeline.py (I19–I26)

| Test | Scénario | Résultat attendu |
|---|---|---|
| I19 | Backups API liste tous les backups | triés décroissant |
| I20 | Filtre par module_id | seuls ses backups |
| I21 | Filtre sur module sans backup | liste vide, count=0 |
| I22 | Restore backup valide | fichier restauré, result=ok |
| I23 | Restore module_id invalide | HTTPException 400 |
| I24 | Restore backup_name path traversal | HTTPException 400 |
| I25 | Restore backup_name ne correspond pas | HTTPException 400 |
| I26 | Restore backup inexistant | HTTPException 404 |

#### cms-installer.smoke.js (S9–S10)

| Smoke | Endpoint | Mode |
|---|---|---|
| S9 | GET /api/installer/backups | mock + live |
| S10 | POST /api/installer/restore | mock (backup_name fixe) + live (backup_name depuis GET /backups) |

### Résultats CI

| Suite | Résultat |
|---|---|
| integration_test_pipeline.py | **26/26 PASS** (I1–I26) |
| integration_test_shared_explorer.py | **23/23 PASS** |
| npm run test:adopt | **540/540 PASS** |
| shared-explorer.smoke.js (live) | **6/6 PASS** |
| cms-installer.smoke.js (live) | **10/10 PASS** |
| **LocalCMS CI** | **PASS** |

---

## 15_REMAINING_GAP

| Gap | Description | Priorité V2 |
|---|---|---|
| GAP_ABSOLUTE_PATH_404 | Chemin absolu → 404 au lieu de 403 | P3 |
| GAP_PACKAGE_JSON_MODULE_WARN | Warning Node `type:module` absent | P4 |
| GAP_LEGACY_INSTALLER_SIMULE | MOD_INSTALLER simulé (frontend) | P5 |
| GAP_INSTALL_BACKUPS_TTL | Pas de purge TTL install-backups | P6 |

---

## 16_TODO

- [ ] Merge go/GO_LOCALCMS_DBLAYER_V2_RESTORE_API_01 → main (prochain GO)

---

## 17_RESUME_POINT

```bash
cd "$HOME/localcms"
git status --short --branch
# go/GO_LOCALCMS_DBLAYER_V2_RESTORE_API_01 (4 fichiers modifiés, non commités)
git diff --stat HEAD
bash scripts/run-ci-local.sh
```

---

## Commandes exécutées

```bash
git status --short --branch
git log --oneline -5
# (Edit api/cms_installer.py × 3)
# (Edit tests/integration_test_pipeline.py × 3)
# (Edit tests/cms-installer.smoke.js × 4)
# (sed scripts/run-ci-local.sh)
bash scripts/run-ci-local.sh  # LocalCMS CI — PASS
```

---

## VERDICT

```
PASS
```

| Critère | Statut |
|---|---|
| GET /api/installer/backups exposé | PASS |
| POST /api/installer/restore exposé | PASS |
| VALID_BACKUP_RE ajouté (api + test) | PASS |
| RestoreRequest Pydantic ajouté | PASS |
| Path confinement backup_src → BACKUP_DIR | PASS |
| backup_name ne peut pas traverser modules | PASS |
| I19–I26 ajoutés et passés | PASS |
| S9–S10 ajoutés et passés (mock + live) | PASS |
| CI 26/26 + 23/23 + 540/540 + 6/6 + 10/10 | PASS |
| localcms-v5.html non modifié | PASS |
| .env non tracké | PASS |
| node_modules non tracké | PASS |
| Ne commit pas | PASS |
| Ne push pas | PASS |
