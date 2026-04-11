# MOD_SHARED_EXPLORER V1 — Documentation d'exploitation
Version : V1.0.0 · Date : 2026-03-15

---

## Livrables

| Fichier | Rôle |
|---|---|
| `modules/shared-explorer.js` | Module frontend LocalCMS |
| `api/shared_explorer.py` | Endpoints FastAPI backend |
| `tests/shared-explorer.test.js` | 13 tests unitaires (Node.js) |
| `tests/shared-explorer.smoke.js` | 6 smoke tests (mock + live) |
| `PATCH_LOCALCMS_V5.txt` | 4 insertions dans localcms-v5.html |

---

## Démarrage rapide

### 1. Intégrer dans LocalCMS
Appliquer les patches décrits dans `PATCH_LOCALCMS_V5.txt` (3 insertions HTML + 1 `<script>`).

### 2. Configurer le backend
```bash
# Variable d'environnement obligatoire
export LOCALCMS_SHARED_ROOT=/shared

# Dans le backend FastAPI existant
from api.shared_explorer import shared_router
app.include_router(shared_router, prefix="/api/shared")
```

### 3. Lancer les tests
```bash
node tests/shared-explorer.test.js    # 13 tests unitaires
node tests/shared-explorer.smoke.js   # 6 smoke tests (mode mock)

# Smoke en mode live (backend requis)
BACKEND_URL=http://localhost:8000 node tests/shared-explorer.smoke.js
```

---

## Endpoints disponibles

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/shared/list?path=<rel>` | Listing dossier |
| GET | `/api/shared/read?path=<rel>` | Contenu texte (≤ 5 MB) |
| GET | `/api/shared/download?path=<rel>` | Téléchargement |
| GET | `/api/shared/search?q=&ext=&from=&to=` | Recherche |

**Aucun endpoint POST/PUT/PATCH/DELETE.** Lecture seule absolue.

---

## Comportements par type de fichier

| Catégorie | Extensions | Preview | Download |
|---|---|---|---|
| Texte/Config | txt md json yaml yml log conf ini toml | ✓ (≤5MB) | ✓ |
| Code | py sh js ts sql css html | ✓ (≤5MB) | ✓ |
| Image | jpg jpeg png gif svg webp | ✗ | ✓ |
| Archive | zip tar gz tar.gz | ✗ | ✓ |
| PDF | pdf | ✗ | ✓ |
| **Bloqué** | **.env** | **✗** | **✗** |
| Inconnu | tout le reste | ✗ | ✗ |

---

## Sécurité

- `realpath` côté backend avant tout accès
- Symlinks sortant de `/shared` → 403 + log `access_denied`
- Path traversal → 403 + log `path_violation`
- `.env` → 403 + log `access_denied`
- Extension hors whitelist → metadata seulement
- Fichier > 5 MB → 413 (preview refusée, download autorisé si whitelist)

---

## Format de log

Chaque action produit une entrée :
```json
{
  "timestamp": "2026-03-15T12:00:00.000Z",
  "user_id": "cms_user",
  "action": "list|read|download|search|access_denied|path_violation",
  "path_relative": "docs/readme.md",
  "result": "ok|denied|error",
  "error": "raison optionnelle"
}
```

---

## Limites connues V1

1. `user_id` = `"cms_user"` hardcodé — lier au système de session LocalCMS quand disponible.
2. Pas d'authentification dédiée — hérite de la session LocalCMS existante.
3. Preview image non implémentée (décision figée V1 — download seulement).
4. Résultats de recherche limités à 200 entrées.
5. Pas de pagination sur listing.
6. Le smoke test live nécessite `node-fetch` si Node < 18.

---

## Suite logique

Après validation `MOD_SHARED_EXPLORER` sur les 13 critères → ouvrir **CMS Module Installer V1**.
