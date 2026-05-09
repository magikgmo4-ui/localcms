# Shared Explorer V1 — Guide opérateur

> Validé par : GO_LOCALCMS_SHARED_EXPLORER_CHILD_REAL_USAGE_ACCEPTANCE_01
> Remplace les sections opérationnelles de `docs/module/README_M1.md`.

---

## 1. Environnement requis

| Variable | Défaut | Rôle |
|---|---|---|
| `LOCALCMS_SHARED_ROOT` | `/shared` | Racine des répertoires accessibles |
| `PORT` | `8000` | Port du host FastAPI |

**Exemple `.env` local (gitignoré) :**

```bash
LOCALCMS_SHARED_ROOT=/home/ghost/localcms_runtime/shared
PORT=8000
```

**Démarrage host :**

```bash
cd localcms
uvicorn main:app --host 0.0.0.0 --port 8000
# Vérification : curl http://localhost:8000/health → {"status":"ok"}
```

**Structure typique du SHARED_ROOT :**

```
$LOCALCMS_SHARED_ROOT/
├── readme.md              ← fichiers texte prévisualisables
├── docs/
│   └── hello.md           ← sous-dossiers navigables
├── install-queue/         ← bundles .zip déposés pour CMS Installer
├── install-logs/          ← logs JSON des installations
└── install-backups/       ← backups automatiques CMS Installer
```

---

## 2. Accéder au panel

Cliquer **📁 Shared Explorer** dans la navigation latérale.

Le panel s'ouvre sur le listing de la racine (`$LOCALCMS_SHARED_ROOT/`).

---

## 3. Navigation dossiers

### Racine

Au chargement du panel, le listing de la racine s'affiche :
- un dossier par ligne avec son nom et son type
- un fichier par ligne avec son nom, sa taille et sa date

### Sous-dossiers

Cliquer sur un dossier → navigation dans ce dossier.

Un fil d'Ariane en haut permet de remonter.

### Cas testés

| Cas | Comportement |
|---|---|
| Racine → entries retournées | OK |
| Sous-dossier `docs/` → `hello.md` présent | OK |
| `install-queue/` → bundles .zip listés | OK |
| Dossier inexistant | 404 |

---

## 4. Preview fichier texte

Cliquer sur un fichier texte → son contenu s'affiche dans le panel.

**Extensions prévisualisables :**

`txt` `md` `json` `yaml` `yml` `log` `conf` `ini` `toml` `py` `sh` `js` `ts` `sql` `css` `html`

**Limite de taille :** fichiers > 5 MB → erreur 413 (preview refusée).

La commande download reste disponible pour les fichiers > 5 MB.

### Cas testés

| Cas | Comportement |
|---|---|
| `readme.md` — content non vide | OK |
| `docs/hello.md` — contenu retourné | OK |
| `big.log` (8.5 MB) | 413 — preview refusée |
| Fichier `.zip` binaire | 403 — preview non autorisée |
| Fichier inexistant | 404 |

---

## 5. Téléchargement

Cliquer **⬇ Download** sur la ligne d'un fichier.

→ Le fichier est téléchargé avec l'en-tête `Content-Disposition: attachment`.

**Fichiers téléchargeables :** tout fichier sur whitelist d'extension (texte + archives + images + PDF).

| Cas | Comportement |
|---|---|
| `readme.md` — 200 + Content-Disposition: attachment | OK |
| `.zip` depuis `install-queue/` — téléchargeable | OK |

---

## 6. Recherche

Utiliser le champ de recherche du panel ou l'API directement.

**Paramètres :**

| Paramètre | Requis | Description |
|---|---|---|
| `q` | ✓ | Terme recherché (dans le nom ou le contenu texte) |
| `ext` | ✗ | Filtrer par extension (ex. `.md`) |
| `from` | ✗ | Date ISO début |
| `to` | ✗ | Date ISO fin |

**Limite :** 200 résultats maximum.

### Cas testés

| Cas | Comportement |
|---|---|
| `q=hello` — résultats non vides | OK |
| `q=hello&ext=.md` — tous .md | OK |
| Sans paramètre `q` | 400 |

---

## 7. API endpoints

Tous préfixés `/api/shared`. Lecture seule — aucun endpoint POST/PUT/PATCH/DELETE.

