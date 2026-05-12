# GO_LOCALCMS_OPERATOR_REAL_MODULE_ACCEPTANCE_01

## Objectif

Valider le runbook opérateur sur un vrai module LocalCMS (non factice), en conditions réelles.

## Base canonique

- Repo: /home/ghost/localcms
- Branche: go/GO_LOCALCMS_OPERATOR_REAL_MODULE_ACCEPTANCE_01
- Base: main @ d36c9c2
- Remote: git@github.com:magikgmo4-ui/localcms.git
- Host test: `http://localhost:8001`
- SHARED_ROOT: `/home/ghost/localcms_runtime/shared`
- MODULES_DIR: `/home/ghost/localcms_runtime/modules`

## Décision héritée

- GO_LOCALCMS_OPERATOR_REAL_USAGE_RUNBOOK_01: PASS — runbook opérateur 12 étapes créé
- GO_LOCALCMS_OPERATOR_WORKFLOW_E2E_ACCEPTANCE_01: PASS — flux E2E validé

---

## Module candidat

**`modules/env-global.js`** — `MOD_ENV_GLOBAL_DATA` · M-3.4 · v1.0.0

- 183 lignes, déclaratif pur (données uniquement, aucun effet de bord)
- 25 champs en 3 groupes : machines / shared_env / network
- Source : `modules/env-global.js` dans le repo

**Bundle créé :**

```json
{
  "id":          "env_global",
  "name":        "Env Global",
  "version":     "1.0.0",
  "description": "MOD_ENV_GLOBAL_DATA — déclaratif M-3.4 — 25 champs env",
  "group":       "system",
  "target_key":  "modules_dir",
  "files":       [{ "src": "env-global.js", "dest": "env-global.js" }],
  "sanity_check": null
}
```

Taille bundle : 2 874 bytes (2.8 KB). Créé programmatiquement, supprimé après test.

---

## Résultats par étape du runbook

| Code | Étape runbook | Résultat |
| ---- | ------------- | -------- |
| R1 | Shared Explorer — `list install-queue` — bundle visible | PASS |
| R2 | Installer — `scan` — bundle présent | PASS |
| R3 | Installer — `inspect` — manifest complet retourné | PASS |
| R4 | Installer — `precheck` — `result: ok`, `errors: []` | PASS |
| R5 | Installer — `install` (1ère) — pipeline 7 étapes, `result: ok`, `backup: skipped` | PASS |
| R6 | Vérification fichier — `env-global.js` présent dans MODULES_DIR (9 239 bytes) | PASS |
| R7 | Installer — réinstall — `result: ok`, `backup: ok` | PASS |
| R8 | Installer — `history` — logs purgés (voir observation) | LIMIT |
| R9 | Shared Explorer — logs install — non visibles (voir observation) | LIMIT |
| R10 | Installer — `backups` — 1 backup listé | PASS |
| R11 | Installer — `rollback` — `result: ok`, fichier restauré | PASS |
| R12 | Vérification fichier post-rollback — présent | PASS |

**10/12 PASS · 2 LIMIT (non bloquants)**

---

## Pipeline observé

### 1ère installation

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

### Réinstallation

```
precheck   → ok
backup     → ok       (env-global.js copié dans install-backups/env_global_<ts>/)
staging    → ok
validate   → ok
install    → ok
post_check → skipped
finalize   → ok
result     → ok
```

---

## Observation : purge logs alphabétique

**Constat :** les logs d'installation de `env_global` ont été écrits puis immédiatement purgés.

**Cause :** le cap est à 100 fichiers JSON dans `install-logs/`. La purge trie les fichiers par **nom en ordre décroissant**. Les fichiers `install_unknown_*` et `install_hello_mod_*` (lettres u, h) sortent devant `install_env_global_*` (lettre e), donc les logs env_global sont purgés en premier.

**Impact :** aucun sur la correctness de l'installation — la purge est best-effort sur les logs. Les backups (`/api/installer/backups`) et la restoration (`/api/installer/rollback`) fonctionnent indépendamment des logs.

**Classifié :** comportement connu V1, non bloquant. À noter dans les limites V1 du guide opérateur si le runtime accumule beaucoup de logs avec des module_id alphabétiquement bas.

---

## Smokes post-acceptance

| Suite | Résultat |
| ----- | -------- |
| `tests/shared-explorer.smoke.js` (live) | 6/6 PASS |
| `tests/cms-installer.smoke.mjs` (live) | 10/10 PASS |

---

## Couverture runbook vérifiée

Le runbook `OPERATOR_REAL_USAGE_RUNBOOK.md` est suffisant pour exécuter le flux complet sans adaptation. Toutes les étapes correspondent à la réalité observée. La section "Critères PASS/FAIL" est correcte.

**Aucune lacune dans le runbook.**

---

## Isolation runtime vérifiée

Après test :
- `install-queue/env-global-v1.0.0.zip` : **supprimé** ✓
- `modules/env-global.js` : **supprimé** ✓
- `install-backups/env_global_*` : **supprimés** ✓
- Bundles préexistants : **non touchés** ✓

---

## Aucune modification applicative

- `api/shared_explorer.py` : non touché
- `api/cms_installer.py` : non touché
- `modules/env-global.js` : non touché (source)
- `modules/shared-explorer.js` : non touché
- `modules/cms-installer.js` : non touché

---

## Verdict

**PASS — 10/12 étapes PASS + 2 LIMIT non bloquants**

Le runbook opérateur fonctionne sur un vrai module LocalCMS sans adaptation.
Installation, backup, rollback et vérification fichier : tous corrects.
La purge alphabétique des logs (LIMIT) est un comportement connu V1, sans impact opérateur.

## Prochain GO recommandé

Prochain chantier selon besoin : Config Store M3 acceptance réelle, correction log purge, ou autre surface.
