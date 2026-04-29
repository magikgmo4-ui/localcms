# 00_ADOPT_RUNNER_BASELINE — GO_LOCALCMS_DBLAYER_ADOPT_RUNNER_01

---

## 1_MASTER_TARGET

Configurer un runner JS standardisé pour les 9 fichiers `adopt.test.js` de LocalCMS :
- Runner exécutable via une commande npm unique
- Résultats conformes aux comptages de référence établis
- Aucun fichier applicatif modifié, aucun secret tracké, `node_modules` non tracké

---

## 3_INITIAL_NEED

Au départ (7f821d5) :
- 9 fichiers `tests/*adopt*.test.js` présents et fonctionnels
- Aucun `package.json`, aucun runner configuré
- Tests exécutables uniquement via `node tests/<file>` individuellement
- Pas de commande unifiée ni de rapport global
- `node_modules/` déjà ignoré dans `.gitignore`

Source : `docs/chantiers/GO_LOCALCMS_DBLAYER_BACKUP_ROLLBACK_01/00_BACKUP_ROLLBACK_BASELINE.md` — section "15_REMAINING_GAP"

---

## 7_CANONICAL_STATE

| Champ | Valeur |
|---|---|
| Machine | db-layer (/home/ghost/localcms) |
| Repo | /home/ghost/localcms |
| Remote | git@github.com:magikgmo4-ui/localcms.git |
| Branche | go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01 |
| HEAD départ | 7f821d5 docs: record LocalCMS db-layer backup rollback PASS |
| HEAD fin | 7f821d5 (inchangé — aucun commit effectué) |
| Date | 2026-04-28 |
| Opérateur | ghost |
| Agent | Claude Code CLI (claude-sonnet-4-6) |
| Node.js | v22.22.2 |
| npm | 11.13.0 |

---

## 13_ESTABLISHED

### Analyse des tests adopt

Tous les 9 fichiers adopt suivent le même pattern :
- `require('fs')` + `require('path')` — Node.js built-ins uniquement
- Harness inline (compteurs `pass`/`fail` ou `_p`/`_f`)
- `process.exit(1)` sur failure, `process.exit(0)` sur success
- Sortie verbose par défaut (banners, sections, résumé final)
- Chargement module via `eval(src.replace(...))` → `globalThis.MOD_*`
- **Aucune dépendance externe** → pas de `npm install` nécessaire

### Décision runner

| Option | Verdict |
|---|---|
| vitest | Inutile — tests sans describe/it/expect |
| Jest | Inutile — même raison |
| Node natif | Suffisant — `spawnSync` dans un runner dédié |

Runner retenu : **`node scripts/run-adopt.js`** orchestrant `spawnSync` sur les 9 fichiers.

### Fichiers créés

| Fichier | Rôle |
|---|---|
| `package.json` | `name`, `version`, `private`, `scripts.test:adopt` |
| `scripts/run-adopt.js` | Runner Node.js — 9 suites, rapport final, exit code correct |

### package.json (minimal)

```json
{
  "name": "localcms",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test:adopt": "node scripts/run-adopt.js"
  }
}
```

### scripts/run-adopt.js

Runner `spawnSync` avec `stdio: 'inherit'` — passe-travers la sortie native de chaque test, puis affiche le bilan final `N suites : X PASS  Y FAIL`.

---

## 14_HYPOTHESIS

### H1 — Tests exécutables via `npm run test:adopt`
Confirmé : `npm run test:adopt` → exit 0, 9 PASS.

### H2 — Comptages conformes aux références
Confirmé (voir tableau résultats réels ci-dessous).

### H3 — Pas de `npm install` requis
Confirmé : aucune dépendance externe, `package-lock.json` non créé.

### H4 — `node_modules` déjà ignoré
Confirmé : `.gitignore` contient `node_modules/` — aucune modification nécessaire.

### H5 — `scripts/run-adopt.js` compatible répertoire existant
Confirmé : `scripts/` préexistait (scripts shell setup), ajout `run-adopt.js` sans conflit.

---

## 15_REMAINING_GAP

| Gap | Description | Bloquant ? |
|---|---|---|
| `test:adopt:verbose` dédié | Inutile — les tests sont déjà verbeux par défaut | Non |
| Runner Python côté API | Aucun runner unifié pour les tests pytest | Non — hors scope |
| CI/CD | Aucun workflow GitHub Actions pour `npm run test:adopt` | Non |
| Watcher | Pas de mode `--watch` | Non |
| Coverage | Pas de coverage report | Non |

---

## 16_TODO

- [ ] Optionnel : ajouter `test:adopt:ci` (output compact, sans banners) si besoin CI
- [ ] Optionnel : ajouter un GitHub Actions workflow `test-adopt.yml`
- [ ] Prochain GO : `GO_LOCALCMS_DBLAYER_ADOPT_RUNNER_01` → commit + push package.json + run-adopt.js

---

## 17_RESUME_POINT

```bash
cd /home/ghost/localcms
git status --short --branch
# HEAD : 7f821d5
# Fichiers non commités :
#   package.json
#   scripts/run-adopt.js

# Vérifier le runner :
npm run test:adopt

# Committer (après validation) :
git add package.json scripts/run-adopt.js \
        docs/chantiers/GO_LOCALCMS_DBLAYER_ADOPT_RUNNER_01/ \
        docs/responses/response_10_GO_LOCALCMS_DBLAYER_ADOPT_RUNNER_01.txt
git commit -m "feat: add adopt test runner — npm run test:adopt (9 suites 540/540 PASS)"
git push
```

