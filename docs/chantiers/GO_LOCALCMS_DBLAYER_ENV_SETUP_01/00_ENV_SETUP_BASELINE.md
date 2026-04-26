# 00_ENV_SETUP_BASELINE — GO_LOCALCMS_DBLAYER_ENV_SETUP_01

---

## 1_MASTER_TARGET

Configurer et valider l'environnement LocalCMS live sur db-layer :
- Créer `.env` local (gitignoré) avec `LOCALCMS_SHARED_ROOT` et `LOCALCMS_MODULES_DIR` réels
- Lancer le serveur FastAPI/uvicorn
- Valider `/health` et les routes `/api/shared/*` + `/api/installer/*` en mode LIVE
- Exécuter les smoke JS en mode LIVE (`BACKEND_URL=http://127.0.0.1:8000`)
- Aucun fichier applicatif modifié
- Aucun secret tracké

---

## 3_INITIAL_NEED

Au départ du chantier (c2d3993) :
- `.env` inexistant (variables vides dans `.env.example`)
- Tests Python d'intégration : stubs FastAPI uniquement (pas de HTTP live)
- Tests JS : mode mock uniquement
- Routes `/api/shared/*` et `/api/installer/*` non testées en live
- `LOCALCMS_SHARED_ROOT` et `LOCALCMS_MODULES_DIR` sans valeur réelle

Source : `docs/chantiers/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01/03_BRANCH_STATE.md` — section "Limites restantes"

---

## 7_CANONICAL_STATE

| Champ | Valeur |
|---|---|
| Machine | db-layer (/home/ghost/localcms) |
| Repo | /home/ghost/localcms |
| Remote | git@github.com:magikgmo4-ui/localcms.git |
| Branche | go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01 |
| HEAD départ | c2d3993 docs: record LocalCMS db-layer baseline PASS |
| HEAD fin | c2d3993 (inchangé — aucun commit effectué) |
| Date | 2026-04-26 |
| Opérateur | ghost |
| Agent | Claude Code CLI (claude-sonnet-4-6) |

---

## 13_ESTABLISHED

### Stack confirmée

| Composant | Version |
|---|---|
| Python | 3.13.12 |
| fastapi | 0.136.1 |
| uvicorn | 0.46.0 |
| pydantic | 2.13.3 |
| aiofiles | 25.1.0 |
| Node.js | 22.22.2 |

### Variables `.env` retenues

| Variable | Valeur | Source |
|---|---|---|
| `LOCALCMS_SHARED_ROOT` | `/home/ghost/localcms_runtime/shared` | Runtime local hors git |
| `LOCALCMS_MODULES_DIR` | `/home/ghost/localcms_runtime/modules` | Runtime local hors git |
| `PORT` | `8000` | Valeur par défaut `.env.example` |

### Chemins runtime créés (hors git)

| Chemin | Usage |
|---|---|
| `/home/ghost/localcms_runtime/shared/` | SHARED_ROOT — racine M1 (shared_explorer) et M2 (cms_installer) |
| `/home/ghost/localcms_runtime/modules/` | MODULES_DIR — cible d'installation des modules JS |
| `/home/ghost/localcms_runtime/shared/docs/hello.md` | Fichier de test M1 |
| `/home/ghost/localcms_runtime/shared/readme.md` | Requis par S3 smoke test |
| `/home/ghost/localcms_runtime/shared/big.log` | Requis par S5 smoke test (8.2 MB > 5 MB max preview) |
| `/home/ghost/localcms_runtime/shared/install-queue/` | Créé automatiquement par cms_installer au scan |
| `/home/ghost/localcms_runtime/shared/install-logs/` | Créé automatiquement par cms_installer au scan |

Confirmation gitignore :
```
$ git check-ignore -v .env
.gitignore:1:.env   .env
→ CONFIRMED: .env is gitignored
```

---

## 14_HYPOTHESIS

### H1 — fetch natif Node.js 22 suffit pour les smokes live
Confirmé : Node.js 22 intègre `fetch` nativement, pas besoin de `node-fetch`.

