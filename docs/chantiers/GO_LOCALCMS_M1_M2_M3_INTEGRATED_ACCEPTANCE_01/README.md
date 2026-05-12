# GO_LOCALCMS_M1_M2_M3_INTEGRATED_ACCEPTANCE_01

## Objectif

Valider le parcours produit complet M1 + M2 + M3 en conditions réelles : Shared Explorer voit les zones runtime, Installer installe un vrai module, Config Store écrit la config, Shared Explorer lit le JSON produit, rollback module, vérification politique config post-rollback, logs visibles.

## Base canonique

- Repo: /home/ghost/localcms
- Branche: go/GO_LOCALCMS_M1_M2_M3_INTEGRATED_ACCEPTANCE_01
- Base: main @ a531d8d
- Remote: git@github.com:magikgmo4-ui/localcms.git
- Host test: `http://localhost:8001`
- SHARED_ROOT: `/home/ghost/localcms_runtime/shared`
- MODULES_DIR: `/home/ghost/localcms_runtime/modules`

## Module candidat

`modules/env-global.js` — `MOD_ENV_GLOBAL_DATA` · M-3.4 · v1.0.0

---

## Résultats — 18/18 PASS

### Phase 1 — Shared Explorer : zones runtime

| Code | Cas | Résultat |
| ---- | --- | -------- |
| I1 | `list install-queue` — 5 bundles visibles | PASS |
| I2 | `list install-logs` — 100 logs visibles | PASS |
| I3 | `list install-backups` — 10 backup dirs visibles | PASS |
| I4 | `list config/` avant write M3 → 404 (répertoire absent) | PASS |

### Phase 2 — CMS Installer : pipeline complet

| Code | Cas | Résultat |
| ---- | --- | -------- |
| I5 | `scan` — bundle `env-global-v1.0.0.zip` présent | PASS |
| I6 | `precheck` — `result: ok`, `errors: []` | PASS |
| I7 | `install` (1ère) — 7 étapes, `result: ok`, `backup: skipped` | PASS |
| I8 | réinstall — `result: ok`, `backup: ok` | PASS |
| I9 | `history` — 21 entrées `env_global` visibles | PASS |

### Phase 3 — Config Store : write + read

| Code | Cas | Résultat |
| ---- | --- | -------- |
| I10 | `POST /api/config/env_global` — save config module | PASS |
| I11 | `GET /api/config/env_global` — data intact retourné | PASS |

### Phase 4 — Shared Explorer lit le JSON produit par M3

| Code | Cas | Résultat |
| ---- | --- | -------- |
| I12 | `list config/` — `env_global.json` visible après write M3 | PASS |
| I13 | `read config/env_global.json` — JSON config lisible | PASS |

### Phase 5 — Rollback module

| Code | Cas | Résultat |
| ---- | --- | -------- |
| I14 | `rollback env_global` — `result: ok`, backup restauré | PASS |
| I15 | fichier module présent post-rollback (9 239 bytes) | PASS |

### Phase 6 — Config après rollback module

| Code | Cas | Résultat |
| ---- | --- | -------- |
| I16 | `GET /api/config/env_global` post-rollback — **config toujours présente** | PASS |

### Phase 7 — Logs et history post-rollback

| Code | Cas | Résultat |
| ---- | --- | -------- |
| I17 | `history` — 22 entrées env_global dont rollback visible | PASS |
| I18 | Shared Explorer `read` log rollback JSON — lisible | PASS |

---

## Observation clef : indépendance Config Store / Installer

Le rollback CMS Installer (restitution du fichier module) **n'affecte pas** la config M3 :

```
rollback env_global → env-global.js restauré depuis backup
GET /api/config/env_global → config encore accessible, data intact
```

Config Store et Installer sont deux espaces orthogonaux :
- Installer gère `MODULES_DIR/` (fichiers JS exécutables)
- Config Store gère `SHARED_ROOT/config/` (JSON de configuration)

Un rollback module ne rollback pas la config. C'est le comportement attendu et documenté.

---

## Smokes intégrés (tous trois modules simultanément)

| Suite | Résultat |
| ----- | -------- |
| `tests/shared-explorer.smoke.js` (live) | 6/6 PASS |
| `tests/cms-installer.smoke.mjs` (live) | 10/10 PASS |
| `tests/cms-config.smoke.mjs` (live) | 5/5 PASS |

---

## Isolation runtime — cleanup complet

| Artefact | État |
|---|---|
| `install-queue/env-global-v1.0.0.zip` | supprimé ✓ |
| `modules/env-global.js` | supprimé ✓ |
| `install-backups/env_global_*` | supprimé ✓ |
| `config/env_global.json` | supprimé ✓ |
| `config/` (répertoire) | supprimé ✓ |
| Bundles et backups préexistants | non touchés ✓ |

---

## Aucune modification applicative

- `api/shared_explorer.py` : non touché
- `api/cms_installer.py` : non touché
- `api/config_store.py` : non touché
- Modules JS : non touchés

---

## Verdict

**PASS — 18/18 cas + 6/6 SE + 10/10 Installer + 5/5 Config Store smokes**

Le parcours produit complet M1 + M2 + M3 est validé en conditions réelles. Les trois modules opèrent de façon cohérente et orthogonale. La politique de config post-rollback est documentée.

## Prochain GO recommandé

Prochain chantier selon besoin : guide opérateur M3 Config Store, hardening complémentaire, ou surface suivante.
