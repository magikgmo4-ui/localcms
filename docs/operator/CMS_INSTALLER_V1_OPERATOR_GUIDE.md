# CMS Module Installer V1 — Guide opérateur

> Validé par : GO_LOCALCMS_CMS_INSTALLER_CHILD_REAL_BUNDLE_ACCEPTANCE_01 (backend)
> et GO_LOCALCMS_CMS_INSTALLER_CHILD_UI_ACCEPTANCE_01 (UI).
> Remplace les sections opérationnelles de `docs/module/README_M2.md`.

---

## 1. Environnement requis

| Variable | Défaut | Rôle |
|---|---|---|
| `LOCALCMS_SHARED_ROOT` | `/shared` | Racine des répertoires runtime |
| `LOCALCMS_MODULES_DIR` | `/app/localcms/modules` | Destination des fichiers installés |
| `PORT` | `8000` | Port du host FastAPI |

**Répertoires créés automatiquement au premier usage :**

```
$LOCALCMS_SHARED_ROOT/
├── install-queue/     ← déposer les bundles ici
├── install-backups/   ← backups automatiques avant écrasement
└── install-logs/      ← logs JSON structurés
```

**Exemple `.env` local (gitignoré) :**

```bash
LOCALCMS_SHARED_ROOT=/home/ghost/localcms_runtime/shared
LOCALCMS_MODULES_DIR=/home/ghost/localcms_runtime/modules
PORT=8000
```

**Démarrage host :**

```bash
cd localcms
uvicorn main:app --host 0.0.0.0 --port 8000
# Vérification : curl http://localhost:8000/health → {"status":"ok"}
```

---

## 2. Format bundle

Un bundle est une archive `.zip` contenant à la racine :

```
mon-module-v1.0.0.zip
├── manifest.json          ← obligatoire, à la racine exacte du zip
└── mon-module.js          ← fichier(s) listés dans manifest.files
```

### manifest.json — schéma complet

```json
{
  "id":           "mon_module",
  "name":         "Mon Module",
  "version":      "1.0.0",
  "description":  "Description courte",
  "group":        "tools",
  "target_key":   "modules_dir",
  "files": [
    { "src": "mon-module.js", "dest": "mon-module.js" }
  ],
  "sanity_check": null
}
```

### Contraintes de validation (Precheck)

| Champ | Obligatoire | Règle |
|---|---|---|
| `id` | ✓ | `[a-z0-9_]+` uniquement |
| `name` | ✓ | texte libre |
| `version` | ✓ | format `X.Y.Z` |
| `description` | ✓ | texte libre |
| `group` | ✓ | `tools` · `system` · `backend` · `dev` · `git` · `menus` · `network` |
| `target_key` | ✓ | `modules_dir` uniquement (V1) |
| `files` | ✓ | liste non vide de `{src, dest}` |
| `files[].dest` | ✓ | pas de `../`, pas de chemin absolu, extension sur whitelist |
| `sanity_check` | ✗ | nom de fonction JS ou `null` |

**Extensions `dest` autorisées :** `.js` `.json` `.md` `.txt` `.css`

**Taille max bundle :** 10 MB

### Créer un bundle minimal (exemple)

```python
import json, zipfile

manifest = {
    "id": "mon_module", "name": "Mon Module", "version": "1.0.0",
    "description": "Module de démonstration", "group": "tools",
    "target_key": "modules_dir",
    "files": [{"src": "mon-module.js", "dest": "mon-module.js"}]
}
with zipfile.ZipFile("mon-module-v1.0.0.zip", "w") as zf:
    zf.writestr("manifest.json", json.dumps(manifest, indent=2))
    zf.writestr("mon-module.js", "// mon-module.js\nconst MON_MODULE = {};\n")
```

Déposer le `.zip` dans `$LOCALCMS_SHARED_ROOT/install-queue/`.

---

## 3. Flux opérateur UI

Accéder au panel **📦 CMS Installer** via la navigation latérale.

### Étape 1 — Scanner la file

Cliquer **🔍 Scanner la file**.

→ La table liste tous les `.zip` présents dans `install-queue/` avec nom, taille et date.

### Étape 2 — Inspecter un bundle

Cliquer **🔍 Inspecter** sur la ligne du bundle voulu.

→ Le manifeste s'affiche avec :
- tous les champs (`id`, `name`, `version`, `group`, `target_key`, `files`)
- badge **✓ Precheck OK** (vert) si le bundle est valide
- badge **N erreur(s) precheck** (rouge) + liste des erreurs si invalide

**Ne pas cliquer Installer si le precheck est rouge.**

### Étape 3 — Installer

Cliquer **⬇ Installer** sur la ligne du bundle.

→ Une boîte de confirmation s'affiche. Valider pour lancer le pipeline.

→ Le pipeline s'affiche étape par étape :

| Étape | Résultat attendu |
|---|---|
| Precheck | ✓ ok |
| Backup | ✓ ok (si fichier préexistant) · ⊘ skipped (première install) |
| Staging | ✓ ok |
| Validate | ✓ ok |
| Install | ✓ ok |
| Post-check | ✓ ok (si `sanity_check` défini) · ⊘ skipped (sinon) |
| Finalize | ✓ ok |

Résultat final : **✓ Installation réussie** (vert).

### Étape 4 — Rollback (si backup disponible)

Après une réinstallation (backup créé) : le bouton **⟲ Rollback — restaurer version précédente** apparaît sous le pipeline.

Cliquer ce bouton → confirmation → la version précédente est restaurée depuis le backup.

→ Le pipeline passe en **⚠ Rollback effectué** (jaune).

