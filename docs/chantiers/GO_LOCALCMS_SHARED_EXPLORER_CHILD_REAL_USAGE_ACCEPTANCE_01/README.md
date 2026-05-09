# GO_LOCALCMS_SHARED_EXPLORER_CHILD_REAL_USAGE_ACCEPTANCE_01

## Objectif

Valider Shared Explorer en condition réelle contrôlée avec arborescence runtime existante.

## Base canonique

- Repo: /home/ghost/localcms
- Branche: go/GO_LOCALCMS_SHARED_EXPLORER_CHILD_REAL_USAGE_ACCEPTANCE_01
- Base: main @ fa20e18
- Remote: git@github.com:magikgmo4-ui/localcms.git
- SHARED_ROOT runtime: `/home/ghost/localcms_runtime/shared`

---

## Arborescence runtime testée

```
/home/ghost/localcms_runtime/shared/
├── readme.md                  ← fichier texte — preview OK
├── big.log                    ← 8.5 MB — blocage preview > 5MB
├── docs/
│   └── hello.md               ← sous-dossier navigation
├── install-queue/             ← flux opérateur Installer
│   ├── bad-module-v1.0.0.zip
│   ├── hello-mod-v1.0.0.zip
│   ├── rollback-test-v1.0.0.zip
│   ├── test-module-v1.0.0.zip
│   └── test-module-v2.0.0.zip
├── install-logs/              ← logs structurés JSON
└── install-backups/           ← backups modules
```

---

## Résultats par cas

### list_directory

| Code | Cas | Résultat |
| ---- | --- | -------- |
| L1 | racine — entries[] retournées | PASS |
| L2 | sous-dossier `docs/` — `hello.md` présent | PASS |
| L3 | `install-queue/` — bundles .zip listés | PASS |
| L4 | path traversal `../../../etc` → 403 | PASS |
| L5 | dossier inexistant → 404 | PASS |

### read_file

| Code | Cas | Résultat |
| ---- | --- | -------- |
| R1 | `readme.md` — content non vide | PASS |
| R2 | `docs/hello.md` — contenu retourné | PASS |
| R3 | `big.log` (8.5 MB) → 413 | PASS |
| R4 | path traversal `../../../etc/passwd` → 403 | PASS |
| R5 | fichier inexistant → 404 | PASS |
| R6 | `.zip` binaire → 403 | PASS |

### search_files

| Code | Cas | Résultat |
| ---- | --- | -------- |
| S1 | `q=hello` — résultats non vides | PASS |
| S2 | `q=hello&ext=.md` — tous .md | PASS |
| S3 | sans paramètre → 400 | PASS |

### download

| Code | Cas | Résultat |
| ---- | --- | -------- |
| D1 | `readme.md` — 200 + Content-Disposition: attachment | PASS |
| D2 | `.zip` depuis install-queue — 200 téléchargeable | PASS |
| D3 | path traversal → 403 | PASS |

### Flux opérateur Installer

| Code | Cas | Résultat |
| ---- | --- | -------- |
| O1 | `install-queue/` visible avec bundles .zip | PASS |
| O2 | `install-logs/` visible avec fichiers JSON | PASS |
| O3 | read d'un log install JSON — contenu lisible | PASS |

**Total acceptance : 19/19 PASS**

---

## Tests existants

| Suite | Résultat |
| ----- | -------- |
| `tests/shared-explorer.smoke.js` | 6/6 PASS |
| `tests/integration_test_shared_explorer.py` | 26/26 PASS |

---

## Aucune modification applicative

- `api/shared_explorer.py` : non touché
- `modules/shared-explorer.js` : non touché
- Runtime : aucun fichier créé ou supprimé par ce GO

---

## Verdict

**PASS — 19/19 cas acceptance + 6/6 smokes + 26/26 intégration**

Shared Explorer est validé en condition réelle sur list, read, search, download et flux opérateur Installer.

## Prochain GO recommandé

Prochain chantier selon besoin : Config Store M3 acceptance réelle, hardening Shared Explorer erreurs, ou autre surface.
