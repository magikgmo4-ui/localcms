# GO_LOCALCMS_DBLAYER_P6_INSTALL_BACKUPS_TTL_FIX_01

## VERDICT : PASS

## Problème initial

`BACKUP_DIR` (`/shared/install-backups`) et `LOG_DIR` (`/shared/install-logs`)
croissaient indéfiniment — aucune limite, aucune purge. Observé à 51+ logs au
moment de la découverte du gap.

## Correctif — `api/cms_installer.py`

Deux nouvelles constantes :
```python
MAX_BACKUPS_PER_MODULE  = 5    # backups les plus récents conservés par module
MAX_LOGS                = 100  # logs d'installation conservés au total
```

Deux fonctions de purge best-effort (exception silencieuse — ne bloque jamais une install) :

- `_purge_old_logs()` — appelée dans `_emit_install_log()` après chaque écriture de log
- `_purge_old_backups(module_id)` — appelée après chaque création de backup réussie

**Décision de ne pas utiliser un TTL temps** : les backups sont nécessaires jusqu'à
utilisation explicite (rollback/restore), pas jusqu'à une date arbitraire. Une limite
par module (5) est plus prévisible et garantit que le backup le plus récent est
toujours disponible.

## Comportement garanti

| Invariant | Valeur |
|---|---|
| Backups conservés par module | 5 (les plus récents) |
| Logs conservés total | 100 (les plus récents) |
| Comportement si purge échoue | silencieux — install non bloquée |
| Rollback/restore disponible | toujours au moins 1 backup par module (si créé) |

## CI locale

```text
integration_test_pipeline.py          ✓  26/26
integration_test_shared_explorer.py   ✓  26/26
npm run test:adopt (9 suites)          ✓  540/540
shared-explorer.smoke.js (live 6/6)   ✓
cms-installer.smoke.mjs (live 10/10)  ✓
LocalCMS CI — PASS
```

## État final des gaps P3–P6

```text
P3 GAP_ABSOLUTE_PATH_404        : FERMÉ
P4 GAP_LEGACY_INSTALLER_SIMULE  : FERMÉ
P5 GAP_PACKAGE_JSON_MODULE_WARN : FERMÉ
P5 GAP_UTCNOW_DEPRECATION       : FERMÉ
P6 GAP_INSTALL_BACKUPS_TTL      : FERMÉ ← ce chantier
```

Aucun gap connu restant dans la série P3–P6 post-V2.

## Point de reprise

```bash
cd "$HOME/localcms"
git status --short --branch
git log --oneline -8
bash scripts/run-ci-local.sh
```