---

## Fichiers de test adopt détectés

| Fichier | Tests ref |
|---|---|
| `tests/apps-config-adopt.test.js` | 75 |
| `tests/data-sources-adopt.test.js` | 52 |
| `tests/devtools-config-adopt.test.js` | 69 |
| `tests/env-global-adopt.test.js` | 49 |
| `tests/ia-config-adopt.test.js` | 73 |
| `tests/machines-config-adopt.test.js` | 84 |
| `tests/memory-view-adopt.test.js` | 38 |
| `tests/queue-config-adopt.test.js` | 50 |
| `tests/sec-config-adopt.test.js` | 50 |
| **TOTAL** | **540** |

---

## Runner retenu

```
node scripts/run-adopt.js
npm run test:adopt
```

- Node.js built-ins uniquement (`child_process.spawnSync`)
- Aucune dépendance npm
- Pas de `npm install` requis
- Rapport final : `ADOPT RUNNER — 9 suites : X PASS  Y FAIL`
- Exit code : 0 si tout PASS, 1 sinon

---

## Résultats réels — `npm run test:adopt` (2026-04-28)

| Suite | Attendu | Réel | Statut |
|---|---|---|---|
| apps-config-adopt.test.js | 75/75 | 75/75 | PASS |
| data-sources-adopt.test.js | 52/52 | 52/52 | PASS |
| devtools-config-adopt.test.js | 69/69 | 69/69 | PASS |
| env-global-adopt.test.js | 49/49 | 49/49 | PASS |
| ia-config-adopt.test.js | 73/73 | 73/73 | PASS |
| machines-config-adopt.test.js | 84/84 | 84/84 | PASS |
| memory-view-adopt.test.js | 38/38 | 38/38 | PASS |
| queue-config-adopt.test.js | 50/50 | 50/50 | PASS |
| sec-config-adopt.test.js | 50/50 | 50/50 | PASS |
| **TOTAL** | **540/540** | **540/540** | **PASS** |

---

## Commandes exécutées

```bash
node tests/apps-config-adopt.test.js      # test préliminaire → 75/75 PASS
npm run test:adopt                         # runner complet → 9/9 PASS
git status --short --branch                # working tree propre sauf docs/pkg
```

---

## Fichiers modifiés / créés

### Dans le dépôt git

| Fichier | Action | Tracké |
|---|---|---|
| `package.json` | Créé | OUI (à committer) |
| `scripts/run-adopt.js` | Créé | OUI (à committer) |
| `docs/chantiers/GO_LOCALCMS_DBLAYER_ADOPT_RUNNER_01/00_ADOPT_RUNNER_BASELINE.md` | Créé | OUI (doc) |
| `docs/responses/response_10_GO_LOCALCMS_DBLAYER_ADOPT_RUNNER_01.txt` | Créé | OUI (doc) |

### Hors dépôt git

Aucun artefact runtime créé.

### Fichiers non modifiés

`main.py`, `api/cms_installer.py`, `localcms-v5.html`, `tests/*.js`, `.gitignore` — **intacts**.

---

## État Git final

```
Sur la branche go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01
Votre branche est à jour avec 'origin/go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01'.
?? package.json
?? scripts/run-adopt.js
?? docs/chantiers/GO_LOCALCMS_DBLAYER_ADOPT_RUNNER_01/
?? docs/responses/response_10_GO_LOCALCMS_DBLAYER_ADOPT_RUNNER_01.txt
HEAD : 7f821d5 (inchangé — aucun commit selon contraintes GO)
```

---

## VERDICT

```
PASS
```

| Critère | Statut |
|---|---|
| Runner adopt standardisé | PASS |
| Commande unique `npm run test:adopt` documentée | PASS |
| 9 suites adopt exécutées via npm | PASS |
| 540/540 tests PASS, 0 FAIL | PASS |
| Comptages conformes aux références | PASS |
| Aucun fichier applicatif modifié | PASS |
| node_modules non tracké | PASS |
| Aucun secret tracké | PASS |
| Aucun `npm install` requis | PASS |
| Documentation écrite | PASS |

**Score : 540/540 tests PASS | 9/9 suites PASS**
**Score cumulé : 702 + 540 = 1242 validations**

---

## Prochain GO logique

`GO_LOCALCMS_DBLAYER_ADOPT_RUNNER_01` → commit + push `package.json` + `scripts/run-adopt.js` + docs, puis :

`GO_LOCALCMS_DBLAYER_API_COVERAGE_01` — étendre la couverture API (routes manquantes, cas edge, intégration frontend).

---

## Point de reprise exact

```bash
cd /home/ghost/localcms
git status --short --branch
# 4 fichiers non commités

git add package.json scripts/run-adopt.js \
        docs/chantiers/GO_LOCALCMS_DBLAYER_ADOPT_RUNNER_01/ \
        docs/responses/response_10_GO_LOCALCMS_DBLAYER_ADOPT_RUNNER_01.txt
git commit -m "feat: add adopt test runner — npm run test:adopt (9 suites 540/540 PASS)"
git push
```
