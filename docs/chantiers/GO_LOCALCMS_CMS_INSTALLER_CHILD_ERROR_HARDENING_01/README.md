# GO_LOCALCMS_CMS_INSTALLER_CHILD_ERROR_HARDENING_01

## Objectif

Durcir CMS Module Installer V1 sur les erreurs opérateur et bundles invalides.

## Base canonique

- Repo: /home/ghost/localcms
- Branche: go/GO_LOCALCMS_CMS_INSTALLER_CHILD_ERROR_HARDENING_01
- Base: main @ 8a2be87
- Remote: git@github.com:magikgmo4-ui/localcms.git

---

## Fixtures invalides testées

| Code | Bundle | Cas d'erreur |
| ---- | ------ | ------------ |
| F1 | `bad_no_manifest.zip` | manifest absent du zip |
| F2 | `bad_invalid_json.zip` | manifest.json syntaxe JSON invalide |
| F3 | `bad_missing_field.zip` | champ obligatoire `group` manquant |
| F4 | `bad_path_traversal.zip` | `dest: "../../evil.js"` — path traversal |
| F5 | `bad_src_missing.zip` | `src` déclaré dans manifest mais absent du zip |
| F6 | `bad_target_key.zip` | `target_key: "root_dir"` — non autorisé |

Toutes créées programmatiquement, testées contre le host live (`port 8001`), supprimées après test.

---

## Résultats par cas

### F1 — manifest absent
- **precheck** : `failed` — `manifest.json absent de la racine du bundle`
- **install** : `failed`
- **fichiers écrits** : aucun ✓

### F2 — manifest JSON invalide
- **precheck** : `failed` — `Expecting property name enclosed in double quotes: line 1 column 3 (char 2)`
- **install** : `failed`
- **fichiers écrits** : aucun ✓

### F3 — champ requis manquant (`group`)
- **precheck** : `failed` — `Champ obligatoire manquant : group`
- **install** : `failed`
- **fichiers écrits** : aucun ✓

### F4 — path traversal dans `dest`
- **precheck** : `failed` — `files[0].dest contient un chemin interdit : ../../evil.js`
- **install** : `failed`
- **fichiers écrits** : aucun ✓

### F5 — `src` absent du zip
- **precheck** : `failed` — `files[0].src 'missing.js' absent du zip`
- **install** : `failed`
- **fichiers écrits** : aucun ✓

### F6 — `target_key` invalide
- **precheck** : `failed` — `target_key 'root_dir' non autorisé (autorisés : ['modules_dir'])`
- **install** : `failed`
- **fichiers écrits** : aucun ✓

---

## Smokes post-test

```
cms-installer.smoke.mjs — 10/10 PASS — 0 régression
```

---

## Isolation runtime vérifiée

`LOCALCMS_MODULES_DIR` (`/home/ghost/localcms_runtime/modules`) : **aucun fichier écrit** par aucun des 6 bundles invalides.

---

## Aucune modification applicative

Le backend `api/cms_installer.py` bloque correctement tous les cas testés sans modification.
Aucun patch de code applicatif nécessaire.

---

## Verdict

**PASS — 6/6 cas invalides bloqués proprement**

Le Precheck arrête tous les cas avant toute écriture.
Le runtime reste propre après chaque échec.

## Prochain GO recommandé

Installer V1 est maintenant validé sur :
- backend réel (bundle minimal)
- UI opérateur (rollback visible)
- documentation opérateur
- durcissement erreurs (6/6 cas invalides bloqués)

Prochain chantier selon besoin : autre surface (Shared Explorer hardening, Config Store, host hardening) ou chantier applicatif réel.
