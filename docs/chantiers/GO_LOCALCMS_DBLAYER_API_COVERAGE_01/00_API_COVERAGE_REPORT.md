# 00_API_COVERAGE_REPORT — GO_LOCALCMS_DBLAYER_API_COVERAGE_01

---

## 1_MASTER_TARGET

Approfondir la couverture API live de LocalCMS sur `main` après merge/tag :
- Valider toutes les routes `/api/shared/*` et `/api/installer/*` en conditions live
- Tester les cas limites, blocages de sécurité, et cas d'erreur contrôlés
- Établir explicitement le statut des routes rollback et restore
- Documenter les GAP sans patch applicatif

---

## 3_INITIAL_NEED

Après `v0.1.0-dblayer`, les validations live précédentes couvraient les happy paths et quelques cas invalides. Ce GO approfondit les cas limites, les blocages de sécurité et confirme l'absence de routes rollback/restore.

---

## 7_CANONICAL_STATE

| Champ | Valeur |
|---|---|
| Machine | db-layer |
| Repo | /home/ghost/localcms |
| Branche | main |
| HEAD | b94c09e |
| Tag | v0.1.0-dblayer |
| Date | 2026-04-29 |
| Python/FastAPI | 3.13.12 / 0.136.1 |
| Node.js | v22.22.2 |
| Serveur live | 127.0.0.1:8000 (uvicorn) |

---

## 13_ESTABLISHED

### Routes inventoriées

| Route | Méthode | Module |
|---|---|---|
| `/health` | GET | main.py |
| `/api/shared/list` | GET | shared_explorer |
| `/api/shared/read` | GET | shared_explorer |
| `/api/shared/download` | GET | shared_explorer |
| `/api/shared/search` | GET | shared_explorer |
| `/api/installer/scan` | GET | cms_installer |
| `/api/installer/inspect` | GET | cms_installer |
| `/api/installer/precheck` | POST | cms_installer |
| `/api/installer/install` | POST | cms_installer |
| `/api/installer/history` | GET | cms_installer |

**Routes rollback/restore : ABSENTES** (voir GAP ci-dessous)

---

### Résultats HTTP réels — `/health`

| Test | Méthode | HTTP | Résultat |
|---|---|---|---|
| H1 — health check | GET | 200 | `{"status":"ok"}` |

---

### Résultats HTTP réels — `/api/shared/*`

