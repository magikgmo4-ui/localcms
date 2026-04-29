# 00_FRONTEND_AUDIT_REPORT — GO_LOCALCMS_DBLAYER_FRONTEND_AUDIT_01

---

## 1_MASTER_TARGET

Auditer `localcms-v5.html` sans modification, vérifier la cohérence frontend/backend, inventorier les endpoints et modules, documenter les divergences comme GAP.

---

## 3_INITIAL_NEED

Après `GO_LOCALCMS_DBLAYER_API_COVERAGE_01` (20 routes/24 cas), `localcms-v5.html` restait le seul angle fonctionnel non audité. Ce GO établit la correspondance complète frontend↔backend.

---

## 7_CANONICAL_STATE

| Champ | Valeur |
|---|---|
| Repo | /home/ghost/localcms |
| Branche | main |
| HEAD | 6768665 |
| Tag | v0.1.0-dblayer |
| Fichier audité | localcms-v5.html (9396 lignes, 512 KB) |
| Date | 2026-04-29 |

---

## 13_ESTABLISHED

### Modules JS chargés (10 fichiers externes)

| Fichier | Variable globale | HTTP (servi) | Usage backend |
|---|---|---|---|
| `modules/devtools-config.js` | `MOD_DEVTOOLS_CFG` | 200 | Aucun (config locale) |
| `modules/apps-config.js` | `MOD_APPS_CFG` | 200 | Aucun (config locale) |
| `modules/sec-config.js` | `MOD_SEC_CFG` | 200 | Aucun (config locale) |
| `modules/queue-config.js` | `MOD_QUEUE_CFG` | 200 | Aucun (config locale) |
| `modules/shared-explorer.js` | `MOD_SHARED_EXPLORER` | 200 | `/api/shared/*` |
| `modules/cms-installer.js` | `MOD_CMS_INSTALLER` | 200 | `/api/installer/*` |
| `modules/env-global.js` | `MOD_ENV_GLOBAL` | 200 | Aucun (config locale) |
| `modules/ia-config.js` | `MOD_IA_CFG` | 200 | Aucun (config locale) |
| `modules/machines-config.js` | `MOD_MACHINES_CFG` | 200 | Aucun (config locale) |
| `modules/data-sources.js` | `MOD_DATA_SOURCES` | 200 | Aucun (config locale) |

**Tous les fichiers JS sont présents sur disque et servis en 200.**

---

### Panels UI inventoriés (extraits clés)

| Panel ID | Module lié | Backend |
|---|---|---|
| `shared_explorer` | `MOD_SHARED_EXPLORER` | `/api/shared/*` |
| `cms_installer` | `MOD_CMS_INSTALLER` | `/api/installer/*` |
| `installer` | `MOD_INSTALLER` (legacy) | Aucun — simulé |
| `dashboard`, `cfg_files`, `logs`, `settings` | Modules inline | Aucun |
| Autres panels config (apps, sec, devtools…) | Modules externes | Aucun |

---

### Endpoints frontend → backend (correspondance)

| Endpoint frontend | Module | Méthode | Backend réel | HTTP | Correspondance |
|---|---|---|---|---|---|
| `/api/shared/list` | shared-explorer.js | GET | `/api/shared/list` | 200 | **MATCH** |
| `/api/shared/read` | shared-explorer.js | GET | `/api/shared/read` | 200 | **MATCH** |
| `/api/shared/download` | shared-explorer.js | GET | `/api/shared/download` | 200 | **MATCH** |
| `/api/shared/search` | shared-explorer.js | GET | `/api/shared/search` | 200 | **MATCH** |
| `/api/installer/scan` | cms-installer.js | GET | `/api/installer/scan` | 200 | **MATCH** |
| `/api/installer/inspect?bundle=X` | cms-installer.js | GET | `/api/installer/inspect` | 200 | **MATCH** |
| `/api/installer/precheck` | cms-installer.js | POST `{bundle}` | `/api/installer/precheck` | 200 | **MATCH** |
| `/api/installer/install` | cms-installer.js | POST `{bundle}` | `/api/installer/install` | 200 | **MATCH** |
| `/api/installer/history` | cms-installer.js | GET | `/api/installer/history` | 200 | **MATCH** |

**9/9 endpoints frontend ↔ backend : correspondance parfaite.**

---

### Routes backend non exposées côté frontend

| Route backend | Exposée dans UI |
|---|---|
| `GET /health` | Référencée comme valeur par défaut dans formulaires config (non appelée dynamiquement) |

