# 00_CICD_FIXTURES_BASELINE — GO_LOCALCMS_DBLAYER_CICD_FIXTURES_01

---

## 1_MASTER_TARGET

Fermer `GAP_CICD_NO_BUNDLE_FIXTURES` : ajouter des fixtures déterministes versionnées pour les bundles installer CI, afin que les smokes `cms-installer.smoke.js` couvrent intégralement les cas bundle-dépendants (S2/S3/S5/S7) en GitHub Actions sans skip.

---

## 3_INITIAL_NEED

Après `GO_LOCALCMS_DBLAYER_CICD_01`, le script CI passait en local (runtime `/home/ghost/localcms_runtime/` disponible) mais 4 cas skippaient en environnement distant (GitHub Actions) :

| Smoke | Bundle attendu | Skip avant |
|---|---|---|
| S2 — Inspect | `test-module-v1.0.0.zip` | `(bundle absent en mode live — skip)` |
| S3 — Precheck valide | `test-module-v1.0.0.zip` | `(bundle absent — skip)` |
| S5 — Install pipeline | `test-module-v1.0.0.zip` | `(bundle absent — skip)` |
| S7 — Install sanity_check | `hello-mod-v1.0.0.zip` | `(bundle absent en mode live — skip)` |

Cause : le script copiait les bundles depuis `/home/ghost/localcms_runtime/shared/install-queue/` — chemin inexistant en CI GitHub Actions.

---

## 7_CANONICAL_STATE

| Champ | Valeur |
|---|---|
| Repo | /home/ghost/localcms |
| Branche | go/GO_LOCALCMS_DBLAYER_CICD_01 |
| HEAD base | b2c2705 feat: add LocalCMS CI pipeline |
| Date | 2026-04-29 |
| Python | 3.13.12 |
| Node.js | v22.22.2 |

---

## 13_ESTABLISHED

### Approche : sources versionnées + génération `.zip` en runtime

Conformément à la contrainte n°11 (préférer fixtures sources + génération runtime), les `.zip` ne sont **pas** commités. Seules les sources (`manifest.json` + fichier JS) sont versionnées. Le script génère les `.zip` avec `python3`/`zipfile` au démarrage de chaque run CI.

---

### Fixtures créées

#### `tests/fixtures/cms-installer/test-module-v1.0.0/`

| Fichier | Contenu |
|---|---|
| `manifest.json` | id: `test_module`, v1.0.0, group: `tools`, target_key: `modules_dir` |
| `module.js` | `const TEST_MODULE = { id: 'test_module', version: '1.0.0' };` |

```json
{
  "id": "test_module",
  "name": "Test Module",
  "version": "1.0.0",
  "description": "Module de test CI — fixture déterministe",
  "group": "tools",
  "target_key": "modules_dir",
  "files": [{"src": "module.js", "dest": "test-module.js"}]
}
```

Validation backend (`_validate_manifest`) : **0 erreur**.

#### `tests/fixtures/cms-installer/hello-mod-v1.0.0/`

| Fichier | Contenu |
|---|---|
| `manifest.json` | id: `hello_mod`, v1.0.0, `sanity_check: "hello_mod_sanity"` |
| `hello-mod.js` | `const HELLO_MOD = { id: 'hello_mod', sanity: 'hello_mod_sanity' };` |

```json
{
  "id": "hello_mod",
  "name": "Hello Mod",
  "version": "1.0.0",
  "description": "Module hello CI — fixture avec sanity_check",
  "group": "tools",
  "target_key": "modules_dir",
  "sanity_check": "hello_mod_sanity",
  "files": [{"src": "hello-mod.js", "dest": "hello-mod.js"}]
}
```

Validation backend : **0 erreur**. `sanity_check` = `"hello_mod_sanity"` → post_check.status = `"ok"` (requis par S7).

---

### Modification `scripts/run-ci-local.sh`

Remplacement du bloc "Copier les bundles depuis runtime local" par :

