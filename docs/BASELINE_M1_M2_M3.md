# LocalCMS — Baseline M1+M2+M3

> Version : v1.0.0-m3-baseline  
> SHA canonique : `515a357`  
> Date : 2026-05-12

---

## 1. Périmètre

Trois modules sont validés, intégrés et documentés :

| Module | Identifiant | Surface |
|---|---|---|
| M1 Shared Explorer | `shared_explorer` | Lecture, preview, download, search — `$SHARED_ROOT` |
| M2 CMS Installer | `cms_installer` | Install, backup, rollback, history — `$SHARED_ROOT/install-*` + `$MODULES_DIR` |
| M3 Config Store | `config_store` | Save, read, list — `$SHARED_ROOT/config/` |

---

## 2. Commits canoniques

| GO | SHA merge | Résultat |
|---|---|---|
| `GO_LOCALCMS_DBLAYER_V3_POST_RELEASE_BASELINE_01` | `8ec7c86` | PASS |
| `GO_LOCALCMS_FULL_TEST_CAMPAIGN_01` | `3ff9c57` | PASS 157/157 |
| `GO_LOCALCMS_BRANCH_CLEANUP_01` | `b07ea29` | PASS |
| `GO_LOCALCMS_CMS_INSTALLER_CHILD_REAL_BUNDLE_ACCEPTANCE_01` | `bcd65d9` | PASS |
| `GO_LOCALCMS_CMS_INSTALLER_CHILD_UI_ACCEPTANCE_01` | `f454cb4` | PASS |
| `GO_LOCALCMS_CMS_INSTALLER_CHILD_OPERATOR_DOCS_01` | `8a2be87` | PASS |
| `GO_LOCALCMS_CMS_INSTALLER_CHILD_ERROR_HARDENING_01` | `fa20e18` | PASS 6/6 |
| `GO_LOCALCMS_SHARED_EXPLORER_CHILD_REAL_USAGE_ACCEPTANCE_01` | `4a598bf` | PASS 19/19 |
| `GO_LOCALCMS_SHARED_EXPLORER_CHILD_OPERATOR_DOCS_01` | `7707ad9` | PASS |
| `GO_LOCALCMS_OPERATOR_WORKFLOW_E2E_ACCEPTANCE_01` | `75a3bf3` | PASS |
| `GO_LOCALCMS_OPERATOR_REAL_USAGE_RUNBOOK_01` | `d36c9c2` | PASS |
| `GO_LOCALCMS_OPERATOR_REAL_MODULE_ACCEPTANCE_01` | `d5d1f59` | PASS 10/12 |
| `GO_LOCALCMS_INSTALLER_LOG_RETENTION_POLICY_FIX_01` | `5070489` | PASS |
| `GO_LOCALCMS_OPERATOR_REAL_MODULE_ACCEPTANCE_REPLAY_AFTER_LOG_FIX_01` | `d33f499` | PASS 12/12 |
| `GO_LOCALCMS_CONFIG_STORE_M3_ACCEPTANCE_01` | `a531d8d` | PASS 11/11 |
| `GO_LOCALCMS_M1_M2_M3_INTEGRATED_ACCEPTANCE_01` | `515a357` | PASS 18/18 |

---

## 3. Suites de tests obligatoires (baseline)

| Suite | Commande | Résultat attendu |
|---|---|---|
| Adopt runner | `npm run test:adopt` | 9/9 PASS |
| Intégration Config Store | `python3 tests/integration_test_config_store.py` | 8/8 PASS |
| Intégration Shared Explorer | `python3 tests/integration_test_shared_explorer.py` | 26/26 PASS |
| Intégration Pipeline Installer | `python3 tests/integration_test_pipeline.py` | 27/27 PASS |
| Smoke Shared Explorer (mock) | `node tests/shared-explorer.smoke.js` | 6/6 PASS |
| Smoke CMS Installer (mock) | `node tests/cms-installer.smoke.mjs` | 10/10 PASS |
| Smoke Config Store (mock) | `node tests/cms-config.smoke.mjs` | 5/5 PASS |

**Total baseline : 91 tests · 0 FAIL**

---

## 4. Invariants runtime

### Variables d'environnement