`/health` est une route de vérification interne — non requise côté UI. Pas un GAP.

---

### Analyse technique modules API

**`modules/shared-explorer.js`**
- `API_BASE = '/api/shared'` — relatif, même origine
- `fetch(url, { method:'GET', credentials:'same-origin' })` — pas de CORS
- 4 endpoints mappés : list, read, download, search

**`modules/cms-installer.js`**
- `API = '/api/installer'` — relatif, même origine
- `fetch` GET pour scan, inspect, history
- `fetch` POST + `JSON.stringify({bundle})` pour precheck et install
- `PIPELINE_ORDER` inclut `'rollback'` comme step d'affichage → affiché en jaune si `result === 'rollback'` — **cohérent avec le backend**
- Champ `sanity_check` lu depuis la réponse → `BUS.emit('installer:sanity', module_id)` → `system:refresh` déclenché

---

### `MOD_INSTALLER` (legacy — panel "Installer")

Module inline (défini dans `localcms-v5.html:4794`), distinct de `MOD_CMS_INSTALLER`.
Fonctions `install()`, `uninstall()`, `installLocal()`, `scanDir()`, `installUrl()` utilisent des `setTimeout` simulés — **aucun appel réel à un backend**.
Référence `./available/` comme répertoire de scan — ce chemin n'existe pas côté backend.

→ **GAP_LEGACY_INSTALLER_SIMULE** (documenté ci-dessous)

---

### Init modules

```javascript
mods.forEach(m => { try { m.init(); } catch(e) { console.warn('init error:', e); } });
```

`MOD_SHARED_EXPLORER.init()` → appelle `navigate('')` → `GET /api/shared/list` dès le chargement
`MOD_CMS_INSTALLER.init()` → appelle `render()` → rendu UI seul, pas d'appel API immédiat

---

### Checks live

| Check | HTTP | Résultat |
|---|---|---|
| `GET /` | 200 | localcms-v5.html servi |
| `GET /health` | 200 | `{"status":"ok"}` |
| `GET /modules/shared-explorer.js` | 200 | module servi |
| `GET /modules/cms-installer.js` | 200 | module servi |
| (tous les 10 modules JS) | 200 | tous servis |
| `GET /api/shared/list` | 200 | cohérent |
| `GET /api/shared/read?path=install-logs` | 404 | dossier — attendu (read = fichiers) |
| `GET /api/shared/read?path=<fichier>` | 200 | fichier — OK |
| `POST /api/installer/install` | 200 | cohérent |

---

### Smokes live

| Suite | Résultat |
|---|---|
| shared-explorer.smoke.js | **6/6 PASS** |
| cms-installer.smoke.js | **7/7 PASS** |

### npm run test:adopt

```
ADOPT RUNNER — 9 suites : 9 PASS  0 FAIL  (540/540)
```

---

## 14_HYPOTHESIS

| Hypothèse | Statut |
|---|---|
| H1 — Tous les modules JS servis en 200 | CONFIRMÉ — 10/10 |
| H2 — API_BASE relatifs, pas de CORS | CONFIRMÉ — `/api/shared` + `/api/installer` relatifs |
| H3 — 9 endpoints frontend ↔ backend cohérents | CONFIRMÉ — 9/9 MATCH |
| H4 — MOD_INSTALLER legacy sans appels réels | CONFIRMÉ — setTimeout simulé |
| H5 — Rollback géré correctement côté UI | CONFIRMÉ — badge jaune `result === 'rollback'` |
| H6 — `installer:sanity` BUS déclenche refresh | CONFIRMÉ — `BUS.on('installer:sanity', ...)` |
| H7 — MOD_SHARED_EXPLORER init appelle list immédiatement | CONFIRMÉ — `init() → navigate('')` |

---

## 15_REMAINING_GAP

| Gap | Description | Bloquant |
|---|---|---|
| GAP_LEGACY_INSTALLER_SIMULE | `MOD_INSTALLER` (panel "Installer") utilise des simulations setTimeout, référence `./available/` inexistant côté backend | Non — fonctionnalité UI décorative, non connectée |
| GAP_ROLLBACK_API_ABSENTE | Pas de route `/api/installer/rollback` — rollback interne uniquement | Non — voulu V1, UI le gère |
| GAP_RESTORE_API_ABSENTE | Pas de route `/api/installer/restore` | Non — voulu V1 |
| GAP_ABSOLUTE_PATH_404 | `/api/shared/read?path=/etc/passwd` → 404 (pas 403) | Non — non exploitable |
| GAP_PACKAGE_JSON_MODULE_WARN | Warning Node.js `"type": "module"` absent | Non — cosmétique |
| GAP_IA_RUNNER_SIMULE | IA Runner (panel `ia_run`) : fetch simulé, pas de backend IA réel connecté | Non — voulu V1, commentaire explicite dans code |