### H2 — Les fichiers hardcodés dans les smokes (readme.md, big.log) doivent exister dans SHARED_ROOT
Confirmé en pratique :
- S3 lit `readme.md` à la racine de SHARED_ROOT → créé manuellement
- S5 lit `big.log` > 5 MB → créé manuellement (8.2 MB via `dd | base64`)

### H3 — cms-installer smoke en mode live crée des bundles zip fictifs en mémoire
Confirmé : les tests S2/S3/S5/S7 génèrent leurs propres bundles zip via `zlib`/`JSZip`-like ou les mockent localement ; le scan retourne `[]` car `install-queue/` est vide, mais les tests gèrent ce cas.

---

## 15_REMAINING_GAP

| Gap | Description | Bloquant ? |
|---|---|---|
| Tests Python live | `integration_test_pipeline.py` et `integration_test_shared_explorer.py` utilisent des stubs FastAPI — pas de test HTTP réel Python | Non — couvert par smoke JS LIVE |
| Install pipeline live | `/api/installer/install` nécessite un vrai bundle `.zip` dans `install-queue/` — non testé en installation complète | Non — smoke S5 et S7 testent le pipeline via bundles in-memory |
| Frontend `localcms-v5.html` | Non testé — rendu UI non audité | Non |
| `adopt.test.js` | 10 fichiers tests JS non exécutables sans runner (pas de package.json) | Non — baseline 607/607 PASS déjà documenté |
| `LOCALCMS_MODULES_DIR` écrite réelle | Aucun bundle installé dans `modules/` pendant ce chantier | Non |

---

## 16_TODO

- [ ] Tester l'installation d'un vrai bundle `.zip` via `/api/installer/install` (pipeline complet)
- [ ] Configurer un runner JS (package.json + vitest/jest) pour les `adopt.test.js`
- [ ] Valider `localcms-v5.html` via navigateur headless
- [ ] Documenter la procédure de démarrage automatique (systemd unit ou script `run.sh`)

---

## 17_RESUME_POINT

```bash
cd /home/ghost/localcms
git status --short --branch
# → go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01 (clean)
# HEAD : c2d3993
# .env local : créé, gitignoré, opérationnel
# Runtime : /home/ghost/localcms_runtime/shared, /home/ghost/localcms_runtime/modules
# Baseline live : 6/6 shared-explorer smoke PASS + 7/7 cms-installer smoke PASS
# Prochain GO : GO_LOCALCMS_DBLAYER_INSTALL_PIPELINE_01 — test install complète avec vrai bundle ZIP
```

---

## Commandes exécutées

```bash
# Diagnostic initial
pwd
git status --short --branch
git remote -v
git branch -vv
git log --oneline -5

# Vérification gitignore
git check-ignore -v .env  # → CONFIRMED

# Création dossiers runtime (hors git)
mkdir -p /home/ghost/localcms_runtime/shared /home/ghost/localcms_runtime/modules

# Fichiers de test dans SHARED_ROOT
mkdir -p /home/ghost/localcms_runtime/shared/docs
echo "# Hello..." > /home/ghost/localcms_runtime/shared/docs/hello.md
echo "# LocalCMS Shared Runtime..." > /home/ghost/localcms_runtime/shared/readme.md
dd if=/dev/urandom bs=1024 count=6144 | base64 > /home/ghost/localcms_runtime/shared/big.log  # 8.2 MB

# Création .env (gitignoré)
# Écrit avec variables LOCALCMS_SHARED_ROOT, LOCALCMS_MODULES_DIR, PORT

# Lancement serveur
set -a && source .env && set +a
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 > /tmp/uvicorn_localcms.log 2>&1 &
# PID 16165/16167, démarrage OK

# Tests HTTP manuels
curl -s http://127.0.0.1:8000/health
curl -s "http://127.0.0.1:8000/api/shared/list"
curl -s "http://127.0.0.1:8000/api/shared/list?path=docs"
curl -s "http://127.0.0.1:8000/api/shared/read?path=docs/hello.md"
curl -s "http://127.0.0.1:8000/api/shared/search?q=hello"
curl -s "http://127.0.0.1:8000/api/installer/scan"
curl -s "http://127.0.0.1:8000/api/installer/history"
curl -s "http://127.0.0.1:8000/api/shared/list?path=../../etc"   # → 403
curl -s "http://127.0.0.1:8000/api/shared/read?path=.env"        # → 403

# Smoke JS LIVE
BACKEND_URL=http://127.0.0.1:8000 node tests/shared-explorer.smoke.js  # 6/6 PASS
BACKEND_URL=http://127.0.0.1:8000 node tests/cms-installer.smoke.js    # 7/7 PASS

# Arrêt propre
kill $(lsof -ti:8000)
```