| Variable | Rôle | Défaut |
|---|---|---|
| `LOCALCMS_SHARED_ROOT` | Racine partagée | `/shared` |
| `LOCALCMS_MODULES_DIR` | Destination modules installés | `/app/localcms/modules` |
| `PORT` | Port FastAPI | `8000` |

### Structure SHARED_ROOT

```
$LOCALCMS_SHARED_ROOT/
├── install-queue/     ← bundles .zip à installer (M2)
├── install-logs/      ← logs JSON d'installation (M2) — cap 100, purge par mtime
├── install-backups/   ← backups modules avant écrasement (M2) — cap 5 par module
└── config/            ← configs JSON des modules (M3) — cap 256 KB par fichier
```

### Politique de rétention

| Ressource | Cap | Politique de purge |
|---|---|---|
| `install-logs/` | 100 fichiers | Purge par `st_mtime` décroissant (les plus récents conservés) |
| `install-backups/<id>/` | 5 backups par module | Purge les plus anciens |
| `config/<id>.json` | 256 KB | Écrasement à chaque save |

---

## 5. Endpoints API

### M1 Shared Explorer — `/api/shared`

| Méthode | Route | Description |
|---|---|---|
| GET | `/list?path=<rel>` | Listing dossier |
| GET | `/read?path=<rel>` | Preview texte (≤ 5 MB) |
| GET | `/download?path=<rel>` | Téléchargement |
| GET | `/search?q=&ext=&from=&to=` | Recherche |

**Lecture seule. Aucun POST/PUT/DELETE.**

### M2 CMS Installer — `/api/installer`

| Méthode | Route | Description |
|---|---|---|
| GET | `/scan` | Lister bundles dans install-queue |
| GET | `/inspect?bundle=<name>` | Lire le manifeste |
| POST | `/precheck` | Valider sans installer |
| POST | `/install` | Pipeline complet |
| GET | `/history` | Logs d'installation |
| POST | `/rollback` | Restaurer depuis dernier backup |
| GET | `/backups?module_id=<id>` | Lister backups disponibles |
| POST | `/restore` | Restaurer backup explicite |

### M3 Config Store — `/api/config`

| Méthode | Route | Description |
|---|---|---|
| GET | `` | Lister les configs sauvegardées |
| GET | `/{module_id}` | Lire la config d'un module |
| POST | `/{module_id}` | Sauvegarder la config d'un module |

---

## 6. Invariants produit documentés

- **M2 et M3 sont orthogonaux** : un rollback CMS Installer restaure `MODULES_DIR/` mais ne touche pas `config/`. Les deux sont indépendants.
- **M1 lit tout SHARED_ROOT** : install-queue, install-logs, install-backups et config/ sont tous visibles via Shared Explorer sans configuration supplémentaire.
- **Precheck obligatoire** : ne jamais lancer `/install` si `/precheck` retourne des erreurs.
- **Rollback limité** : le rollback Installer n'est disponible que si un backup existe (réinstallation seulement, pas première installation).

---

## 7. Documentation opérateur

| Document | Périmètre |
|---|---|
| `docs/operator/SHARED_EXPLORER_V1_OPERATOR_GUIDE.md` | Guide complet M1 |
| `docs/operator/CMS_INSTALLER_V1_OPERATOR_GUIDE.md` | Guide complet M2 |
| `docs/operator/OPERATOR_REAL_USAGE_RUNBOOK.md` | Runbook 12 étapes M1+M2 |

**Config Store M3 : voir `docs/chantiers/GO_LOCALCMS_CONFIG_STORE_M3_ACCEPTANCE_01/README.md`** pour les endpoints et comportements — guide opérateur M3 à créer dans un chantier dédié si nécessaire.

---

## 8. Module suivant

Le prochain module (M4) peut être planifié maintenant que la baseline M1+M2+M3 est figée.

**Contraintes pour M4 :**
- Partir de `main @ 515a357`
- Ne pas modifier M1/M2/M3 sauf gap bloquant prouvé
- Suivre le même schéma GO : branche → acceptance → hardening → docs opérateur → baseline

---

## 9. Tag release

Tag posé : **`v1.0.0-m3-baseline`** sur `515a357`
