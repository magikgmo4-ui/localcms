# 00_ROLLBACK_API_MERGE_MAIN_REPORT — GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_MERGE_MAIN_01

---

## 1_MASTER_TARGET

Merger proprement `go/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01` dans `main`, valider la CI post-merge, documenter, puis pousser `main`.

---

## 3_INITIAL_NEED

La branche rollback API V2 (`da4b50c feat: expose installer rollback API`) a passé CI et a été pushée sur origin. Elle doit être intégrée dans main pour constituer la base du prochain GO V2.

---

## 7_CANONICAL_STATE

| Champ | Valeur |
|---|---|
| Repo | /home/ghost/localcms |
| Remote | git@github.com:magikgmo4-ui/localcms.git |
| Branche source | go/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01 |
| HEAD source | da4b50c feat: expose installer rollback API |
| Branche cible | main |
| HEAD main avant merge | aaa05c6 docs: record LocalCMS db-layer V2 scope PASS |
| Tag release | v0.1.0-dblayer (pointe b94c09e, inchangé) |
| Date | 2026-04-29 |

---

## 13_ESTABLISHED

### Merge

| Champ | Valeur |
|---|---|
| Stratégie | `--no-ff` (merge commit explicite) |
| Merge commit | **f06799a** merge: LocalCMS V2 rollback API — POST /api/installer/rollback |
| Conflits | **aucun** |
| Fichiers intégrés | 6 (voir tableau ci-dessous) |

### Fichiers intégrés dans main

| Fichier | Type |
|---|---|
| `api/cms_installer.py` | +56 lignes — RollbackRequest + POST /rollback |
| `tests/integration_test_pipeline.py` | +68 lignes — run_rollback_api + I16/I17/I18 |
| `tests/cms-installer.smoke.js` | +45 lignes — mock + S8 |
| `scripts/run-ci-local.sh` | +1/-1 — résumé 7/7 → 8/8 |
| `docs/chantiers/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01/00_ROLLBACK_API_BASELINE.md` | Créé |
| `docs/responses/response_21_GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01.txt` | Créé |

### Validations CI

| Étape | Résultat |
|---|---|
| CI source (avant merge) | PASS 18/18 + 23/23 + 540/540 + 6/6 + 8/8 |
| CI post-merge | PASS 18/18 + 23/23 + 540/540 + 6/6 + 8/8 |
| CI post-doc commit | PASS (voir ci-dessous) |

### Log final main

```
HEAD → doc commit (docs: record LocalCMS rollback API merge main PASS)
f06799a merge: LocalCMS V2 rollback API — POST /api/installer/rollback
da4b50c feat: expose installer rollback API
aaa05c6 docs: record LocalCMS db-layer V2 scope PASS
```

---

## 15_REMAINING_GAP

| Gap | Description | Priorité V2 |
|---|---|---|
| GAP_RESTORE_API_ABSENTE | POST /api/installer/restore non exposé | P2 |
| GAP_ABSOLUTE_PATH_404 | Chemin absolu → 404 au lieu de 403 | P3 |
| GAP_PACKAGE_JSON_MODULE_WARN | Warning Node `type:module` absent | P4 |
| GAP_LEGACY_INSTALLER_SIMULE | MOD_INSTALLER simulé (frontend) | P5 |
| GAP_INSTALL_BACKUPS_TTL | Pas de purge TTL install-backups | P6 |

---

## 16_TODO

- [ ] GO_LOCALCMS_DBLAYER_V2_RESTORE_API_01 (P2)

---

## 17_RESUME_POINT

```bash
cd "$HOME/localcms"
git status --short --branch
# main (clean, sync origin)
git log --oneline -8
bash scripts/run-ci-local.sh
```

---

## Commandes exécutées

```bash
pwd
git status --short --branch
git remote -v
git branch -vv
git log --oneline -12
git check-ignore -v .env
git check-ignore -v node_modules || true
git fetch origin
git checkout go/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01
git pull --rebase origin go/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01
bash scripts/run-ci-local.sh                              # source PASS
git checkout main
git pull --rebase origin main
git log --oneline main..go/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01
git diff --stat main..go/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01
git merge --no-ff go/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_01 \
  -m "merge: LocalCMS V2 rollback API — POST /api/installer/rollback"
git status --short --branch
bash scripts/run-ci-local.sh                              # post-merge PASS
# (doc files written)
git add docs/chantiers/GO_LOCALCMS_DBLAYER_V2_ROLLBACK_API_MERGE_MAIN_01/ \
        docs/responses/response_22_...txt
git commit -m "docs: record LocalCMS rollback API merge main PASS"
bash scripts/run-ci-local.sh                              # post-doc PASS
git push origin main
```

---

## État Git final

```
main (clean, sync origin)
HEAD : doc commit
Merge commit : f06799a
Tag : v0.1.0-dblayer (inchangé, pointe b94c09e)
.env : non tracké
node_modules : non présent
localcms-v5.html : non modifié
```

---

## VERDICT

```
PASS
```

| Critère | Statut |
|---|---|
| Source branch mergée sans conflit | PASS |
| CI source PASS avant merge | PASS |
| CI post-merge PASS | PASS |
| CI post-doc PASS | PASS |
| main pushé | PASS |
| v0.1.0-dblayer non déplacé | PASS |
| localcms-v5.html non modifié | PASS |
| .env non tracké | PASS |
| node_modules non tracké | PASS |
| Rapport merge écrit | PASS |
| Réponse TXT écrite | PASS |
| Working tree final clean | PASS |

---

## Prochain GO logique

`GO_LOCALCMS_DBLAYER_V2_RESTORE_API_01`
  Exposer `POST /api/installer/restore`
  Base : main HEAD (post-merge + doc commit)
