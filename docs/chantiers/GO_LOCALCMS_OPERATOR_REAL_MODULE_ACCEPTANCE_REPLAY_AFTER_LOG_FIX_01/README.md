# GO_LOCALCMS_OPERATOR_REAL_MODULE_ACCEPTANCE_REPLAY_AFTER_LOG_FIX_01

## Objectif

Rejouer l'acceptance réelle post-correctif log retention, pour convertir le PASS 10/12 précédent en preuve complète 12/12.

## Base canonique

- Repo: /home/ghost/localcms
- Branche: go/GO_LOCALCMS_OPERATOR_REAL_MODULE_ACCEPTANCE_REPLAY_AFTER_LOG_FIX_01
- Base: main @ 5070489
- Remote: git@github.com:magikgmo4-ui/localcms.git
- Host test: `http://localhost:8001`
- SHARED_ROOT: `/home/ghost/localcms_runtime/shared`
- MODULES_DIR: `/home/ghost/localcms_runtime/modules`

## Décision héritée

- `GO_LOCALCMS_INSTALLER_LOG_RETENTION_POLICY_FIX_01` : PASS — purge chronologique par `st_mtime` en production
- `GO_LOCALCMS_OPERATOR_REAL_MODULE_ACCEPTANCE_01` : PASS 10/12 — les gates P10/P11 avaient échoué à cause de la purge alphabétique

---

## Module candidat

**`modules/env-global.js`** — `MOD_ENV_GLOBAL_DATA` · M-3.4 · v1.0.0 (même module que l'acceptance précédente)

Bundle taille : 2 837 bytes. Créé programmatiquement, supprimé après test.

---

## Conditions de test

- Cap install-logs : **100 fichiers déjà présents** avant le début du test
- Tous les logs env_global devaient être purgés immédiatement avant le correctif
- Après correctif : les logs les plus récents (y compris env_global) sont conservés par mtime

---

## Résultats — 12/12 PASS

| Code | Étape | Résultat |
| ---- | ----- | -------- |
| P1 | Shared Explorer — `list install-queue` — bundle visible | PASS |
| P2 | Installer — `scan` — bundle présent | PASS |
| P3 | Installer — `inspect` — manifest complet retourné | PASS |
| P4 | Installer — `precheck` — `result: ok`, `errors: []` | PASS |
| P5 | Installer — `install` (1ère) — pipeline 7 étapes `result: ok`, `backup: skipped` | PASS |
| P6 | Vérification fichier — `env-global.js` présent dans MODULES_DIR (9 239 bytes) | PASS |
| P7 | Installer — réinstall — `result: ok`, `backup: ok` | PASS |
| P8 | Installer — `backups` — 1 backup listé | PASS |
| P9 | Installer — `rollback` — `result: ok`, fichier restauré | PASS |
| P10 | Installer — `history` — **13 entrées env_global visibles** | PASS |
| P11 | Shared Explorer — `read` log install JSON — **log rollback lisible** | PASS |
| P12 | Cap 100 — 13 logs env_global conservés, total ≤ 100 | PASS |

---

## Preuve clef : logs env_global conservés (cap=100 plein)

```
install_env_global_20260512T015114885346.json  ← session précédente, conservé
install_env_global_20260512T015114888609.json
install_env_global_20260512T015114891454.json
install_env_global_20260512T033257020777.json
install_env_global_20260512T033257052779.json
install_env_global_20260512T033446274357.json
install_env_global_20260512T033446277051.json
install_env_global_20260512T033446279319.json
install_env_global_20260512T033628287573.json
install_env_global_20260512T033628290234.json
install_env_global_20260512T033628292654.json
install_env_global_20260512T033628296218.json
install_env_global_20260512T033628354322.json  ← rollback, lisible via Shared Explorer

count env_global = 13 / 100 total
```

**Log rollback lu via Shared Explorer (`/api/shared/read?path=install-logs/...`) :**

```json
{
  "timestamp": "2026-05-12T03:36:28.354261+00:00",
  "user_id": "cms_user",
  "action": "rollback",
  "bundle": "",
  "module_id": "env_global",
  "pipeline_step": "rollback",
  "result": "ok"
}
```

---

## Pipeline observé (1ère installation)

```
precheck   → ok
backup     → skipped  (env-global.js absent de MODULES_DIR)
staging    → ok
validate   → ok
install    → ok       (env-global.js écrit : 9 239 bytes)
post_check → skipped  (sanity_check: null)
finalize   → ok
result     → ok
```

---

## Smokes post-replay

| Suite | Résultat |
| ----- | -------- |
| `tests/cms-installer.smoke.mjs` (live) | 10/10 PASS |
| `tests/shared-explorer.smoke.js` (live) | 6/6 PASS |

---

## Isolation runtime vérifiée

- `install-queue/env-global-v1.0.0.zip` : supprimé ✓
- `modules/env-global.js` : supprimé ✓
- `install-backups/env_global_*` : supprimés ✓
- Bundles préexistants : non touchés ✓

---

## Aucune modification applicative

Tous les fichiers applicatifs non touchés. Le correctif `_purge_old_logs()` était déjà en production (mergé dans `5070489`).

---

## Verdict

**PASS — 12/12**

La limite P10/P11 du chantier précédent est résolue. Les logs du module sont conservés après install et rollback même avec le cap à 100. Le runbook opérateur est valide sans adaptation. L'acceptance réelle est complète.

## Prochain GO recommandé

Prochain chantier selon besoin : Config Store M3 acceptance réelle, M3 guide opérateur, ou autre surface.
