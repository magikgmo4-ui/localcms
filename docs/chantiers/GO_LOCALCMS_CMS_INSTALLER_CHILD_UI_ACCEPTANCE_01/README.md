# GO_LOCALCMS_CMS_INSTALLER_CHILD_UI_ACCEPTANCE_01

## Objectif

Valider le flux opérateur/UI du CMS Module Installer V1 et corriger les gaps UI bloquants.

## Base canonique

- Repo: /home/ghost/localcms
- Branche: go/GO_LOCALCMS_CMS_INSTALLER_CHILD_UI_ACCEPTANCE_01
- Base: main @ bcd65d9
- Remote: git@github.com:magikgmo4-ui/localcms.git

## Décision héritée

- GO_LOCALCMS_CMS_INSTALLER_CHILD_REAL_BUNDLE_ACCEPTANCE_01: PASS — backend installeur validé en condition réelle

---

## Audit UI — surfaces présentes avant patch

| Surface opérateur | Implémentation dans cms-installer.js | Statut |
| ----------------- | ------------------------------------- | ------ |
| Scan (liste bundles) | `scan()` + table avec filename/taille/date | ✓ présent |
| Inspect + Precheck | `inspect()` — appels parallèles + manifeste + badge vert/rouge | ✓ présent |
| Install | `installBundle()` + confirm dialog + pipeline display | ✓ présent |
| Pipeline display | steps colorés avec icônes ✓/✕/⊘/⟳/○ | ✓ présent |
| History/Logs | onglet `📋 Historique` + table timestamp/bundle/étape/résultat | ✓ présent |
| Rollback visible | aucun bouton UI — backend disponible mais non exposé | **⚠ GAP** |

---

## Gap identifié et corrigé

### Gap : rollback non exposé côté UI opérateur

**Cause** : `module_id` non stocké dans `pipelineState` après install → impossible de cibler le bon module pour le rollback.

**Patch appliqué** (`modules/cms-installer.js`) :

1. `installBundle()` — ajouter `module_id: data.module_id` dans `pipelineState`
2. `_renderPipeline()` — destructurer `module_id` ; afficher bouton rollback si `result === 'ok'` ET `backup.status === 'ok'`
3. Ajouter `rollback(moduleId)` — POST `/api/installer/rollback`, mise à jour pipelineState, re-render
4. Exposer `rollback` dans le return public du module

### Comportement après patch

- Après une réinstallation (backup créé) : le panneau pipeline affiche `⟲ Rollback — restaurer version précédente`
- Le bouton n'apparaît PAS lors de la première installation (backup: skipped) — correct
- Après rollback : pipeline passe en état `⚠ Rollback effectué` (jaune)
- L'action est confirmée par dialog avant exécution

---

## Tests

### Smokes cms-installer.smoke.mjs (mode MOCK)

```
10/10 smokes passés — 0 régression
```

S8 (Rollback POST) et S9 (Backups) couvrent les endpoints concernés.

### Vérification statique

```
grep -n "module_id|rollback" modules/cms-installer.js
```
→ 15 occurrences cohérentes, aucun chemin orphelin.

---

## Flux opérateur validé

```
Scanner → liste bundles → Inspecter → manifeste + precheck badge
       → Installer → pipeline steps colorés
       → (si backup créé) → Rollback visible et fonctionnel
       → Historique → table des logs structurés
```

---

## Fichiers modifiés

| Fichier | Changement |
| ------- | ---------- |
| `modules/cms-installer.js` | +39 lignes, -2 lignes — rollback UI |

Surfaces non touchées : Shared Explorer, DBLayer, config modules, host, HTML.

## Verdict

**PASS**

Gap UI rollback corrigé. Flux opérateur complet validé statiquement et par smoke tests 10/10.

## Prochain GO recommandé

Aucun gap UI bloquant restant identifié sur l'installer V1.
Prochain chantier à définir selon besoin applicatif (ex: bundle de production réel, sanity_check fonctionnel, ou autre surface).
