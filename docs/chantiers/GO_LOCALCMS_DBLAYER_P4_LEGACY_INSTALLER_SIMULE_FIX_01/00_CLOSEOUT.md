# GO_LOCALCMS_DBLAYER_P4_LEGACY_INSTALLER_SIMULE_FIX_01

## VERDICT : PASS

## Problème initial

`MOD_INSTALLER` (panel "⬇ Installer") coexistait dans le frontend avec `MOD_CMS_INSTALLER`
(panel "📦 CMS Installer"). `MOD_INSTALLER` était entièrement simulé :
- toutes les actions utilisaient `setTimeout` sans appel backend réel
- référençait `./available/` inexistant côté serveur
- `ENV.registry` listait des modules avec des paths `./available/*.js` inexistants

`MOD_CMS_INSTALLER` est le vrai installateur connecté à `/api/installer/*`.

## Correctif

Suppression complète de `MOD_INSTALLER` de `localcms-v5.html` :

| Élément supprimé | Localisation (avant patch) |
|---|---|
| Nav item `data-panel="installer"` | ligne 486 |
| Panel div `id="panel-installer"` | ligne 597 |
| Bloc JS `/* -- installer.js -- */` … `})();` | lignes 4787–4938 (~155 lignes) |
| Entrée `MOD_INSTALLER,` dans la liste init | ligne 9335 |

`ENV.registry` et `ENV.getRegistry` conservés (dead data inoffensive dans l'objet ENV).

## Impact

| Critère | Résultat |
|---|---|
| Tests adopt 540/540 | aucune référence à MOD_INSTALLER — inchangé |
| Smokes live 6/6 + 10/10 | PASS |
| Lignes supprimées | ~155 |
| Fichiers touchés | `localcms-v5.html` uniquement |

## CI locale

```text
integration_test_pipeline.py          ✓  26/26
integration_test_shared_explorer.py   ✓  26/26
npm run test:adopt (9 suites)          ✓  540/540
shared-explorer.smoke.js (live 6/6)   ✓
cms-installer.smoke.js  (live 10/10)  ✓
LocalCMS CI — PASS
```

## Gaps restants

```text
P5 GAP_PACKAGE_JSON_MODULE_WARN + GAP_UTCNOW_DEPRECATION
P6 GAP_INSTALL_BACKUPS_TTL
```

## Point de reprise

```bash
cd "$HOME/localcms"
git status --short --branch
git log --oneline -8
bash scripts/run-ci-local.sh
```

Prochain candidat : `GO_LOCALCMS_DBLAYER_P5_WARNINGS_FIX_01`
(`GAP_PACKAGE_JSON_MODULE_WARN` + `GAP_UTCNOW_DEPRECATION` — les deux sont cosmétiques et peuvent tenir dans un seul GO)