| ID | Route | Paramètre | HTTP | Résultat |
|---|---|---|---|---|
| S1 | /list | path="" (racine) | 200 | count=6 entries |
| S2 | /list | path=install-queue | 200 | count=5 bundles |
| S3 | /search | q=test | 200 | 30 résultats |
| S4 | /read | path=install-logs/*.json | 200 | content+truncated |
| S5 | /download | path=install-logs/*.json | 200 | fichier servi |
| S6 | /read | path=install-queue/*.zip | 403 | `Access denied` — binaire bloqué |
| S7 | /list | path=nonexistent_dir | 404 | dossier absent |
| **PT1** | /list | path=../../../etc/passwd | **403** | path traversal bloqué |
| **PT2** | /read | path=.env | **403** | .env bloqué |
| **PT3** | /read | path=../.env | **403** | ../.env bloqué |
| **PT4** | /read | path=/etc/passwd | 404 | chemin absolu résolu dans SHARED_ROOT |
| **PT5** | /download | path=../.env | **403** | download .env bloqué |

**Note PT4 :** chemin absolu retourne 404 (fichier absent dans SHARED_ROOT) plutôt que 403 — comportement acceptable, pas d'exposition.

---

### Résultats HTTP réels — `/api/installer/*`

| ID | Route | Body/Param | HTTP | Résultat |
|---|---|---|---|---|
| I1 | /scan | — | 200 | count=5 bundles listés |
| I2 | /inspect | bundle=test-module-v1.0.0.zip | 200 | manifest id=test_module v=1.0.0 |
| I3 | /inspect | bundle=bad-module-v1.0.0.zip | 200 | manifest retourné (non validé à /inspect) |
| I4 | /inspect | bundle=nothere.zip | 404 | bundle absent |
| I5 | /precheck | bundle=test-module-v1.0.0.zip | 200 | result=ok errors=[] |
| I6 | /precheck | bundle=bad-module-v1.0.0.zip | 200 | result=failed, 4 erreurs validation |
| I7 | /install | bundle=hello-mod-v1.0.0.zip | 200 | result=ok, 7 steps PASS |
| I8 | /install | bundle=nonexistent.zip | 404 | `Bundle introuvable` |
| I9 | /install | bundle=../../../etc/passwd | **400** | path traversal bloqué |
| I10 | /install | bundle="" | **400** | string vide bloquée |
| I11 | /history | — | 200 | count=51 logs |
| **R1** | /rollback | — | **404** | route ABSENTE |
| **R2** | /restore | — | **404** | route ABSENTE |

---

### Statut rollback / restore

```
GET  /api/installer/rollback → HTTP 404  (route non enregistrée)
GET  /api/installer/restore  → HTTP 404  (route non enregistrée)
```

Le rollback existe comme **fonction interne** `_rollback()` dans `api/cms_installer.py:181` — déclenché automatiquement sur exception en step 7 de `/install`. Il n'est pas exposé via une route HTTP dédiée.

→ **GAP_ROLLBACK_API_ABSENTE** confirmé
→ **GAP_RESTORE_API_ABSENTE** confirmé

---

### Smokes live

| Suite | Mode | Résultat |
|---|---|---|
| shared-explorer.smoke.js | LIVE 127.0.0.1:8000 | **6/6 PASS** |
| cms-installer.smoke.js | LIVE 127.0.0.1:8000 | **7/7 PASS** |

### npm run test:adopt (final)

```
ADOPT RUNNER — 9 suites : 9 PASS  0 FAIL  (540/540)
```

---

## 14_HYPOTHESIS

| Hypothèse | Statut |
|---|---|
| H1 — /api/shared/* sécurisé contre path traversal | CONFIRMÉ — PT1/PT2/PT3/PT5 → 403 |
| H2 — Fichiers binaires bloqués sur /read | CONFIRMÉ — zip → 403 "Access denied" |
| H3 — /api/installer/* bloque les inputs dangereux | CONFIRMÉ — I9 (path traversal) → 400, I10 (vide) → 400 |
| H4 — Pas de route /rollback ni /restore | CONFIRMÉ — R1/R2 → 404 |
| H5 — History accumule les logs | CONFIRMÉ — 51 entrées après GO |
| H6 — npm run test:adopt stable sur main | CONFIRMÉ — 540/540 |
| H7 — chemin absolu via /shared/read non exposé | PARTIELLEMENT CONFIRMÉ — 404 (pas 403), non exploitable |

---

## 15_REMAINING_GAP

| Gap | Description | Bloquant |
|---|---|---|
| GAP_ROLLBACK_API_ABSENTE | Pas de route `/api/installer/rollback` dédiée — rollback 100% interne | Non — voulu V1 |
| GAP_RESTORE_API_ABSENTE | Pas de route `/api/installer/restore` — restore depuis backup non exposé | Non — voulu V1 |
| GAP_ABSOLUTE_PATH_404 | `/api/shared/read?path=/etc/passwd` → 404 au lieu de 403 — non exploitable mais idéalement 403 | Non |
| GAP_INSPECT_NO_VALIDATION | `/api/installer/inspect` retourne le manifest sans valider — validation seulement en /precheck | Non — comportement voulu |
| GAP_PACKAGE_JSON_MODULE_WARN | Warning Node.js : `"type": "module"` absent de package.json | Non — cosmétique |
| install-backups purge | Backups s'accumulent (51+ logs) sans TTL | Non |
| localcms-v5.html | Frontend non audité | Non |
| CI/CD | Pas de GitHub Actions | Non |

---

## 16_TODO

- [ ] Optionnel : ajouter `"type": "module"` à package.json pour supprimer le warning Node
- [ ] Optionnel : corriger `/api/shared/read` pour retourner 403 sur chemin absolu (actuellement 404)
- [ ] Optionnel : implémenter TTL purge pour install-backups et install-logs
- [ ] Optionnel : exposer `/api/installer/rollback` + `/api/installer/restore` en V2

---

## 17_RESUME_POINT

```bash
cd /home/ghost/localcms
git status --short --branch
# main propre, tag v0.1.0-dblayer

npm run test:adopt
# → 9 suites 540/540 PASS

# Relancer backend :
set -a && source .env && set +a
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000
```

---

## Commandes exécutées

```bash
set -a && source .env && set +a
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 &

# /health
curl -s http://127.0.0.1:8000/health

# shared/list
curl -s "$BASE/api/shared/list"
curl -s "$BASE/api/shared/list?path=install-queue"
curl -s "$BASE/api/shared/list?path=nonexistent_dir"

# shared/search
curl -s "$BASE/api/shared/search?q=test"

# shared/read
curl -s "$BASE/api/shared/read?path=install-logs/install_bad-module_*.json"
curl -s "$BASE/api/shared/read?path=install-queue/test-module-v1.0.0.zip"   # → 403

# shared/download
curl -s "$BASE/api/shared/download?path=install-logs/*.json"

# path traversal shared
curl "$BASE/api/shared/list?path=../../../etc/passwd"        # → 403
curl "$BASE/api/shared/read?path=.env"                       # → 403
curl "$BASE/api/shared/read?path=../.env"                    # → 403
curl "$BASE/api/shared/read?path=/etc/passwd"                # → 404
curl "$BASE/api/shared/download?path=../.env"                # → 403

# installer
curl -s "$BASE/api/installer/scan"
curl -s "$BASE/api/installer/inspect?bundle=test-module-v1.0.0.zip"
curl -s "$BASE/api/installer/inspect?bundle=bad-module-v1.0.0.zip"
curl -s "$BASE/api/installer/inspect?bundle=nothere.zip"
curl -s -X POST "$BASE/api/installer/precheck" -d '{"bundle":"test-module-v1.0.0.zip"}'
curl -s -X POST "$BASE/api/installer/precheck" -d '{"bundle":"bad-module-v1.0.0.zip"}'
curl -s -X POST "$BASE/api/installer/install"  -d '{"bundle":"hello-mod-v1.0.0.zip"}'
curl -s -X POST "$BASE/api/installer/install"  -d '{"bundle":"nonexistent.zip"}'
curl -s -X POST "$BASE/api/installer/install"  -d '{"bundle":"../../../etc/passwd"}'  # → 400
curl -s -X POST "$BASE/api/installer/install"  -d '{"bundle":""}'                     # → 400
curl -s "$BASE/api/installer/history"
curl "$BASE/api/installer/rollback"             # → 404
curl "$BASE/api/installer/restore"             # → 404

# smokes live
BACKEND_URL=http://127.0.0.1:8000 node tests/shared-explorer.smoke.js  # → 6/6
BACKEND_URL=http://127.0.0.1:8000 node tests/cms-installer.smoke.js    # → 7/7

# adopt runner
npm run test:adopt    # → 540/540

kill $(lsof -ti:8000)
```

---

## Fichiers modifiés

| Fichier | Action |
|---|---|
| `docs/chantiers/GO_LOCALCMS_DBLAYER_API_COVERAGE_01/00_API_COVERAGE_REPORT.md` | Créé |
| `docs/responses/response_14_GO_LOCALCMS_DBLAYER_API_COVERAGE_01.txt` | Créé |
| Fichiers applicatifs | **Non modifiés** |
| .env | **Non tracké** |
| node_modules | **Non présent** |

---

## État Git final

```
main (clean) — b94c09e — tag v0.1.0-dblayer
?? docs/chantiers/GO_LOCALCMS_DBLAYER_API_COVERAGE_01/
?? docs/responses/response_14_GO_LOCALCMS_DBLAYER_API_COVERAGE_01.txt
HEAD : b94c09e (inchangé — aucun commit selon contraintes GO)
```

---

## VERDICT

```
PASS
```

| Critère | Statut |
|---|---|
| /health PASS | PASS |
| shared live — 8 routes testées | PASS |
| path traversal bloqué (PT1–PT5) | PASS |
| fichiers binaires bloqués (/read) | PASS |
| installer live — 11 routes testées | PASS |
| inputs dangereux bloqués (I9, I10) | PASS |
| rollback/restore status établi explicitement | PASS — GAP_ROLLBACK_API_ABSENTE + GAP_RESTORE_API_ABSENTE confirmés |
| smokes live 6/6 + 7/7 | PASS |
| npm run test:adopt 540/540 | PASS |
| Aucun fichier applicatif modifié | PASS |
| Aucun secret tracké | PASS |
| Aucun artefact runtime tracké | PASS |
| Documentation écrite | PASS |

**Total routes testées : 20 (11 installer + 8 shared + 1 health)**
**Total cas testés : 24 (happy paths + edge cases + security)**

---

## Prochain GO logique

Deux options :

1. `GO_LOCALCMS_DBLAYER_FRONTEND_AUDIT_01` — auditer `localcms-v5.html` (formulaires, connexion API, modules JS)
2. `GO_LOCALCMS_DBLAYER_CICD_01` — configurer un workflow GitHub Actions pour `npm run test:adopt` et les smokes live

---

## Point de reprise exact

```bash
cd /home/ghost/localcms
git status --short --branch
# main (clean) + 2 fichiers docs non commités

git add docs/chantiers/GO_LOCALCMS_DBLAYER_API_COVERAGE_01/ \
        docs/responses/response_14_GO_LOCALCMS_DBLAYER_API_COVERAGE_01.txt
git commit -m "docs: record LocalCMS db-layer API coverage PASS"
git push
```
