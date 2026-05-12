# GO_LOCALCMS_M1_M2_M3_RELEASE_BASELINE_CLOSEOUT_01

## Objectif

Figer la baseline LocalCMS M1+M2+M3 comme socle stable, documenter les invariants, les smokes obligatoires et le tag release.

## Base canonique

- Repo: /home/ghost/localcms
- Branche: go/GO_LOCALCMS_M1_M2_M3_RELEASE_BASELINE_CLOSEOUT_01
- Base: main @ 515a357
- Remote: git@github.com:magikgmo4-ui/localcms.git

## Décision héritée

- `GO_LOCALCMS_M1_M2_M3_INTEGRATED_ACCEPTANCE_01` : PASS 18/18 — parcours produit complet M1+M2+M3 validé

---

## Livrables

| Fichier | Action | Contenu |
| ------- | ------ | ------- |
| `docs/BASELINE_M1_M2_M3.md` | **créé** | Baseline complète : commits canoniques, tests, invariants, endpoints, doc opérateur |
| Tag `v1.0.0-m3-baseline` | **posé** sur `515a357` | Socle M1+M2+M3 figé |

---

## Inventaire baseline

### Tests (91 total — 0 FAIL)

| Suite | Résultat |
| ----- | -------- |
| Adopt runner | 9/9 PASS |
| Intégration Config Store | 8/8 PASS |
| Intégration Shared Explorer | 26/26 PASS |
| Intégration Pipeline Installer | 27/27 PASS |
| Smoke Shared Explorer (mock) | 6/6 PASS |
| Smoke CMS Installer (mock) | 10/10 PASS |
| Smoke Config Store (mock) | 5/5 PASS |

### GOs canoniques (16 PASS)

1. `GO_LOCALCMS_DBLAYER_V3_POST_RELEASE_BASELINE_01` — `8ec7c86`
2. `GO_LOCALCMS_FULL_TEST_CAMPAIGN_01` — `3ff9c57` — 157/157
3. `GO_LOCALCMS_BRANCH_CLEANUP_01` — `b07ea29`
4. `GO_LOCALCMS_CMS_INSTALLER_CHILD_REAL_BUNDLE_ACCEPTANCE_01` — `bcd65d9`
5. `GO_LOCALCMS_CMS_INSTALLER_CHILD_UI_ACCEPTANCE_01` — `f454cb4`
6. `GO_LOCALCMS_CMS_INSTALLER_CHILD_OPERATOR_DOCS_01` — `8a2be87`
7. `GO_LOCALCMS_CMS_INSTALLER_CHILD_ERROR_HARDENING_01` — `fa20e18`
8. `GO_LOCALCMS_SHARED_EXPLORER_CHILD_REAL_USAGE_ACCEPTANCE_01` — `4a598bf`
9. `GO_LOCALCMS_SHARED_EXPLORER_CHILD_OPERATOR_DOCS_01` — `7707ad9`
10. `GO_LOCALCMS_OPERATOR_WORKFLOW_E2E_ACCEPTANCE_01` — `75a3bf3`
11. `GO_LOCALCMS_OPERATOR_REAL_USAGE_RUNBOOK_01` — `d36c9c2`
12. `GO_LOCALCMS_OPERATOR_REAL_MODULE_ACCEPTANCE_01` — `d5d1f59`
13. `GO_LOCALCMS_INSTALLER_LOG_RETENTION_POLICY_FIX_01` — `5070489`
14. `GO_LOCALCMS_OPERATOR_REAL_MODULE_ACCEPTANCE_REPLAY_AFTER_LOG_FIX_01` — `d33f499`
15. `GO_LOCALCMS_CONFIG_STORE_M3_ACCEPTANCE_01` — `a531d8d`
16. `GO_LOCALCMS_M1_M2_M3_INTEGRATED_ACCEPTANCE_01` — `515a357`

### Documentation opérateur

- `docs/operator/SHARED_EXPLORER_V1_OPERATOR_GUIDE.md`
- `docs/operator/CMS_INSTALLER_V1_OPERATOR_GUIDE.md`
- `docs/operator/OPERATOR_REAL_USAGE_RUNBOOK.md`

---

## Aucune modification applicative

- Aucun fichier `api/` modifié
- Aucun fichier `modules/` modifié
- Aucun fichier `tests/` modifié

---

## Tag release

```
v1.0.0-m3-baseline → 515a357
```

Signification : socle stable M1+M2+M3, prêt pour planification M4.

---

## Verdict

**PASS**

Baseline M1+M2+M3 figée. 91 tests verts. 16 GOs documentés. Tag posé. Doc opérateur complète.

## Prochain GO recommandé

Prochain chantier à définir : M4 ou surface complémentaire, à partir de `main @ 515a357` post-tag.