```bash
# Générer les bundles CI depuis les sources fixtures (déterministes — versionnées)
export FIXTURES_SRC="${REPO_DIR}/tests/fixtures/cms-installer"
printf "  Génération bundles depuis fixtures...\n"
python3 << 'PYEOF'
import zipfile, os

fixtures_dir = os.environ['FIXTURES_SRC']
queue_dir    = os.environ['LOCALCMS_SHARED_ROOT'] + '/install-queue'

for bundle_name in sorted(os.listdir(fixtures_dir)):
    src = os.path.join(fixtures_dir, bundle_name)
    if not os.path.isdir(src):
        continue
    zp = os.path.join(queue_dir, bundle_name + '.zip')
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as zf:
        for fn in sorted(os.listdir(src)):
            zf.write(os.path.join(src, fn), fn)
    print(f'  Bundle créé : {bundle_name}.zip')
PYEOF

# Bundles additionnels depuis le runtime local si disponible
QUEUE_SRC="/home/ghost/localcms_runtime/shared/install-queue"
if [ -d "$QUEUE_SRC" ]; then
  for f in "$QUEUE_SRC"/*.zip; do
    [ -f "$f" ] || continue
    bn="$(basename "$f")"
    dest="${LOCALCMS_SHARED_ROOT}/install-queue/${bn}"
    [ -f "$dest" ] || { cp "$f" "$dest" && printf "  Bundle additionnel : %s\n" "$bn"; }
  done
fi
```

Changement net : **+27 -6 lignes** sur `scripts/run-ci-local.sh`.

Le workflow `.github/workflows/localcms-ci.yml` est inchangé — il exécute déjà `bash scripts/run-ci-local.sh`.

---

### Résultats CI locale — avant/après

#### Avant (skips)

```
(bundle absent en mode live — skip)   ← S2
(bundle absent — skip)                ← S3
(bundle absent — skip)                ← S5
(bundle absent en mode live — skip)   ← S7
```

#### Après (aucun skip)

```
Bundle créé : hello-mod-v1.0.0.zip
Bundle créé : test-module-v1.0.0.zip
Bundle additionnel : bad-module-v1.0.0.zip
Bundle additionnel : rollback-test-v1.0.0.zip
Bundle additionnel : test-module-v2.0.0.zip
```

| Suite | Résultat |
|---|---|
| integration_test_pipeline.py | **15/15 PASS** |
| integration_test_shared_explorer.py | **23/23 PASS** |
| npm run test:adopt | **540/540 PASS** |
| shared-explorer.smoke.js (live) | **6/6 PASS** |
| cms-installer.smoke.js (live) | **7/7 PASS** — 0 skip |

---

### Note .gitignore CRLF

`git check-ignore -v tests/fixtures/` (avec slash final) retourne un faux positif dû aux fins de ligne CRLF dans `.gitignore`. Vérifié avec `--dry-run` : les 4 fichiers sources sont stagables et non ignorés. Aucune action requise sur le `.gitignore`.

---

## 14_HYPOTHESIS

| Hypothèse | Statut |
|---|---|
| H1 — Sources versionnées + génération runtime suffisent pour les smokes | CONFIRMÉ — 0 skip |
| H2 — Manifests validés contre les règles backend | CONFIRMÉ — 0 erreur |
| H3 — hello-mod retourne sanity_check = "hello_mod_sanity" | CONFIRMÉ — S7 PASS |
| H4 — Aucun .zip commité | CONFIRMÉ — seules 4 sources JS/JSON |
| H5 — Script reste fonctionnel en local avec runtime existant | CONFIRMÉ — bundles additionnels copiés |
| H6 — Workflow GitHub Actions inchangé (appel script) | CONFIRMÉ |

---

## 15_REMAINING_GAP

| Gap | Description | Bloquant |
|---|---|---|
| GAP_UTCNOW_DEPRECATION | `integration_test_shared_explorer.py:310` — `datetime.utcnow()` deprecated Python 3.12+ | Non — warning |
| GAP_PACKAGE_JSON_MODULE_WARN | Node warning `"type":"module"` absent | Non — cosmétique |
| GAP_LEGACY_INSTALLER_SIMULE | MOD_INSTALLER simulé (hérité) | Non |
| GAP_IA_RUNNER_SIMULE | IA Runner simulé (voulu V1) | Non |
| GAP_ROLLBACK_API_ABSENTE | Rollback interne uniquement | Non |
| GAP_RESTORE_API_ABSENTE | Restore non exposé | Non |
| ~~GAP_CICD_NO_BUNDLE_FIXTURES~~ | ~~Smokes installer skippent en CI distante~~ | **FERMÉ** |

---

## 16_TODO

- [ ] Optionnel : corriger `datetime.utcnow()` → `datetime.now(timezone.utc)` dans `integration_test_shared_explorer.py`
- [ ] Optionnel : ajouter `"type": "module"` à `package.json` pour supprimer le warning Node
- [ ] Optionnel : ajouter un bundle invalide en fixture pour tester le cas precheck=failed en CI