**Le bouton rollback n'apparaît pas lors de la première installation** (pas de fichier préexistant → backup: skipped).

### Étape 5 — Historique

Cliquer l'onglet **📋 Historique**, puis **🔄 Actualiser**.

→ Table des logs : timestamp · bundle · module_id · étape · résultat · erreur éventuelle.

---

## 4. API endpoints

Tous préfixés `/api/installer`.

| Méthode | Route | Corps / Paramètre | Description |
|---|---|---|---|
| GET | `/scan` | — | Lister les bundles dans la queue |
| GET | `/inspect` | `?bundle=<filename>` | Lire le manifeste |
| POST | `/precheck` | `{"bundle": "nom.zip"}` | Valider sans installer |
| POST | `/install` | `{"bundle": "nom.zip"}` | Pipeline complet |
| GET | `/history` | — | Logs d'installation |
| POST | `/rollback` | `{"module_id": "mon_module"}` | Restaurer depuis le backup le plus récent |
| GET | `/backups` | `?module_id=<id>` (optionnel) | Lister les backups disponibles |
| POST | `/restore` | `{"module_id": "...", "backup_name": "..."}` | Restaurer un backup explicitement ciblé |

### Exemple — cycle complet via curl

```bash
BASE="http://localhost:8000/api/installer"
BUNDLE="mon-module-v1.0.0.zip"

# Scanner
curl -s "$BASE/scan"

# Inspecter
curl -s "$BASE/inspect?bundle=$BUNDLE"

# Precheck
curl -s -X POST "$BASE/precheck" \
  -H "Content-Type: application/json" \
  -d "{\"bundle\":\"$BUNDLE\"}"

# Installer
curl -s -X POST "$BASE/install" \
  -H "Content-Type: application/json" \
  -d "{\"bundle\":\"$BUNDLE\"}"

# Lister backups
curl -s "$BASE/backups?module_id=mon_module"

# Rollback (dernière sauvegarde)
curl -s -X POST "$BASE/rollback" \
  -H "Content-Type: application/json" \
  -d "{\"module_id\":\"mon_module\"}"
```

---

## 5. Pipeline détaillé

```
Precheck → Backup → Staging → Validate → Install → Post-check → Finalize
```

| Étape | Bloquant | Rollback auto | Ce qui se passe |
|---|---|---|---|
| Precheck | ✓ | non | Validation manifeste + fichiers zip |
| Backup | ✓ | non | Copie fichiers préexistants vers `install-backups/<id>_<ts>/` |
| Staging | ✓ | non | Extraction zip dans `/tmp/localcms_staging_<id>_<uuid>/` |
| Validate | ✓ | oui | Vérification extensions + fichiers présents dans staging |
| Install | ✓ | oui | Copie vers `LOCALCMS_MODULES_DIR` |
| Post-check | non | non | Signal BUS si `sanity_check` défini |
| Finalize | — | non | Nettoyage staging, log final |

**Rollback automatique** : déclenché si Install échoue après début d'écriture. Restaure le backup créé à l'étape Backup.

---

## 6. Scénarios d'erreur et résolution

| Erreur | Cause probable | Action |
|---|---|---|
| Precheck rouge — `id invalide` | `id` contient des majuscules ou tirets | Corriger le `manifest.json` — `[a-z0-9_]` uniquement |
| Precheck rouge — `target_key non autorisé` | Valeur autre que `modules_dir` | Corriger `target_key` |
| Precheck rouge — `src absent du zip` | Le fichier déclaré dans `files` manque dans le zip | Reconstruire le bundle |
| Precheck rouge — `extension non autorisée` | Extension `dest` hors whitelist | Utiliser `.js`, `.json`, `.md`, `.txt` ou `.css` |
| Install HTTP 413 | Bundle > 10 MB | Réduire la taille |
| Install résultat `rollback` | Échec pendant la copie — backup restauré automatiquement | Vérifier les permissions sur `LOCALCMS_MODULES_DIR` |
| Rollback HTTP 404 | Aucun backup pour ce `module_id` | Première installation sans fichier préexistant — pas de backup créé |

---

## 7. Sécurité

- `target_key` traduit côté backend uniquement — aucun chemin libre dans le manifeste
- `dest` : `../` interdit, chemin absolu interdit, extension sur whitelist
- Aucun subprocess, aucun os.system, aucun shell libre
- Rollback automatique en cas d'échec d'écriture
- Backup obligatoire si cible préexistante (max 5 backups par module, les plus récents)
- Logs max 100 entrées (purge automatique des plus anciens)

---

## 8. Limites V1

1. `user_id` = `"cms_user"` hardcodé — à lier au système de session quand disponible.
2. `target_key` = `modules_dir` uniquement — une seule destination autorisée.
3. Pas de désinstallation en V1.
4. Rollback UI visible uniquement après réinstall avec backup — pas de vue globale des backups dans l'UI.
5. `LOCALCMS_MODULES_DIR` doit exister ou être créable par le process uvicorn.

---

## 9. Preuve de validation

| Chantier | Verdict | SHA |
|---|---|---|
| GO_LOCALCMS_CMS_INSTALLER_CHILD_REAL_BUNDLE_ACCEPTANCE_01 | PASS | `5f4d4d1` |
| GO_LOCALCMS_CMS_INSTALLER_CHILD_UI_ACCEPTANCE_01 | PASS | `2888916` |
| Smokes post-patch (`cms-installer.smoke.mjs`) | 10/10 PASS | — |
| Campagne complète V3 | 157/157 PASS | `2b9a07b` |
