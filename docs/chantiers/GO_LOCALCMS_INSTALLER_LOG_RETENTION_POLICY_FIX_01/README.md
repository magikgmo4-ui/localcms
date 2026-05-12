# GO_LOCALCMS_INSTALLER_LOG_RETENTION_POLICY_FIX_01

## Objectif

Corriger la politique de rétention des logs CMS Installer : remplacer le tri alphabétique par un tri chronologique pour garantir que les logs les plus récents sont conservés quelle que soit l'ordre alphabétique du module_id.

## Base canonique

- Repo: /home/ghost/localcms
- Branche: go/GO_LOCALCMS_INSTALLER_LOG_RETENTION_POLICY_FIX_01
- Base: main @ d5d1f59
- Remote: git@github.com:magikgmo4-ui/localcms.git

## Décision héritée

- GO_LOCALCMS_OPERATOR_REAL_MODULE_ACCEPTANCE_01: PASS 10/12 — limite documentée : purge alphabétique purgait immédiatement les logs de modules à ID alphabétiquement bas (`env_global` purgé par `hello_mod`, `unknown`, etc.)

---

## Problème

`_purge_old_logs()` dans `api/cms_installer.py` triait les fichiers log par **nom de fichier décroissant** :

```python
# AVANT — tri alphabétique décroissant
logs = sorted(
    [f for f in LOG_DIR.iterdir() if f.is_file() and f.suffix == ".json"],
    reverse=True,
)
```

Les noms de fichiers sont `install_<module_id>_<timestamp>.json`. Avec ce tri :
- `install_unknown_*` (u) est conservé en priorité sur `install_env_global_*` (e)
- Un module dont l'id commence par une lettre basse (`a`–`m`) voyait ses logs purgés immédiatement si le cap était atteint, même s'ils venaient d'être écrits

---

## Correctif

Trier par **date de modification** (`st_mtime`) décroissante — les 100 fichiers les plus récemment écrits sont conservés, quelle que soit l'alphabétique du module_id :

```python
# APRÈS — tri chronologique décroissant (mtime)
logs = sorted(
    [f for f in LOG_DIR.iterdir() if f.is_file() and f.suffix == ".json"],
    key=lambda f: f.stat().st_mtime,
    reverse=True,
)
```

**Fichier modifié :** `api/cms_installer.py` · fonction `_purge_old_logs()` · 1 ligne ajoutée (`key=`)

---

## Test de régression ajouté

**`tests/integration_test_pipeline.py` — I27**

Scénario :
1. Créer 100 fichiers dont les noms sortent haut alphabétiquement (`z_module`)
2. Créer 3 fichiers dont les noms sortent bas alphabétiquement (`a_module`) — écrits après, donc plus récents par mtime
3. Appliquer `_purge(cap=100)`
4. Vérifier que les 3 fichiers `a_module` (les plus récents) sont conservés
5. Vérifier que le total ne dépasse pas 100

**Résultat :** I27 PASS

---

## Résultats

| Suite | Avant correctif | Après correctif |
| ----- | --------------- | --------------- |
| `integration_test_pipeline.py` | 26/26 PASS | **27/27 PASS** |
| `cms-installer.smoke.mjs` (live) | 10/10 PASS | 10/10 PASS |
| `shared-explorer.smoke.js` (live) | 6/6 PASS | 6/6 PASS |
| Logs `env_global` visibles après install | non (purgés) | **oui (3 fichiers retenus)** |

---

## Preuve live

Après correctif, installation de `env-global-v1.0.0.zip` sur runtime avec cap=100 déjà plein :

```
install_env_global_20260512T015114885346.json  ← conservé ✓
install_env_global_20260512T015114888609.json  ← conservé ✓
install_env_global_20260512T015114891454.json  ← conservé ✓
```

---

## Périmètre du correctif

| Fichier | Modification |
| ------- | ------------ |
| `api/cms_installer.py` | `_purge_old_logs()` : ajout `key=lambda f: f.stat().st_mtime` |
| `tests/integration_test_pipeline.py` | Ajout test I27 (régression cap chronologique) |

Aucune autre modification applicative.

---

## Verdict

**PASS — correctif minimal, régression couverte, smokes 0 régression**

La politique de rétention est maintenant chronologique : les 100 logs les plus récents sont conservés quelle que soit l'ordre alphabétique du module_id.

## Prochain GO recommandé

Prochain chantier selon besoin : Config Store M3 acceptance réelle, M3 guide opérateur, ou autre surface.
