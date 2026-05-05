# GO_LOCALCMS_DBLAYER_V3_ENV_GLOBAL_WIRE_01

## VERDICT : PASS

## Périmètre livré

| Fichier | Action |
|---|---|
| `localcms-v5.html` | `MOD_ENV_GLOBAL` bridgé au M3 Config Store |

Aucune modification du backend M3, des tests d'intégration, ni du CI script.

## Comportement livré

### `init()`
- Rend le formulaire immédiatement avec les valeurs par défaut (`render()` synchrone)
- Lance `GET /api/config/env_global` en arrière-plan
- Si 200 : applique `data` dans `_buf`, puis `_applyBuf()` hydrate les champs visibles
- Si 404 ou erreur réseau : silencieux, les defaults restent affichés

### `save()`
- `_collectGroup()` lit les champs du groupe actif depuis le DOM → fusionne dans `_buf`
- `POST /api/config/env_global` avec `{ data: _buf }`
- Succès : `BUS.emit('log:add','OK','Profil ENV Global sauvegardé')`
- Échec HTTP : `BUS.emit('log:add','FAIL', detail)`
- Erreur réseau : `BUS.emit('log:add','FAIL', message)`

### `setGroup(g)`
- `_collectGroup()` sauvegarde le groupe actif dans `_buf` avant de switcher
- Re-render du nouveau groupe
- `_applyBuf()` réapplique les valeurs sauvegardées dans `_buf`

### `_buf`
- Accumulateur in-memory, persiste entre les switchs de groupes
- Initialisé à `{}` ; peuplé par l'API au chargement ou par `_collectGroup()` à la saisie

## CI

| Suite | Résultat |
|---|---|
| `integration_test_pipeline.py` | 26/26 |
| `integration_test_shared_explorer.py` | 26/26 |
| `integration_test_config_store.py` | 8/8 |
| `npm run test:adopt` | 540/540 |
| `shared-explorer.smoke.js` (live) | 6/6 |
| `cms-installer.smoke.mjs` (live) | 10/10 |
| `cms-config.smoke.mjs` (live) | 5/5 |

## Commit

```
88a3cad  feat: wire env-global to M3 config store
```

## Prochain GO

`GO_LOCALCMS_DBLAYER_V3_RELEASE_PREP_01` — release prep V3
- Bumper `main.py` version à `1.0.3`
- Mettre à jour `CHANGELOG` ou docs si présents
- Vérifier que tous les invariants V3 sont respectés
- CI PASS final avant tag
