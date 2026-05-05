# GO_LOCALCMS_DBLAYER_POST_V2_GAPS_CLOSEOUT_01

## VERDICT : PASS

## Release V2

| Élément | Valeur |
|---|---|
| Tag | `v0.2.0-dblayer` |
| Commit pointé | `3c908875` |
| Commit doc fermeture | `766eacc` |
| Endpoints V2 | `POST /api/installer/rollback`, `GET /api/installer/backups`, `POST /api/installer/restore` |

## Séquence gaps post-V2 — P3 à P6

| Gap | Commit fix | Commit doc | Statut |
|---|---|---|---|
| P3 `GAP_ABSOLUTE_PATH_404` | `1cfc1e3` | `09c0af5` | PASS |
| P4 `GAP_LEGACY_INSTALLER_SIMULE` | `6c0d1fa` | — | PASS |
| P5 `GAP_PACKAGE_JSON_MODULE_WARN` + `GAP_UTCNOW_DEPRECATION` | `f0e285b` | — | PASS |
| P6 `GAP_INSTALL_BACKUPS_TTL` | `7fd7fad` | — | PASS |

### P3 — `GAP_ABSOLUTE_PATH_404`

`_resolve_safe()` dans `api/shared_explorer.py` : `os.path.isabs()` détecte les chemins
absolus avant `strip("/")` et lève 403. Tests L6, R7, D6 ajoutés (23 → 26).

### P4 — `GAP_LEGACY_INSTALLER_SIMULE`

`MOD_INSTALLER` (panel "⬇ Installer" simulé avec `setTimeout`) supprimé de
`localcms-v5.html` — nav, panel div, ~155 lignes JS, entrée init. `MOD_CMS_INSTALLER`
conservé. Le gros diff Git (9360 ins / 9396 del) était dû à la normalisation CRLF → LF
par Python ; `git show --check` exit 0, contenu fonctionnel intact.

### P5 — `GAP_PACKAGE_JSON_MODULE_WARN` + `GAP_UTCNOW_DEPRECATION`

- `cms-installer.smoke.js` renommé en `.mjs` (top-level `await` = ESM pur) — `package.json`
  non modifié pour ne pas casser les adopt tests CommonJS.
- `datetime.utcnow()` remplacé par `datetime.now(timezone.utc)` dans `api/shared_explorer.py`
  et `datetime.now()` (naive) dans le test S7 (compatible avec `search_files` naive).

### P6 — `GAP_INSTALL_BACKUPS_TTL`

`api/cms_installer.py` : `MAX_BACKUPS_PER_MODULE = 5` et `MAX_LOGS = 100`.
`_purge_old_backups(module_id)` et `_purge_old_logs()` — best-effort, exception silencieuse.
Rétention par nombre de backups (pas par TTL-date) pour garantir disponibilité rollback/restore.

## CI finale

```text
integration_test_pipeline.py          ✓  26/26
integration_test_shared_explorer.py   ✓  26/26
npm run test:adopt (9 suites)          ✓  540/540
shared-explorer.smoke.js (live 6/6)   ✓
cms-installer.smoke.mjs (live 10/10)  ✓
LocalCMS CI — PASS
```

## État Git final

```text
Branche : main
main    : synchronisé avec origin/main
Tag     : v0.2.0-dblayer présent (local + origin)
Dernier commit : 7fd7fad (avant ce closeout)
```

## Gaps connus restants

Aucun dans la série P3–P6 post-V2.

Gap futur non planifié : `GAP_IA_RUNNER_SIMULE` (panel `ia_run` — fetch simulé, hors scope core).

## Point de reprise

```bash
cd "$HOME/localcms"
git status --short --branch
git log --oneline -8
git tag --list "v0.2.0-dblayer"
bash scripts/run-ci-local.sh
```
