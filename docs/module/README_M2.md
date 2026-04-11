# MOD_CMS_INSTALLER V1 — Documentation d'exploitation
Version : V1.0.0 · Date : 2026-03-15

---

## Livrables

| Fichier | Rôle |
|---|---|
| `modules/cms-installer.js` | Module frontend LocalCMS (IIFE) |
| `api/cms_installer.py` | Router FastAPI `/api/installer` |
| `tests/cms-installer.test.js` | 13 tests unitaires (Node.js) |
| `tests/cms-installer.smoke.js` | 6 smoke tests (mock + live) |
| `PATCH_LOCALCMS_V5_M2.txt` | 4 insertions dans localcms-v5.html |

---

## Démarrage rapide

### 1. Intégrer dans LocalCMS

Appliquer les insertions décrites dans `PATCH_LOCALCMS_V5_M2.txt` (3 insertions HTML + 1 `<script>`).

### 2. Configurer le backend

```python
# Dans le backend FastAPI existant
from api.cms_installer import installer_router
app.include_router(installer_router, prefix="/api/installer")
```

Variables d'environnement :

```bash
# Répertoire shared (même que M1)
export LOCALCMS_SHARED_ROOT=/shared

# Répertoire cible des modules — à confirmer en environnement
export LOCALCMS_MODULES_DIR=/app/localcms/modules
```

### 3. Préparer la file d'installation

```bash
# Créer les répertoires si absents
mkdir -p /shared/install-queue
mkdir -p /shared/install-backups
mkdir -p /shared/install-logs
```

### 4. Lancer les tests

```bash
# Tests unitaires (13)
node tests/cms-installer.test.js

# Smoke tests mode MOCK (6) — pas de backend requis
node tests/cms-installer.smoke.js

# Smoke tests mode LIVE — backend requis
BACKEND_URL=http://localhost:8000 node tests/cms-installer.smoke.js
```

---

## Endpoints disponibles

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/installer/scan` | Lister les bundles dans la file |
| GET | `/api/installer/inspect?bundle=<name>` | Lire le manifeste d'un bundle |
| POST | `/api/installer/precheck` | Valider sans installer |
| POST | `/api/installer/install` | Pipeline complet |
| GET | `/api/installer/history` | Historique des installations |

**Aucun endpoint PUT/DELETE/PATCH.** Pas de rollback manuel.

---

## Format bundle

Un bundle valide est une archive `.zip` contenant à la racine :

```
mon-module-v1.0.0.zip
├── manifest.json       ← obligatoire, racine exacte
└── module.js           ← fichier(s) déclarés dans manifest.files
```

### Schéma manifest.json (strict V1)

```json
{
  "id":           "mon_module",
  "name":         "Mon Module",
  "version":      "1.0.0",
  "description":  "Description courte",
  "group":        "tools",
  "target_key":   "modules_dir",
  "files": [
    { "src": "module.js", "dest": "mon-module.js" }
  ],
  "sanity_check": "mon_module_sanity"
}
```

| Champ | Obligatoire | Contrainte |
|---|---|---|
| `id` | ✅ | `[a-z0-9_]+` uniquement |
| `name` | ✅ | Texte libre |
| `version` | ✅ | Format `X.Y.Z` |
| `description` | ✅ | Texte libre |
| `group` | ✅ | `tools \| system \| backend \| dev \| git \| menus \| network` |
| `target_key` | ✅ | `modules_dir` uniquement en V1 |
| `files` | ✅ | Liste `{src, dest}` — `dest` sans `../` ni absolu |
| `sanity_check` | ❌ | Nom de fonction JS optionnel |

Extensions `dest` autorisées : `.js .json .md .txt .css`

---

## Pipeline

```
Scan → Inspect → Precheck → Backup → Staging → Validate → Install → Post-check → Finalize
```

| Étape | Bloquant | Ce qui se passe |
|---|---|---|
| Precheck | ✅ | Validation manifest, target_key, fichiers présents dans le zip |
| Backup | ✅ | Copie des cibles existantes vers `/shared/install-backups/<id>_<ts>/` |
| Staging | ✅ | Extraction dans `/tmp/localcms_staging_<id>_<uuid>/` |
| Validate | ✅ + rollback | Vérification extensions, fichiers présents |
| Install | ✅ + rollback | Copie vers `TARGET_PATHS[target_key]` |
| Post-check | ❌ | Signal `BUS.emit('installer:sanity', module_id)` si `sanity_check` défini |
| Finalize | — | Nettoyage staging, log final |

---

## Sécurité

- `target_key` traduit côté backend uniquement — jamais de chemin libre dans le manifeste
- `dest` validé : `../` interdit, chemin absolu interdit, extension sur whitelist
- Aucun `subprocess`, aucun `os.system`, aucun shell libre
- Bundle size max : 10 MB
- Rollback automatique si Install échoue après début d'écriture
- Backup obligatoire si cible préexistante

---

## Format de log

```json
{
  "timestamp":     "2026-03-15T12:00:00.000Z",
  "user_id":       "cms_user",
  "action":        "install",
  "bundle":        "mon-module-v1.0.0.zip",
  "module_id":     "mon_module",
  "pipeline_step": "finalize",
  "result":        "ok",
  "error":         "raison optionnelle"
}
```

Logs écrits dans `/shared/install-logs/`.

---

## Relation avec MOD_INSTALLER (legacy)

`MOD_CMS_INSTALLER` est un nouveau module **séparé**.
`MOD_INSTALLER` (registre interne, install local, install URL) reste **intact et inchangé**.
Les deux coexistent sans collision de noms ni de panels.

---

## Limites connues V1

1. `user_id` = `"cms_user"` hardcodé — lier au système de session LocalCMS quand disponible.
2. `target_key` = `modules_dir` uniquement — à étendre en V2 si d'autres destinations sont nécessaires.
3. Pas de désinstallation en V1.
4. Smoke live nécessite `node-fetch` si Node < 18.
5. `LOCALCMS_MODULES_DIR` à confirmer en environnement réel avant premier install.

---

## Suite logique

Après validation MOD_CMS_INSTALLER V1 sur les 13 critères → ouvrir **M3 Viewer enrichi** ou briques suivantes selon plan.
