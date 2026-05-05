# GO_LOCALCMS_DBLAYER_P3_ABSOLUTE_PATH_404_FIX_01

## VERDICT : PASS

## Problème initial

`GET /api/shared/read?path=/etc/passwd` retournait **404** au lieu de **403**.

`_resolve_safe()` appelait `relative.strip("/")` sans rejet préalable : `/etc/passwd`
devenait silencieusement `etc/passwd`, puis la résolution sous `SHARED_ROOT` échouait
avec 404 si le fichier n'existait pas.

## Correctif

`api/shared_explorer.py` — `_resolve_safe()` L87–L90 :

```python
# avant
relative = relative.strip("/").strip()

# après
if os.path.isabs(relative):
    _emit_log("path_violation", relative, "denied", "absolute_path_rejected")
    raise HTTPException(status_code=403, detail="Access denied")
relative = relative.strip("/").strip()
```

`os.path.isabs()` détecte le chemin absolu **avant** tout strip.
Le reste de la fonction (traversal `../../`, symlink escape) est inchangé.

## Tests ajoutés

| Test | Endpoint | Comportement vérifié |
|---|---|---|
| L6 | `list_directory` | `/etc` → 403 |
| R7 | `read_file` | `/etc/passwd` → 403 |
| D6 | `download_file` | `/etc/passwd` → 403 |

`integration_test_shared_explorer.py` : 23 → 26 tests, 26/26 PASS.

## Commit

| Champ | Valeur |
|---|---|
| Commit fix | `1cfc1e3` |
| Message | fix: GAP_ABSOLUTE_PATH_404 — absolute path input now returns 403 |
| Branche | `main` |
| Push | réussi |

## CI locale

```text
integration_test_pipeline.py          ✓  (26/26)
integration_test_shared_explorer.py   ✓  (26/26)
npm run test:adopt (9 suites)          ✓  (540/540)
shared-explorer.smoke.js (live 6/6)   ✓
cms-installer.smoke.js  (live 10/10)  ✓
LocalCMS CI — PASS
```

## Gaps restants

```text
P4 GAP_LEGACY_INSTALLER_SIMULE
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

Prochain candidat : `GO_LOCALCMS_DBLAYER_P4_LEGACY_INSTALLER_SIMULE_SCOPE_01`
