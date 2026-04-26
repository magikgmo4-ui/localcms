# 00_INSTALL_PIPELINE_BASELINE — GO_LOCALCMS_DBLAYER_INSTALL_PIPELINE_01

---

## 1_MASTER_TARGET

Valider le pipeline d'installation LocalCMS avec de vrais bundles `.zip` placés dans l'install-queue runtime, sans modifier les fichiers applicatifs.

Objectifs :
- Créer des bundles `.zip` de test valides et invalides dans `SHARED_ROOT/install-queue/`
- Détecter les bundles via `/api/installer/scan`
- Inspecter et pré-valider via `/api/installer/inspect` + `/api/installer/precheck`
- Traverser le pipeline complet via `/api/installer/install`
- Vérifier le refus des manifestes invalides
- Vérifier le fichier réellement installé dans `LOCALCMS_MODULES_DIR`
- 7/7 smokes LIVE + 15/15 tests unitaires PASS
- Aucun fichier applicatif modifié, aucun artefact tracké

---

## 3_INITIAL_NEED

Au départ (f124672) :
- `install-queue/` vide — aucun bundle `.zip` présent
- Pipeline complet (`/api/installer/install`) jamais traversé en live end-to-end
- Tests smoke S2/S3/S5/S7 skippés en live (bundles absents)
- `LOCALCMS_MODULES_DIR` vide — aucun module installé

Source : `docs/chantiers/GO_LOCALCMS_DBLAYER_ENV_SETUP_01/00_ENV_SETUP_BASELINE.md` — section "15_REMAINING_GAP"

---

## 7_CANONICAL_STATE

| Champ | Valeur |
|---|---|
| Machine | db-layer (/home/ghost/localcms) |
| Repo | /home/ghost/localcms |
| Remote | git@github.com:magikgmo4-ui/localcms.git |
| Branche | go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01 |
| HEAD départ | f124672 docs: archive LocalCMS env setup push response |
| HEAD fin | f124672 (inchangé — aucun commit effectué) |
| Date | 2026-04-26 |
| Opérateur | ghost |
| Agent | Claude Code CLI (claude-sonnet-4-6) |

---

## 13_ESTABLISHED

### Chemins runtime utilisés

| Chemin | Usage |
|---|---|
| `/home/ghost/localcms_runtime/shared/install-queue/` | Queue des bundles à installer |
| `/home/ghost/localcms_runtime/shared/install-logs/` | Logs d'installation (créé auto) |
| `/home/ghost/localcms_runtime/modules/` | Destination des modules installés |

### Bundles créés (hors git)

| Fichier | Taille | Contenu | Statut attendu |
|---|---|---|---|
| `test-module-v1.0.0.zip` | 483 bytes | manifest.json + module.js | Valide → install OK |
| `hello-mod-v1.0.0.zip` | 524 bytes | manifest.json + module.js (sanity_check) | Valide → install OK + sanity |
| `bad-module-v1.0.0.zip` | 395 bytes | manifest.json (4 erreurs) + module.js | Invalide → precheck failed |

### Contenu exact des manifestes

**test-module-v1.0.0.zip / manifest.json :**
```json
{
  "id": "test_module",
  "name": "Test Module",
  "version": "1.0.0",
  "description": "Module de test pour GO_LOCALCMS_DBLAYER_INSTALL_PIPELINE_01",
  "group": "tools",
  "target_key": "modules_dir",
  "files": [{"src": "module.js", "dest": "test-module.js"}]
}
```

**hello-mod-v1.0.0.zip / manifest.json :**
```json
{
  "id": "hello_mod",
  "name": "Hello Module",
  "version": "1.0.0",
  "description": "Module hello avec sanity_check pour test S7",
  "group": "tools",
  "target_key": "modules_dir",
  "files": [{"src": "module.js", "dest": "hello-mod.js"}],
  "sanity_check": "hello_mod_sanity"
}
```

**bad-module-v1.0.0.zip / manifest.json (intentionnellement invalide) :**
```json
{
  "id": "bad-module",
  "version": "1.0",
  "group": "custom_group",
  "files": [{"src": "module.js", "dest": "bad.exe"}]
}
```
Erreurs attendues : id avec tirets, version non semver, group non autorisé, extension .exe

### Fichiers installés dans LOCALCMS_MODULES_DIR

| Fichier | Taille | Source bundle |
|---|---|---|
| `/home/ghost/localcms_runtime/modules/test-module.js` | 90 bytes | test-module-v1.0.0.zip |
| `/home/ghost/localcms_runtime/modules/hello-mod.js` | 153 bytes | hello-mod-v1.0.0.zip |

