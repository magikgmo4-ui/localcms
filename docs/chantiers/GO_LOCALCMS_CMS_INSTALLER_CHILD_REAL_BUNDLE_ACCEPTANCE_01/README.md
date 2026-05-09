# GO_LOCALCMS_CMS_INSTALLER_CHILD_REAL_BUNDLE_ACCEPTANCE_01

## Objectif

Valider CMS Module Installer V1 en condition applicative réelle contrôlée avec un bundle minimal installable.

## Base canonique

- Repo: /home/ghost/localcms
- Branche: go/GO_LOCALCMS_CMS_INSTALLER_CHILD_REAL_BUNDLE_ACCEPTANCE_01
- Base: main @ b07ea29
- Remote: git@github.com:magikgmo4-ui/localcms.git

## Configuration runtime

- `LOCALCMS_SHARED_ROOT`: `/home/ghost/localcms_runtime/shared`
- `LOCALCMS_MODULES_DIR`: `/home/ghost/localcms_runtime/modules`
- `INSTALL_QUEUE`: `/home/ghost/localcms_runtime/shared/install-queue/`
- Host: `uvicorn main:app --host 127.0.0.1 --port 8001`

---

## Bundle minimal utilisé

**Fichier**: `test_acceptance_module_v1.zip` (695 bytes)

**Contenu**:
- `manifest.json`
- `test_acceptance_module.js`

**manifest.json**:
```json
{
  "id": "test_acceptance_module",
  "name": "Test Acceptance Module",
  "version": "1.0.0",
  "description": "Bundle minimal pour acceptance test",
  "group": "tools",
  "target_key": "modules_dir",
  "files": [
    {"src": "test_acceptance_module.js", "dest": "test_acceptance_module.js"}
  ]
}
```

---

## Résultats pipeline

### GET /api/installer/scan
- Bundle détecté dans la queue ✓
- count: 6 bundles listés (dont test_acceptance_module_v1.zip)

### GET /api/installer/inspect?bundle=test_acceptance_module_v1.zip
- Manifeste lu correctement ✓
- files_in_zip: `['manifest.json', 'test_acceptance_module.js']` ✓

### POST /api/installer/precheck
- `result: ok` ✓
- `errors: []` ✓

### POST /api/installer/install (1ère passe — pas de fichier existant)

| Étape      | Statut   |
| ---------- | -------- |
| precheck   | ok       |
| backup     | skipped (aucun fichier préexistant) |
| staging    | ok       |
| validate   | ok       |
| install    | ok       |
| post_check | skipped (sanity_check: null) |
| finalize   | ok       |

`result: ok` · `installed_files: ['test_acceptance_module.js']` ✓

Fichier vérifié sur disque : `/home/ghost/localcms_runtime/modules/test_acceptance_module.js` (329 bytes) ✓

### POST /api/installer/install (2ème passe — réinstall avec backup)

| Étape      | Statut   |
| ---------- | -------- |
| precheck   | ok       |
| backup     | **ok** — backup créé |
| staging    | ok       |
| validate   | ok       |
| install    | ok       |
| post_check | skipped  |
| finalize   | ok       |

`result: ok` ✓

### GET /api/installer/backups?module_id=test_acceptance_module
- 1 backup créé ✓
- `backup_name: test_acceptance_module_20260509T100728060511` ✓
- `files: ['test_acceptance_module.js']` ✓

### POST /api/installer/rollback
- `result: ok` ✓
- `backup_used: test_acceptance_module_20260509T100728060511` ✓
- `restored_files: ['test_acceptance_module.js']` ✓

### GET /api/installer/history
- 92 logs présents (historique cumulé runtime) ✓
- Logs structurés avec timestamp, action, pipeline_step, result ✓

---

## Isolation vérifiée

Le fichier installé a été écrit dans `/home/ghost/localcms_runtime/modules/` (LOCALCMS_MODULES_DIR).
Le répertoire `/home/ghost/localcms/modules/` (repo) n'a **pas été touché**.

Preuve : diff des deux répertoires confirme leur indépendance. ✓

---

## Nettoyage post-test

- `test_acceptance_module.js` supprimé de `/localcms_runtime/modules/` ✓
- `test_acceptance_module_v1.zip` supprimé de la queue ✓
- Backup test supprimé de `install-backups/` ✓
- Runtime ramené à l'état pré-test ✓

---

## Surfaces prouvées

| Surface | Résultat |
| ------- | -------- |
| Scan queue | ✓ |
| Inspect manifeste | ✓ |
| Precheck validation | ✓ |
| Install (sans préexistant) | ✓ |
| Install (avec backup) | ✓ |
| Backup création | ✓ |
| Rollback depuis backup | ✓ |
| History logs structurés | ✓ |
| Isolation runtime / repo | ✓ |

## Verdict

**PASS**

CMS Module Installer V1 est validé en condition applicative réelle contrôlée.
Le cycle complet Scan → Inspect → Precheck → Install → Backup → Rollback est fonctionnel.

## Prochain GO recommandé

Aucun gap bloquant identifié dans le pipeline installer.
Prochain chantier à définir selon besoin applicatif réel (ex: bundle de production, sanity_check réel, UI d'installation).