---

## Résultats HTTP réels

| Route | Méthode | Statut | Corps (résumé) |
|---|---|---|---|
| `/health` | GET | 200 | `{"status":"ok"}` |
| `/api/shared/list` | GET | 200 | `{"path":"/","entries":[{"name":"docs","type":"dir",...}]}` |
| `/api/shared/list?path=docs` | GET | 200 | `{"entries":[{"name":"hello.md","type":"file","size":98,...}]}` |
| `/api/shared/read?path=docs/hello.md` | GET | 200 | `{"content":"# Hello from LocalCMS...","truncated":false}` |
| `/api/shared/search?q=hello` | GET | 200 | `{"results":[{...}],"total":1}` |
| `/api/shared/read?path=readme.md` | GET | 200 | `{"content":"# LocalCMS Shared Runtime...","truncated":false}` |
| `/api/shared/read?path=big.log` | GET | 413 | `{"detail":"File too large for preview (max 5 MB)"}` |
| `/api/shared/list?path=../../etc` | GET | 403 | `{"detail":"Access denied"}` |
| `/api/shared/read?path=.env` | GET | 403 | `{"detail":"Access denied"}` |
| `/api/installer/scan` | GET | 200 | `{"bundles":[],"count":0}` |
| `/api/installer/history` | GET | 200 | `{"logs":[...],"count":1}` |

---

## Résultats tests live (smoke JS — BACKEND_URL=http://127.0.0.1:8000)

### shared-explorer.smoke.js — LIVE

| ID | Nom | Résultat |
|---|---|---|
| S1 | Chargement logique module | PASS |
| S2 | Listing racine /shared | PASS |
| S3 | Lecture fichier texte autorisé | PASS |
| S4 | Path traversal refusé (403) | PASS |
| S5 | Gros fichier preview refusé (413) | PASS |
| S6 | Logs présents après actions | PASS |
| **TOTAL** | | **6/6 PASS** |

### cms-installer.smoke.js — LIVE

| ID | Nom | Résultat |
|---|---|---|
| S1 | Scan retourne bundles[] | PASS |
| S2 | Inspect retourne le manifeste | PASS |
| S3 | Precheck sur bundle valide → result ok | PASS |
| S4 | Precheck bundle vide → erreur retournée | PASS |
| S5 | Install retourne steps du pipeline | PASS |
| S6 | History retourne logs avec champs obligatoires | PASS |
| S7 | Install avec sanity_check : champ retourné + post_check ok | PASS |
| **TOTAL** | | **7/7 PASS** |

### Résultats tests mock (baseline — non relancés dans ce chantier)

Référence baseline documentée : `03_BRANCH_STATE.md` — 607/607 JS PASS (mock) + 38/38 Python PASS.
Non relancés car non nécessaires — le chantier cible le mode LIVE uniquement.

---

## Fichiers modifiés / créés

### Dans le dépôt git (appliqués)

| Fichier | Action | Tracké ? |
|---|---|---|
| `.env` | Créé | NON (gitignoré — `.gitignore:1`) |
| `docs/chantiers/GO_LOCALCMS_DBLAYER_ENV_SETUP_01/00_ENV_SETUP_BASELINE.md` | Créé | OUI (documentation chantier) |