---

## 17_RESUME_POINT

```bash
cd /home/ghost/localcms
git status --short --branch
# go/GO_LOCALCMS_DBLAYER_CICD_01 (modifié)

bash scripts/run-ci-local.sh
# → LocalCMS CI — PASS (0 skip)
```

---

## Commandes exécutées

```bash
# Diagnostic
pwd && git status --short --branch && git remote -v && git branch -vv
git log --oneline -10
git check-ignore -v .env

# Baseline CI avec observation des skips
bash scripts/run-ci-local.sh    # → 4 skips S2/S3/S5/S7

# Identification précise
uvicorn port 18001 + BACKEND_URL=... node tests/cms-installer.smoke.js
# → 4 lignes "(bundle absent ... — skip)"

# Lecture
scripts/run-ci-local.sh, .github/workflows/localcms-ci.yml
tests/cms-installer.smoke.js

# Validation manifests
python3 -c "..." → 0 erreur x2

# Création fixtures sources
tests/fixtures/cms-installer/test-module-v1.0.0/manifest.json
tests/fixtures/cms-installer/test-module-v1.0.0/module.js
tests/fixtures/cms-installer/hello-mod-v1.0.0/manifest.json
tests/fixtures/cms-installer/hello-mod-v1.0.0/hello-mod.js

# Modification script
scripts/run-ci-local.sh : remplacement bloc "Copier les bundles"

# Exécution CI après patch
bash scripts/run-ci-local.sh
# → Bundle créé : hello-mod-v1.0.0.zip
# → Bundle créé : test-module-v1.0.0.zip
# → 0 skip, 7/7 PASS

# Vérification git
git status --short --branch
git diff --stat
git add --dry-run tests/fixtures/   # → ADD OK (4 fichiers)
find tests/fixtures/ -name "*.zip"  # → vide
```

---

## Fichiers créés/modifiés

| Fichier | Action |
|---|---|
| `tests/fixtures/cms-installer/test-module-v1.0.0/manifest.json` | Créé |
| `tests/fixtures/cms-installer/test-module-v1.0.0/module.js` | Créé |
| `tests/fixtures/cms-installer/hello-mod-v1.0.0/manifest.json` | Créé |
| `tests/fixtures/cms-installer/hello-mod-v1.0.0/hello-mod.js` | Créé |
| `scripts/run-ci-local.sh` | Modifié (+27 -6) |
| `.github/workflows/localcms-ci.yml` | **Non modifié** |
| Fichiers applicatifs | **Non modifiés** |
| `.env` | **Non tracké** |
| `node_modules` | **Absent** |

---

## État Git final

```
go/GO_LOCALCMS_DBLAYER_CICD_01 (base main b326781)
 M scripts/run-ci-local.sh
?? tests/fixtures/
   tests/fixtures/cms-installer/test-module-v1.0.0/manifest.json
   tests/fixtures/cms-installer/test-module-v1.0.0/module.js
   tests/fixtures/cms-installer/hello-mod-v1.0.0/manifest.json
   tests/fixtures/cms-installer/hello-mod-v1.0.0/hello-mod.js
?? docs/chantiers/GO_LOCALCMS_DBLAYER_CICD_FIXTURES_01/
?? docs/responses/response_17_GO_LOCALCMS_DBLAYER_CICD_FIXTURES_01.txt
```

---

## VERDICT

```
PASS
```

| Critère | Statut |
|---|---|
| GAP_CICD_NO_BUNDLE_FIXTURES fermé | PASS — 0 skip sur S2/S3/S5/S7 |
| scripts/run-ci-local.sh PASS | PASS |
| cms-installer.smoke.js live 7/7 (0 skip) | PASS |
| Aucun fichier applicatif modifié | PASS |
| Aucun secret tracké | PASS |
| .env ignoré | PASS |
| node_modules non tracké | PASS |
| Artefacts runtime non trackés (.zip) | PASS |
| Documentation écrite | PASS |
| Réponse TXT écrite | PASS |

---

## Prochain GO logique

`GO_LOCALCMS_DBLAYER_CICD_MERGE_MAIN_01`
  Merger la branche `go/GO_LOCALCMS_DBLAYER_CICD_01` vers `main` :
  merge `--no-ff`, vérification tests, push, tag optionnel.
