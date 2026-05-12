# LocalCMS — Runbook opérateur

> Procédure opérateur stable issue de la validation E2E (GO_LOCALCMS_OPERATOR_WORKFLOW_E2E_ACCEPTANCE_01 — PASS).
> À utiliser comme référence pour toute session d'installation de module.

---

## Prérequis

| Élément | Valeur attendue |
|---|---|
| `LOCALCMS_SHARED_ROOT` | Répertoire partagé configuré (ex. `/home/ghost/localcms_runtime/shared`) |
| `LOCALCMS_MODULES_DIR` | Répertoire destination des modules (ex. `/home/ghost/localcms_runtime/modules`) |
| Python 3.x + uvicorn | Installés |
| Node.js 18+ | Pour les smoke tests |

**Répertoires attendus sous `$LOCALCMS_SHARED_ROOT` :**

```
install-queue/     ← déposer les bundles ici
install-logs/      ← logs JSON écrits automatiquement
install-backups/   ← backups créés automatiquement avant écrasement
```

Créer s'ils n'existent pas :

```bash
mkdir -p "$LOCALCMS_SHARED_ROOT/install-queue"
mkdir -p "$LOCALCMS_SHARED_ROOT/install-logs"
mkdir -p "$LOCALCMS_SHARED_ROOT/install-backups"
```

---

## Étape 1 — Démarrer le host

```bash
cd /home/ghost/localcms

LOCALCMS_SHARED_ROOT=/home/ghost/localcms_runtime/shared \
LOCALCMS_MODULES_DIR=/home/ghost/localcms_runtime/modules \
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Critère PASS :**

```bash
curl http://localhost:8000/health
# → {"status":"ok"}
```

**Critère FAIL :** erreur de port ou variable d'env manquante → vérifier `lsof -ti:8000` et les variables.

---

## Étape 2 — Déposer un bundle

Copier l'archive `.zip` dans `install-queue/` :

```bash
cp mon-module-v1.0.0.zip "$LOCALCMS_SHARED_ROOT/install-queue/"
```

**Format bundle valide :**

```
mon-module-v1.0.0.zip
├── manifest.json        ← obligatoire à la racine exacte
└── mon-module.js        ← fichier(s) déclarés dans manifest.files
```

**manifest.json minimal :**

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

**Critère PASS :** fichier présent dans `install-queue/`.

---

## Étape 3 — Vérifier via Shared Explorer

```bash
BASE="http://localhost:8000"
BUNDLE="mon-module-v1.0.0.zip"

# Lister install-queue — bundle doit apparaître
curl -s "$BASE/api/shared/list?path=install-queue" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print([e['name'] for e in d.get('entries',[])])
"
```

**Critère PASS :** le nom du bundle apparaît dans la liste.

**Critère FAIL :** liste vide ou 404 → vérifier `LOCALCMS_SHARED_ROOT` et la présence du fichier.

---

## Étape 4 — Scanner via Installer

```bash
curl -s "$BASE/api/installer/scan"
```

**Critère PASS :** `bundles[]` contient le bundle avec `filename`, `size`, `modified`.

---

## Étape 5 — Inspecter le manifeste

```bash
curl -s "$BASE/api/installer/inspect?bundle=$BUNDLE"
```

**Critère PASS :** `manifest` retourné avec tous les champs, `files_in_zip[]` cohérent.

**Critère FAIL :** `detail: manifest.json absent` → reconstruire le bundle.

---

## Étape 6 — Precheck

```bash
curl -s -X POST "$BASE/api/installer/precheck" \
  -H "Content-Type: application/json" \
  -d "{\"bundle\":\"$BUNDLE\"}"
```

**Critère PASS :** `result: ok`, `errors: []`.

**Critère FAIL :** `errors[]` non vide → corriger le manifest selon les messages d'erreur avant d'installer.

| Message d'erreur precheck | Action |
|---|---|
| `id invalide` | `id` doit être `[a-z0-9_]+` uniquement |
| `Champ obligatoire manquant` | Ajouter le champ manquant dans manifest.json |
| `target_key non autorisé` | Utiliser `modules_dir` uniquement |
| `dest contient un chemin interdit` | Supprimer les `../` et chemins absolus |
| `src absent du zip` | Ajouter le fichier manquant dans le zip |
| `extension non autorisée` | Utiliser `.js .json .md .txt .css` |

**Ne pas lancer l'install si le precheck retourne des erreurs.**

---

## Étape 7 — Installer

```bash
curl -s -X POST "$BASE/api/installer/install" \
  -H "Content-Type: application/json" \
  -d "{\"bundle\":\"$BUNDLE\"}"