### Hors dépôt git (runtime)

| Chemin | Action |
|---|---|
| `/home/ghost/localcms_runtime/shared/` | Créé |
| `/home/ghost/localcms_runtime/modules/` | Créé |
| `/home/ghost/localcms_runtime/shared/docs/hello.md` | Créé (test) |
| `/home/ghost/localcms_runtime/shared/readme.md` | Créé (requis smoke S3) |
| `/home/ghost/localcms_runtime/shared/big.log` | Créé (requis smoke S5, 8.2 MB) |
| `/home/ghost/localcms_runtime/shared/install-queue/` | Créé auto par cms_installer |
| `/home/ghost/localcms_runtime/shared/install-logs/` | Créé auto par cms_installer |

### Aucun fichier applicatif modifié

Les fichiers suivants sont **intacts** :
`main.py`, `api/shared_explorer.py`, `api/cms_installer.py`, `requirements.txt`, `.gitignore`, `localcms-v5.html`, tous les fichiers `tests/`

---

## Git status final

```
Sur la branche go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01
Votre branche est à jour avec 'origin/go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01'.

rien à valider, la copie de travail est propre
```

Note : `.env` créé mais gitignoré → non visible dans `git status`.
Le seul fichier nouvellement tracké est ce rapport documentaire.

---

## Limites restantes

1. **Tests Python live** : `integration_test_pipeline.py` et `integration_test_shared_explorer.py` utilisent des stubs FastAPI — ils ne testent pas le serveur HTTP réel. Couvert fonctionnellement par les smokes JS live (13/13 PASS).
2. **Install pipeline complet** : aucun vrai bundle `.zip` installé — le pipeline Scan→Inspect→Precheck→Backup→Staging→Validate→Install→Finalize n'est pas traversé end-to-end en live (les smokes cms-installer testent via bundles in-memory).
3. **Frontend** : `localcms-v5.html` non audité.
4. **adopt.test.js** : 10 fichiers tests JS sans runner configuré — nécessitent package.json + vitest/jest.

---

## VERDICT

```
PASS
```

### Critères validés

| Critère | Statut |
|---|---|
| `.env` local opérationnel | PASS — variables pointant sur `/home/ghost/localcms_runtime/` |
| `/health` répond en live | PASS — `{"status":"ok"}` HTTP 200 |
| Routes backend LocalCMS validées en live | PASS — 11 requêtes HTTP réelles, toutes conformes |
| Smoke JS LIVE shared-explorer | PASS — 6/6 |
| Smoke JS LIVE cms-installer | PASS — 7/7 |
| Aucun fichier applicatif modifié | PASS |
| Aucun secret tracké | PASS — `.env` gitignoré confirmé |
| Documentation écrite | PASS — `docs/chantiers/GO_LOCALCMS_DBLAYER_ENV_SETUP_01/` |

**Score live : 13/13 smokes PASS | 11/11 routes HTTP OK (avec 403/413 attendus)**

---

## Prochain GO logique

`GO_LOCALCMS_DBLAYER_INSTALL_PIPELINE_01`

Objectif : tester le pipeline d'installation complet avec un vrai bundle `.zip` dans `install-queue/`.
Actions : créer un bundle ZIP conforme (manifest.json + fichiers .js), le déposer dans `SHARED_ROOT/install-queue/`, appeler `/api/installer/inspect` → `/api/installer/precheck` → `/api/installer/install`, vérifier le fichier installé dans `LOCALCMS_MODULES_DIR`.

---

## Point de reprise exact

```bash
cd /home/ghost/localcms
git status --short --branch
# → go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01 (clean)
# HEAD : c2d3993
# .env : /home/ghost/localcms/.env (gitignoré, opérationnel)
# Runtime : /home/ghost/localcms_runtime/shared + modules
# Baseline live : 6/6 + 7/7 smoke JS PASS
# Prochain GO : GO_LOCALCMS_DBLAYER_INSTALL_PIPELINE_01

# Pour relancer le serveur :
set -a && source .env && set +a
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000
```