---

## 14_HYPOTHESIS

### H1 — Python zipfile suffit pour créer des bundles valides
Confirmé : `python3 -c "import zipfile; ..."` crée des ZIPs lisibles par FastAPI.

### H2 — L'install pipeline écrit réellement dans LOCALCMS_MODULES_DIR
Confirmé : `ls /home/ghost/localcms_runtime/modules/` → `test-module.js` + `hello-mod.js` présents après install.

### H3 — Le backup est "skipped" si aucun fichier préexistant
Confirmé : première installation → `steps.backup.status = "skipped"`.

### H4 — sanity_check dans manifest → retourné dans la réponse install + post_check.status = "ok"
Confirmé : `hello-mod-v1.0.0.zip` → `sanity_check: "hello_mod_sanity"` + `post_check.status: "ok"`.

### H5 — bad-module → 4 erreurs simultanées détectées par precheck
Confirmé : id invalide, version invalide, group non autorisé, extension .exe — tous détectés en un seul appel.

---

## 15_REMAINING_GAP

| Gap | Description | Bloquant ? |
|---|---|---|
| Backup réel | Backup de fichier préexistant non testé (steps.backup.status = "ok") | Non |
| Rollback | Scénario rollback (install échoue en cours d'écriture) non testé | Non |
| Install bundle invalide end-to-end | `bad-module` testé uniquement au niveau precheck, pas install | Non |
| Frontend | `localcms-v5.html` non audité | Non |
| adopt.test.js | Sans runner configuré | Non |
| Réinstallation (backup) | Double install du même module non testé | Non |

---

## 16_TODO

- [ ] Tester le pipeline avec un fichier déjà installé → vérifier backup.status = "ok" et restauration
- [ ] Tester le rollback (corrompre volontairement un zip après staging)
- [ ] Configurer package.json + vitest pour les `adopt.test.js`
- [ ] Tester `/api/installer/install` avec `bad-module-v1.0.0.zip` directement

---

## 17_RESUME_POINT

```bash
cd /home/ghost/localcms
git status --short --branch
# → go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01 (clean)
# HEAD : f124672
# Runtime install-queue : 3 bundles ZIP
# Modules installés : test-module.js, hello-mod.js
# Prochain GO : GO_LOCALCMS_DBLAYER_BACKUP_ROLLBACK_01 (optionnel)
#            ou GO_LOCALCMS_DBLAYER_ADOPT_RUNNER_01 (adopt.test.js runner)

# Pour relancer le serveur :
set -a && source .env && set +a
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000
```

---

## Routes HTTP testées et résultats réels

| Route | Méthode | Body | Statut | Résultat |
|---|---|---|---|---|
| `/health` | GET | — | 200 | `{"status":"ok"}` |
| `/api/installer/scan` | GET | — | 200 | `{"bundles":[...3 items...],"count":3}` |
| `/api/installer/inspect?bundle=test-module-v1.0.0.zip` | GET | — | 200 | manifest + files_in_zip |
| `/api/installer/precheck` | POST | `{"bundle":"test-module-v1.0.0.zip"}` | 200 | `{"result":"ok","errors":[]}` |
| `/api/installer/precheck` | POST | `{"bundle":"bad-module-v1.0.0.zip"}` | 200 | `{"result":"failed","errors":[4 items]}` |
| `/api/installer/precheck` | POST | `{"bundle":""}` | 400 | `{"detail":"Le bundle doit être un fichier .zip"}` |
| `/api/installer/install` | POST | `{"bundle":"test-module-v1.0.0.zip"}` | 200 | `{"result":"ok","steps":{7 steps ok}}` |
| `/api/installer/install` | POST | `{"bundle":"hello-mod-v1.0.0.zip"}` | 200 | `{"result":"ok","sanity_check":"hello_mod_sanity","steps":{post_check:ok}}` |
| `/api/installer/history` | GET | — | 200 | 12 logs (scan + inspect + precheck + install × 2) |

---

## Tests live exécutés

### cms-installer.smoke.js — LIVE (BACKEND_URL=http://127.0.0.1:8000)

| ID | Nom | Résultat |
|---|---|---|
| S1 | Scan retourne bundles[] | PASS |
| S2 | Inspect retourne le manifeste | PASS |
| S3 | Precheck sur bundle valide → result ok | PASS |
| S4 | Precheck bundle vide → erreur retournée | PASS |
| S5 | Install retourne steps du pipeline | PASS |
| S6 | History retourne logs avec champs obligatoires | PASS |
| S7 | Install avec sanity_check : champ retourné + post_check ok | PASS |
| **TOTAL** | | **7/7 PASS** |

### cms-installer.test.js — Tests unitaires (mock)

| ID | Nom | Résultat |
|---|---|---|
| T1 | Manifeste valide retourne 0 erreur | PASS |
| T2 | Champ manquant détecté (target_key) | PASS |
| T3 | id avec tirets rejeté | PASS |
| T4 | version non semver rejetée | PASS |
| T5 | group non autorisé rejeté | PASS |
| T6 | target_key inconnue rejetée | PASS |
| T7 | path traversal dans dest rejeté | PASS |
| T8 | chemin absolu dans dest rejeté | PASS |
| T9 | extension .exe dans dest rejetée | PASS |
| T10 | src absent du zip détecté | PASS |
| T11 | files vide rejeté | PASS |
| T12 | extensions autorisées (.js .json .md .txt .css) acceptées | PASS |
| T13 | format log conforme (champs obligatoires) | PASS |
| T14 | sanity_check valide accepté (0 erreur) | PASS |
| T15 | sanity_check invalide rejeté | PASS |
| **TOTAL** | | **15/15 PASS** |

---

## Fichiers modifiés / créés

### Dans le dépôt git

| Fichier | Action | Tracké |
|---|---|---|
| `docs/chantiers/GO_LOCALCMS_DBLAYER_INSTALL_PIPELINE_01/00_INSTALL_PIPELINE_BASELINE.md` | Créé | OUI (doc) |
| `docs/responses/response_06_GO_LOCALCMS_DBLAYER_INSTALL_PIPELINE_01.txt` | Créé | OUI (doc) |

### Hors dépôt git (runtime)

| Chemin | Action |
|---|---|
| `/home/ghost/localcms_runtime/shared/install-queue/test-module-v1.0.0.zip` | Créé |
| `/home/ghost/localcms_runtime/shared/install-queue/hello-mod-v1.0.0.zip` | Créé |
| `/home/ghost/localcms_runtime/shared/install-queue/bad-module-v1.0.0.zip` | Créé |
| `/home/ghost/localcms_runtime/modules/test-module.js` | Installé par pipeline |
| `/home/ghost/localcms_runtime/modules/hello-mod.js` | Installé par pipeline |
| `/home/ghost/localcms_runtime/shared/install-logs/install_*.json` | Créés auto (12 logs) |

### Aucun fichier applicatif modifié

`main.py`, `api/cms_installer.py`, `api/shared_explorer.py`, `requirements.txt`, `.gitignore`, `localcms-v5.html`, tous `tests/` — **intacts**.

---

## État Git final

```
Sur la branche go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01
Votre branche est à jour avec 'origin/go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01'.
rien à valider, la copie de travail est propre
```

---

## VERDICT

```
PASS
```

| Critère | Statut |
|---|---|
| install-queue runtime fonctionnelle | PASS — 3 bundles détectés par /scan |
| Vrai bundle .zip détecté par /scan | PASS — count:3 |
| Manifest valide inspecté | PASS — inspect + precheck OK sur test-module |
| Cas invalide bloqué | PASS — bad-module → 4 erreurs, bundle vide → 400 |
| Pipeline complet traversé | PASS — 7 steps : precheck→backup→staging→validate→install→post_check→finalize |
| Fichier réellement installé | PASS — test-module.js + hello-mod.js dans modules/ |
| sanity_check retourné + post_check ok | PASS — hello_mod_sanity confirmé |
| Smoke LIVE 7/7 | PASS |
| Tests unitaires 15/15 | PASS |
| Aucun fichier applicatif modifié | PASS |
| Aucun secret tracké | PASS |
| Aucun artefact runtime tracké | PASS |
| Documentation écrite | PASS |

**Score : 22/22 tests PASS (7 smoke LIVE + 15 unitaires) | 9/9 routes HTTP validées**

---

## Prochain GO logique

`GO_LOCALCMS_DBLAYER_BACKUP_ROLLBACK_01` (optionnel) — tester le backup d'un module préexistant et le rollback sur install échouée.

**OU**

`GO_LOCALCMS_DBLAYER_ADOPT_RUNNER_01` — configurer package.json + vitest pour exécuter les 10 fichiers `adopt.test.js`.

---

## Point de reprise exact

```bash
cd /home/ghost/localcms
git status --short --branch
# → go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01 (clean)
# HEAD : f124672 (+ nouveaux docs non encore commités)
# Runtime : install-queue 3 bundles, modules/ 2 fichiers installés
# Score cumulé : 645 (baseline) + 13 (env setup live) + 22 (pipeline live) = 680 validations

# Pour relancer :
set -a && source .env && set +a
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000
```
