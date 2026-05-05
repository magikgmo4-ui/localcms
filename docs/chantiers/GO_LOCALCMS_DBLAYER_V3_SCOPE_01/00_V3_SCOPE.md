# GO_LOCALCMS_DBLAYER_V3_SCOPE_01

## VERDICT : SCOPE_PASS

## Contexte

LocalCMS V2 expose deux backends réels :
- **M1** `api/shared_explorer.py` — exploration/lecture de `/shared`
- **M2** `api/cms_installer.py` — installation, rollback, restore de modules

Le frontend `localcms-v5.html` contient **8 modules de configuration** supplémentaires
(env-global, machines-config, apps-config, sec-config, ia-config, data-sources,
devtools-config, queue-config) dont tous les boutons "Sauvegarder" sont des **stubs** :

```javascript
const save = () => BUS.emit('log:add', 'OK', 'Config sauvegardée');
```

Aucune donnée n'est persistée. Chaque rechargement de page repart des valeurs par défaut.

## Problème

Les modules de configuration n'ont pas de backend. L'utilisateur peut remplir des formulaires
(SSL, fail2ban, GPG, machines SSH, variables d'environnement…) mais **perdre toutes les
valeurs au rechargement**. Aucun moyen d'exporter ou d'importer sans intervention manuelle.

## Axe V3 retenu — M3 : Config Persistence API

**Un seul backend générique** couvrant tous les modules de configuration.

### API proposée

| Route | Description |
|---|---|
| `GET /api/config/{module_id}` | Lire la config JSON d'un module |
| `POST /api/config/{module_id}` | Écrire la config JSON d'un module |
| `GET /api/config` | Lister les modules dont une config est sauvegardée |

Stockage : `/shared/config/{module_id}.json`

### Contraintes de sécurité

- `module_id` validé : `[a-z0-9_]+` uniquement (pas de path traversal possible)
- Taille max payload : 256 KB (données de formulaire, pas de binaires)
- Aucune exécution de code
- Racine isolée `/shared/config/` — hors de `install-backups/` et `install-logs/`

### Périmètre

| Fichier | Action |
|---|---|
| `api/config_store.py` | Nouveau router M3 |
| `main.py` | Montage `config_router` sous `/api/config` |
| `localcms-v5.html` | Raccorder **un** module (env-global) pour valider le pattern |
| `tests/integration_test_config_store.py` | Tests intégration M3 |
| `tests/cms-config.smoke.mjs` | Smoke live M3 |

### Module pilote : `env-global`

`MOD_ENV_GLOBAL` est le candidat pilote :
- structure simple (25 champs, 3 groupes)
- aucun champ sensible (pas de mots de passe, pas de clés privées)
- `save()` actuel = 1 ligne stub → remplacement minimal

Une fois le pattern validé sur `env-global`, les autres modules suivent le même raccordement
sans modifier le backend.

## Axe alternatif écarté — IA runner

`GAP_IA_RUNNER_SIMULE` (panel `ia_run`) dépend d'une décision externe (ollama vs openai vs
autre). Aucune décision d'intégration n'a été prise. Écarté de V3.

## Risques

| Risque | Niveau | Mitigation |
|---|---|---|
| Écriture de données sensibles dans `/shared/config/` | Moyen | Valider `module_id`, pas de contenu exécutable, taille limitée |
| Conflit avec M1 (shared_explorer lit aussi `/shared`) | Faible | Sous-dossier `/shared/config/` — M1 peut naviguer dedans mais ne l'expose pas via `/read` si extension non whitelistée |
| Régression adopt 540/540 | Faible | M3 est un nouveau router — pas de modification des modules existants |

## Critère PASS V3

```text
GET  /api/config/env_global  → 200 { fields: {...} } ou 404 si vide
POST /api/config/env_global  → 200 { result: "ok" }
GET  /api/config             → 200 { configs: ["env_global", ...] }
MOD_ENV_GLOBAL.save() appelle POST /api/config/env_global (pas le stub BUS)
CI locale PASS — adopt 540/540 + nouveaux tests intégration M3
```

## Séquence des GOs V3

```text
GO_LOCALCMS_DBLAYER_V3_CONFIG_STORE_API_01  — M3 backend + tests
GO_LOCALCMS_DBLAYER_V3_ENV_GLOBAL_WIRE_01   — raccorder env-global au M3
GO_LOCALCMS_DBLAYER_V3_RELEASE_PREP_01      — release prep V3
GO_LOCALCMS_DBLAYER_V3_RELEASE_TAG_01       — tag v0.3.0-dblayer
```

## Invariants V3

- `main.py` version reste `1.0.1` jusqu'à release — mis à jour seulement au GO release prep
- M1 et M2 non modifiés par V3 sauf si bug découvert
- adopt 540/540 maintenu à tout moment
- aucun binaire ou clé privée stocké via M3

## Point de reprise

```bash
cd "$HOME/localcms"
git status --short --branch
git log --oneline -8
bash scripts/run-ci-local.sh
```

Premier GO V3 : `GO_LOCALCMS_DBLAYER_V3_CONFIG_STORE_API_01`