---

## 16_TODO

- [ ] Optionnel : supprimer ou masquer `MOD_INSTALLER` (legacy) si `MOD_CMS_INSTALLER` est le remplaçant officiel
- [ ] Optionnel : ajouter `"type": "module"` à `package.json`
- [ ] Optionnel : connecter un endpoint IA réel (ollama/openai) pour `ia_run`
- [ ] Optionnel : corriger `/api/shared/read` pour retourner 403 sur chemin absolu

---

## 17_RESUME_POINT

```bash
cd /home/ghost/localcms
git status --short --branch
# main propre

npm run test:adopt
# → 9 suites 540/540 PASS

# Accès frontend live :
set -a && source .env && set +a
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000
# → http://127.0.0.1:8000/
```

---

## Commandes exécutées

```bash
# Analyse statique
grep -n "fetch(" localcms-v5.html
grep -n "/api/" localcms-v5.html
grep -n "src=\"modules/" localcms-v5.html
grep -n "API_BASE\|fetch\|/api/" modules/shared-explorer.js
grep -n "fetch\|/api/\|body\|JSON.stringify" modules/cms-installer.js
grep -n "MOD_INSTALLER\b" localcms-v5.html

# Live
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 &
curl http://127.0.0.1:8000/                    # 200
curl http://127.0.0.1:8000/health              # 200
curl /modules/*.js (x10)                       # 200 x10
curl /api/shared/list                          # 200
curl /api/shared/read?path=<file>              # 200
curl /api/shared/download?path=<file>          # 200
curl /api/shared/search?q=module               # 200
curl /api/installer/scan                       # 200
curl /api/installer/inspect?bundle=...         # 200
POST /api/installer/precheck                   # 200
POST /api/installer/install                    # 200
curl /api/installer/history                    # 200
BACKEND_URL=... node tests/shared-explorer.smoke.js  # 6/6
BACKEND_URL=... node tests/cms-installer.smoke.js    # 7/7
npm run test:adopt                             # 540/540
kill $(lsof -ti:8000)
```

---

## Fichiers modifiés

| Fichier | Action |
|---|---|
| `docs/chantiers/GO_LOCALCMS_DBLAYER_FRONTEND_AUDIT_01/00_FRONTEND_AUDIT_REPORT.md` | Créé |
| `docs/responses/response_15_GO_LOCALCMS_DBLAYER_FRONTEND_AUDIT_01.txt` | Créé |
| Fichiers applicatifs | **Non modifiés** |
| `localcms-v5.html` | **Non modifié** |

---

## État Git final

```
main (clean) — 6768665 — tag v0.1.0-dblayer
?? docs/chantiers/GO_LOCALCMS_DBLAYER_FRONTEND_AUDIT_01/
?? docs/responses/response_15_GO_LOCALCMS_DBLAYER_FRONTEND_AUDIT_01.txt
HEAD : 6768665 (inchangé)
```

---

## VERDICT

```
PASS
```

| Critère | Statut |
|---|---|
| Frontend audité sans modification | PASS |
| 10/10 modules JS servis et présents | PASS |
| 9/9 endpoints frontend ↔ backend cohérents | PASS |
| Aucun endpoint frontend sans backend | PASS |
| Aucun CORS / URL hardcodée | PASS |
| Cohérence rollback UI ↔ backend | PASS — badge jaune correct |
| GAP_LEGACY_INSTALLER_SIMULE documenté | PASS |
| GAP_IA_RUNNER_SIMULE documenté | PASS |
| Smokes live 6/6 + 7/7 | PASS |
| npm run test:adopt 540/540 | PASS |
| Aucun fichier applicatif modifié | PASS |
| Aucun secret tracké | PASS |

---

## Prochain GO logique

`GO_LOCALCMS_DBLAYER_CICD_01` — formaliser les commandes stables en pipeline CI/CD (GitHub Actions ou script local) couvrant :
- `npm run test:adopt`
- smokes live backend (shared + installer)
- tests Python intégration