| Méthode | Route | Paramètre | Description |
|---|---|---|---|
| GET | `/list` | `path=<rel>` (optionnel) | Lister un dossier |
| GET | `/read` | `path=<rel>` | Prévisualiser un fichier texte |
| GET | `/download` | `path=<rel>` | Télécharger un fichier |
| GET | `/search` | `q=` `ext=` `from=` `to=` | Rechercher |

### Exemple — cycle complet via curl

```bash
BASE="http://localhost:8000/api/shared"

# Listing racine
curl -s "$BASE/list"

# Listing sous-dossier
curl -s "$BASE/list?path=docs"

# Listing install-queue
curl -s "$BASE/list?path=install-queue"

# Preview fichier texte
curl -s "$BASE/read?path=readme.md"

# Preview sous-dossier
curl -s "$BASE/read?path=docs/hello.md"

# Télécharger un fichier texte
curl -s -O -J "$BASE/download?path=readme.md"

# Télécharger un bundle .zip
curl -s -O -J "$BASE/download?path=install-queue/mon-module-v1.0.0.zip"

# Recherche simple
curl -s "$BASE/search?q=hello"

# Recherche filtrée par extension
curl -s "$BASE/search?q=hello&ext=.md"
```

---

## 8. Sécurité

- **Read-only absolu** : aucun endpoint d'écriture, aucune modification possible
- **Path traversal** : `../../../etc` → 403 + log `path_violation`
- **`.env`** : toujours bloqué → 403 + log `access_denied`
- **Symlinks sortant de SHARED_ROOT** → 403
- **Fichiers binaires (preview)** : `.zip` et assimilés → 403 sur `/read` (download autorisé)
- **Taille** : preview > 5 MB → 413

Toutes les validations sont faites côté backend via `realpath` avant tout accès.

### Cas testés

| Cas | Code attendu |
|---|---|
| Path traversal `../../../etc` sur list | 403 |
| Path traversal `../../../etc/passwd` sur read | 403 |
| Path traversal sur download | 403 |

---

## 9. Lien avec CMS Installer

Shared Explorer donne visibilité sur les répertoires opérés par CMS Installer :

| Dossier | Contenu |
|---|---|
| `install-queue/` | Bundles `.zip` en attente d'installation — listables et téléchargeables |
| `install-logs/` | Logs JSON structurés par installation — prévisualisables |
| `install-backups/` | Backups de fichiers avant écrasement — listables |

**Workflow opérateur :**

1. Déposer un bundle dans `install-queue/` (hors LocalCMS)
2. Vérifier sa présence dans Shared Explorer → `install-queue/`
3. Passer dans le panel CMS Installer pour Scanner, Inspecter, Installer
4. Vérifier le résultat dans `install-logs/` via Shared Explorer

### Cas testés

| Cas | Comportement |
|---|---|
| `install-queue/` visible avec bundles .zip | OK |
| `install-logs/` visible avec fichiers JSON | OK |
| Read d'un log install JSON — contenu lisible | OK |

---

## 10. Scénarios d'erreur et résolution

| Erreur | Cause probable | Action |
|---|---|---|
| 403 sur list ou read | Path traversal ou `.env` ou binaire sur read | Vérifier le chemin — ne pas accéder hors SHARED_ROOT |
| 404 | Dossier ou fichier inexistant | Vérifier l'arborescence runtime |
| 413 | Fichier > 5 MB en preview | Utiliser Download à la place |
| 400 sur search | Paramètre `q` absent | Fournir un terme de recherche |
| Preview vide | Fichier texte vide ou non indexé | Normal |

---

## 11. Limites V1

1. `user_id` = `"cms_user"` hardcodé — à lier au système de session quand disponible.
2. Pas d'authentification dédiée — hérite de la session LocalCMS.
3. Preview image non implémentée — download seulement.
4. Résultats de recherche limités à 200 entrées.
5. Pas de pagination sur listing.

---

## 12. Preuve de validation

| Chantier | Verdict | SHA |
|---|---|---|
| GO_LOCALCMS_SHARED_EXPLORER_CHILD_REAL_USAGE_ACCEPTANCE_01 | PASS 19/19 | `4a598bf` |
| Smokes (`shared-explorer.smoke.js`) | 6/6 PASS | — |
| Intégration (`integration_test_shared_explorer.py`) | 26/26 PASS | — |