```

**Pipeline attendu :**

| Étape | Résultat 1ère install | Résultat réinstall |
|---|---|---|
| `precheck` | ok | ok |
| `backup` | skipped | ok |
| `staging` | ok | ok |
| `validate` | ok | ok |
| `install` | ok | ok |
| `post_check` | skipped (si sanity_check null) | skipped |
| `finalize` | ok | ok |

**Critère PASS :** `result: ok`.

**Critère FAIL :** `result: failed` ou `result: rollback` → consulter le champ `error` et les logs.

---

## Étape 8 — Vérifier le fichier installé

```bash
ls -la "$LOCALCMS_MODULES_DIR/mon-module.js"
```

**Critère PASS :** fichier présent avec la date de l'installation.

---

## Étape 9 — Consulter l'historique

```bash
curl -s "$BASE/api/installer/history" | python3 -c "
import sys,json
d=json.load(sys.stdin)
logs=d.get('logs',[])
for l in logs[-5:]:
    print(f'[{l[\"timestamp\"][:19]}] {l[\"action\"]} {l[\"module_id\"]} step={l[\"pipeline_step\"]} result={l[\"result\"]}')
"
```

**Critère PASS :** entrée `finalize / result: ok` visible pour le module installé.

---

## Étape 10 — Lire les logs via Shared Explorer

```bash
# Lister les logs disponibles
curl -s "$BASE/api/shared/list?path=install-logs"

# Lire un log spécifique
curl -s "$BASE/api/shared/read?path=install-logs/install_mon_module_<timestamp>.json"
```

**Critère PASS :** JSON structuré retourné avec `timestamp`, `action`, `module_id`, `pipeline_step`, `result`.

---

## Étape 11 — Rollback (si backup disponible)

Un backup est créé uniquement lors d'une **réinstallation** (fichier préexistant dans `MODULES_DIR`).

```bash
# Lister les backups disponibles
curl -s "$BASE/api/installer/backups?module_id=mon_module"

# Rollback automatique (dernier backup)
curl -s -X POST "$BASE/api/installer/rollback" \
  -H "Content-Type: application/json" \
  -d '{"module_id":"mon_module"}'
```

**Critère PASS rollback :** `result: ok`, `restored_files[]` non vide, `backup_used` renseigné.

**Critère FAIL rollback :** HTTP 404 → aucun backup disponible (première installation sans préexistant).

---

## Étape 12 — Nettoyage post-session

```bash
# Supprimer le bundle de la queue si déploiement terminé
rm "$LOCALCMS_SHARED_ROOT/install-queue/$BUNDLE"

# Arrêter le host
kill $(lsof -ti:8000)
```

Les logs (`install-logs/`) et backups (`install-backups/`) sont conservés automatiquement.

---

## Critères PASS / FAIL globaux

| Critère | PASS | FAIL |
|---|---|---|
| Host santé | `{"status":"ok"}` | Erreur de bind ou import |
| Bundle visible SE | present dans `list install-queue` | absent ou 404 |
| Precheck | `result: ok`, `errors: []` | `errors[]` non vide |
| Install | `result: ok`, toutes étapes ok | `result: failed` ou `rollback` |
| Fichier installé | présent dans MODULES_DIR | absent |
| Log visible | entrée finalize dans history | absent |
| Rollback | `result: ok` si backup dispo | 404 si première install |

---

## Checklist opérateur rapide

```
[ ] Host démarré — /health → ok
[ ] Bundle déposé dans install-queue/
[ ] Bundle visible dans Shared Explorer (list install-queue)
[ ] scan → bundle présent
[ ] inspect → manifest valide
[ ] precheck → result: ok, errors: []
[ ] install → result: ok, toutes étapes
[ ] Fichier présent dans MODULES_DIR
[ ] history → entrée finalize ok
[ ] (si réinstall) rollback disponible et fonctionnel
[ ] Nettoyage queue si nécessaire
```

---

## Références

- Guide Shared Explorer : `docs/operator/SHARED_EXPLORER_V1_OPERATOR_GUIDE.md`
- Guide CMS Installer : `docs/operator/CMS_INSTALLER_V1_OPERATOR_GUIDE.md`
- Validation E2E : `docs/chantiers/GO_LOCALCMS_OPERATOR_WORKFLOW_E2E_ACCEPTANCE_01/README.md`
