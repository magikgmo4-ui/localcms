# Branch-ready LocalCMS bundle — M1 Shared Explorer + M2 CMS Installer

## Canonical sources retained
- Base repo snapshot: `localcms_session_M4.4_ALL/`
- M1 canonical source: `MOD_SHARED_EXPLORER_V1_CLOSUREPACK`
- M2 canonical source: `MOD_CMS_INSTALLER_V1_CORRECTED`

## What was organized
- `localcms-v5.html` patched for M1 + M2 external module loading
- `modules/shared-explorer.js` added
- `modules/cms-installer.js` added
- `api/shared_explorer.py` added
- `api/cms_installer.py` added
- `tests/` populated with M1 + M2 tests
- `docs/module/` contains original patch docs and README files
- `docs/claude/` contains M1 continuity docs
- `docs/planning/` contains kanban/planning refs

## Suggested Git branch
`feature/localcms-shared-explorer-cms-installer-v1`

## Suggested git commands
```bash
git checkout -b feature/localcms-shared-explorer-cms-installer-v1
mkdir -p api tests docs/module docs/claude docs/planning
cp -r <this_bundle>/* <repo_root>/
git status
git add localcms-v5.html modules/shared-explorer.js modules/cms-installer.js api/shared_explorer.py api/cms_installer.py tests/shared-explorer.test.js tests/shared-explorer.smoke.js tests/cms-installer.test.js tests/cms-installer.smoke.js tests/integration_test_pipeline.py docs/module/PATCH_LOCALCMS_V5_M1.txt docs/module/PATCH_LOCALCMS_V5_M2.txt docs/module/README_M1.md docs/module/README_M2.md docs/claude docs/planning/plan_modulaire_explorateur_shared_installateur_cms.pdf docs/planning/audit_kanban_projet_rempli_v3.md BRANCH_INTEGRATION_README.md
```

## Important
- M1 is closure-packed; M2 is corrected but not closure-packed.
- Before marking M2 `validated`, run LIVE smoke and a real install test in your environment.
- `TARGET_PATHS["modules_dir"]` must be confirmed locally.
