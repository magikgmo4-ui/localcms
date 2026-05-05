# GO_LOCALCMS_DBLAYER_P5_WARNINGS_FIX_01

## VERDICT : PASS

## Gaps traités

### GAP_PACKAGE_JSON_MODULE_WARN

**Problème** : Node.js émettait `[MODULE_TYPELESS_PACKAGE_JSON] Warning` lors de l'exécution
de `tests/cms-installer.smoke.js` car le fichier contient du top-level `await` (ESM) mais
`package.json` ne déclarait pas `"type": "module"`.

**Raison de ne pas ajouter `"type": "module"` globalement** : tous les tests adopt
(`scripts/run-adopt.js`, `tests/*-adopt.test.js`) utilisent `require()` CommonJS — les
passer en ESM aurait tout cassé.

**Correctif** : renommage `cms-installer.smoke.js` → `cms-installer.smoke.mjs`. L'extension
`.mjs` déclare ESM explicitement sans affecter les fichiers CommonJS.

Fichiers modifiés :
- `tests/cms-installer.smoke.js` → `tests/cms-installer.smoke.mjs` (rename)
- `scripts/run-ci-local.sh` (3 références mises à jour)

### GAP_UTCNOW_DEPRECATION

**Problème** : `datetime.utcnow()` est deprecated en Python 3.12+, présent dans deux fichiers.

**Correctifs** :
- `api/shared_explorer.py` L18 : import `timezone` ajouté
- `api/shared_explorer.py` L66 : `datetime.utcnow()` → `datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')`
- `tests/integration_test_shared_explorer.py` L325 : `datetime.utcnow()` → `datetime.now()`

Note : le test S7 utilise `datetime.now()` (naive) plutôt que `datetime.now(timezone.utc)` (aware)
car `search_files` compare des datetimes naives via `datetime.fromtimestamp()`. Un aware datetime
dans `from_` aurait provoqué une erreur de comparaison.

## CI locale

```text
integration_test_pipeline.py          ✓  26/26
integration_test_shared_explorer.py   ✓  26/26
npm run test:adopt (9 suites)          ✓  540/540
shared-explorer.smoke.js (live 6/6)   ✓
cms-installer.smoke.mjs (live 10/10)  ✓
MODULE_TYPELESS_PACKAGE_JSON warning  : absent
DeprecationWarning utcnow             : absent
LocalCMS CI — PASS
```

## Gaps restants

```text
P6 GAP_INSTALL_BACKUPS_TTL
```

## Point de reprise

```bash
cd "$HOME/localcms"
git status --short --branch
git log --oneline -8
bash scripts/run-ci-local.sh
```

Prochain candidat : `GO_LOCALCMS_DBLAYER_P6_INSTALL_BACKUPS_TTL_SCOPE_01`
