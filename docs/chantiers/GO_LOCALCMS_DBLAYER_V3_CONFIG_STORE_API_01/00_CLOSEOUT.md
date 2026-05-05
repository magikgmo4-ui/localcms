# GO_LOCALCMS_DBLAYER_V3_CONFIG_STORE_API_01

## VERDICT : PASS

## Périmètre livré

| Fichier | Action |
|---|---|
| `api/config_store.py` | Nouveau router M3 (list, get, save) |
| `main.py` | Montage `config_router` sous `/api/config`, version 1.0.2 |
| `tests/integration_test_config_store.py` | 8 tests d'intégration C1–C8 |
| `tests/cms-config.smoke.mjs` | 5 smokes MOCK + LIVE S1–S5 |
| `scripts/run-ci-local.sh` | Étapes 2b + 5c, `/shared/config` mkdir, résumé mis à jour |

## Routes M3

| Route | Description |
|---|---|
| `GET /api/config` | Liste les modules dont une config est sauvegardée |
| `GET /api/config/{module_id}` | Lit la config JSON d'un module |
| `POST /api/config/{module_id}` | Sauvegarde la config JSON d'un module |

Stockage : `/shared/config/{module_id}.json`
Contraintes : `module_id` validé `[a-z0-9_]+`, taille max 256 KB.

## Tests

| Suite | Résultat |
|---|---|
| `integration_test_config_store.py` | 8/8 |
| `cms-config.smoke.mjs` MOCK | 5/5 |
| `cms-config.smoke.mjs` LIVE | 5/5 |
| `integration_test_pipeline.py` | 26/26 (non-régression) |
| `integration_test_shared_explorer.py` | 26/26 (non-régression) |
| `npm run test:adopt` | 540/540 (non-régression) |

## Commit

```
f0c1856  feat: M3 Config Store API — persistence backend for all config modules
```

## Prochain GO

`GO_LOCALCMS_DBLAYER_V3_ENV_GLOBAL_WIRE_01` — raccorder `env-global` au M3
(remplacer `save()` stub de `MOD_ENV_GLOBAL` dans `localcms-v5.html`
par `POST /api/config/env_global` + chargement au `init()` via `GET /api/config/env_global`)
