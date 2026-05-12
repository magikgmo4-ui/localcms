# GO_LOCALCMS_CONFIG_STORE_M3_ACCEPTANCE_01

## Objectif

Valider Config Store M3 comme brique canonique LocalCMS : endpoints, validation, erreurs, lien Shared Explorer.

## Base canonique

- Repo: /home/ghost/localcms
- Branche: go/GO_LOCALCMS_CONFIG_STORE_M3_ACCEPTANCE_01
- Base: main @ d33f499
- Remote: git@github.com:magikgmo4-ui/localcms.git
- Host test: `http://localhost:8001`
- SHARED_ROOT: `/home/ghost/localcms_runtime/shared`
- Config dir: `$SHARED_ROOT/config/`

---

## Surface testée

### Backend — `api/config_store.py` (102 lignes)

| Élément | Valeur |
|---|---|
| Router prefix | `/api/config` |
| Config dir | `$LOCALCMS_SHARED_ROOT/config/` |
| Format fichier | `<module_id>.json` (JSON brut, clé = data payload) |
| Taille max | 256 KB |
| module_id valide | `[a-z0-9_]+` uniquement |
| Endpoints | `GET /`, `GET /{module_id}`, `POST /{module_id}` |

---

## Résultats acceptance

| Code | Cas | Résultat |
| ---- | --- | -------- |
| C1 | `GET /api/config` — liste initiale vide | PASS |
| C2 | `POST /api/config/env_global` — save config valide | PASS |
| C3 | `GET /api/config/env_global` — lecture config sauvegardée | PASS |
| C4 | `POST /api/config/apps_config` — second module indépendant | PASS |
| C5 | `GET /api/config` — liste après 2 saves → `['apps_config','env_global']` | PASS |
| C6 | `POST /api/config/env_global` — écrasement config existante | PASS |
| C7 | `POST /api/config/EnvGlobal` — module_id invalide → 400 | PASS |
| C8 | `GET /api/config/nonexistent_xyz` — module inexistant → 404 | PASS |
| C9 | `POST` payload 300 KB — oversized → 413 | PASS |
| C10 | Shared Explorer `list config/` — `env_global.json` + `apps_config.json` visibles | PASS |
| C11 | Shared Explorer `read config/env_global.json` — JSON lisible | PASS |

**11/11 PASS**

---

## Réponses API observées

### POST /api/config/env_global

```json
{ "result": "ok", "module_id": "env_global" }
```

### GET /api/config/env_global

```json
{
  "module_id": "env_global",
  "data": {
    "MACHINE_HOST": "prod-01.local",
    "ENV_TYPE": "production",
    "LOG_LEVEL": "INFO",
    "SHARED_DIR": "/home/ghost/localcms_runtime/shared"
  }
}
```

### GET /api/config (après 2 saves)

```json
{ "configs": ["apps_config", "env_global"], "count": 2 }
```

### Erreurs

| HTTP | Cause | Message |
|---|---|---|
| 400 | module_id invalide | `"module_id invalide — seuls [a-z0-9_] autorisés"` |
| 404 | module inexistant | `"Aucune config sauvegardée pour : nonexistent_xyz"` |
| 413 | payload > 256 KB | `"Config trop volumineuse (max 256 KB)"` |

---

## Lien Shared Explorer

Les configs sont stockées dans `$LOCALCMS_SHARED_ROOT/config/` et sont exploitables via Shared Explorer :

```bash
# Lister les configs
GET /api/shared/list?path=config
# → entries: ['apps_config.json', 'env_global.json']

# Lire une config
GET /api/shared/read?path=config/env_global.json
# → content: { "MACHINE_HOST": "...", ... }
```

---

## Suites de tests

| Suite | Mode | Résultat |
| ----- | ---- | -------- |
| `tests/integration_test_config_store.py` | logique pure | 8/8 PASS |
| `tests/cms-config.smoke.mjs` | mock | 5/5 PASS |
| `tests/cms-config.smoke.mjs` | live | 5/5 PASS |

---

## Structure fichier config

```
$LOCALCMS_SHARED_ROOT/
└── config/
    ├── env_global.json      ← { "MACHINE_HOST": "...", ... }
    └── apps_config.json     ← { "theme": "dark", ... }
```

Chaque fichier `<module_id>.json` contient directement la valeur `data` (sans enveloppe).

---

## Isolation runtime vérifiée

- `config/env_global.json` : supprimé ✓
- `config/apps_config.json` : supprimé ✓
- Répertoire `config/` : supprimé ✓

---

## Aucune modification applicative

- `api/config_store.py` : non touché
- `tests/integration_test_config_store.py` : non touché
- `tests/cms-config.smoke.mjs` : non touché

---

## Verdict

**PASS — 11/11 cas acceptance + 8/8 intégration + 5/5 smokes live**

Config Store M3 est validé en condition réelle : list, save, read, overwrite, erreurs 400/404/413, visibilité Shared Explorer. Aucun gap détecté.

## Prochain GO recommandé

Prochain chantier selon besoin : guide opérateur M3 Config Store, ou surface suivante.
