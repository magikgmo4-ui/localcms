# GO_LOCALCMS_OPERATOR_WORKFLOW_E2E_ACCEPTANCE_01

## Objectif

Valider le flux opérateur complet LocalCMS entre Shared Explorer V1 et CMS Module Installer V1.

## Base canonique

- Repo: /home/ghost/localcms
- Branche: go/GO_LOCALCMS_OPERATOR_WORKFLOW_E2E_ACCEPTANCE_01
- Base: main @ 7707ad9
- Remote: git@github.com:magikgmo4-ui/localcms.git
- Host test: `http://localhost:8001`
- SHARED_ROOT: `/home/ghost/localcms_runtime/shared`
- MODULES_DIR: `/home/ghost/localcms_runtime/modules`

---

## Bundle E2E utilisé

```json
{
  "id": "e2e_test_module",
  "name": "E2E Test Module",
  "version": "1.0.0",
  "group": "tools",
  "target_key": "modules_dir",
  "files": [{ "src": "e2e-test-module.js", "dest": "e2e-test-module.js" }],
  "sanity_check": null
}
```

Créé programmatiquement, testé, supprimé après test.

---

## Résultats — Shared Explorer

| Code | Cas | Résultat |
| ---- | --- | -------- |
| E1 | `list` racine — 6 entries retournées | PASS |
| E2 | `list install-queue` — e2e bundle visible | PASS |
| E3 | `read` .zip binaire → 403 | PASS |
| E4 | `download` .zip — 200 + Content-Disposition: attachment | PASS |
| E5 | `search q=e2e-test&ext=.zip` — 1 résultat | PASS |
| E6 | Path traversal `../../../etc` list → 403 / read → 403 | PASS |
| E7 | `list install-logs` — logs JSON visibles (100 entrées) | PASS |
| E8 | `read` log JSON install — contenu lisible | PASS |
| E9 | `list install-backups` — backups dirs visibles | PASS |

**Shared Explorer : 9/9 PASS**

---

## Résultats — CMS Installer

| Code | Cas | Résultat |
| ---- | --- | -------- |
| I1 | `scan` — e2e bundle présent | PASS |
| I2 | `inspect` — manifeste retourné complet | PASS |
| I3 | `precheck` — `result: ok`, `errors: []` | PASS |
| I4 | `install` — pipeline 7 étapes, `result: ok`, backup: skipped (1ère install) | PASS |
| I4b | réinstall — backup: ok (fichier préexistant) | PASS |
| I5 | `history` — 4 entrées e2e_test_module en base | PASS |
| I6 | `rollback` — `result: ok`, backup restauré | PASS |

**CMS Installer : 7/7 PASS**

---

## Pipeline observé (install étape 1)

```
precheck  → ok
backup    → skipped (première install)
staging   → ok
validate  → ok
install   → ok
post_check→ skipped (sanity_check: null)
finalize  → ok
result    → ok
```

## Pipeline observé (install étape 2 — réinstall)

```
precheck  → ok
backup    → ok  (fichier préexistant copié dans install-backups)
staging   → ok
validate  → ok
install   → ok
post_check→ skipped
finalize  → ok
result    → ok
```

---

## Smokes post-E2E

| Suite | Résultat |
| ----- | -------- |
| `tests/shared-explorer.smoke.js` (live) | 6/6 PASS |
| `tests/cms-installer.smoke.mjs` (live) | 10/10 PASS |

---

## Isolation runtime vérifiée

Après test :
- `install-queue/e2e-test-module-v1.0.0.zip` : **supprimé** ✓
- `modules/e2e-test-module.js` : **supprimé** ✓
- `install-backups/e2e_test_module_*` : **supprimés** ✓
- Logs install-logs : conservés (comportement normal)
- Bundles préexistants (hello-mod, test-module…) : **non touchés** ✓

---

## Couverture guides opérateur

Les deux guides couvrent le parcours E2E réellement testé :

| Guide | Section lien E2E |
| ----- | ---------------- |
| `SHARED_EXPLORER_V1_OPERATOR_GUIDE.md` | §9 Lien avec CMS Installer (install-queue, install-logs, install-backups) |
| `CMS_INSTALLER_V1_OPERATOR_GUIDE.md` | §3 Flux opérateur UI + §4 API endpoints |

Aucune lacune détectée dans les guides.

---

## Aucune modification applicative

- `api/shared_explorer.py` : non touché
- `api/cms_installer.py` : non touché
- `modules/shared-explorer.js` : non touché
- `modules/cms-installer.js` : non touché
- Runtime : propre après nettoyage

---

## Verdict

**PASS — 9/9 Shared Explorer + 7/7 Installer + 6/6 smokes SE + 10/10 smokes Installer**

Le flux opérateur end-to-end est validé :
Shared Explorer repère le bundle → download possible → Installer scan/inspect/precheck/install/rollback/history — tout fonctionne sans modification applicative.

## Prochain GO recommandé

Prochain chantier selon besoin : Config Store M3 acceptance réelle, M3 guide opérateur, ou hardening complémentaire.
