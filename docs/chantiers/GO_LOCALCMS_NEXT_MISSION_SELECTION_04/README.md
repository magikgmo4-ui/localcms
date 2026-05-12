# GO_LOCALCMS_NEXT_MISSION_SELECTION_04

## Objectif

Sélectionner le prochain module M4 à formaliser après la baseline M1+M2+M3 `v1.0.0-m3-baseline`.

## Base canonique

- Repo: /home/ghost/localcms
- Branche: go/GO_LOCALCMS_NEXT_MISSION_SELECTION_04
- Base: main @ 72ba1d4
- Tag baseline: `v1.0.0-m3-baseline` → `515a357`

---

## Inventaire des modules existants

### Famille M-3.x — modules data frontend wired to Config Store M3

| Module | Identifiant | Lignes | Smokes | Adopt tests | Statut |
|---|---|---|---|---|---|
| `ia-config.js` | MOD_IA_CFG_DATA · M-3.1 | 242 | 125 OK | 0 | non formalisé |
| `machines-config.js` | MOD_MACHINES_CFG_DATA · M-3.2 | 308 | 151 OK | 0 | non formalisé |
| `data-sources.js` | MOD_DATA_SOURCES_DATA · M-3.3 | 303 | 136 OK | **52/52 PASS** | non formalisé |
| `env-global.js` | MOD_ENV_GLOBAL_DATA · M-3.4 | 183 | 78 OK | 0 | **utilisé dans acceptance M3** |

### Famille M-4.x — prochaine génération modules config

| Module | Identifiant | Lignes | Smokes | Adopt tests | Statut |
|---|---|---|---|---|---|
| `queue-config.js` | MOD_QUEUE_CFG_DATA · M-4.1 | 301 | 169 OK | 0 | non formalisé |
| `sec-config.js` | MOD_SEC_CFG_DATA · M-4.2 | 344 | 169 OK | **50/50 PASS** | non formalisé |
| `apps-config.js` | MOD_APPS_CFG_DATA · M-4.3 | 462 | 236 OK | 0 | non formalisé |
| `devtools-config.js` | MOD_DEVTOOLS_CFG_DATA · M-4.4 | 376 | 193 OK | 0 | non formalisé |

### Hors série — module embarqué dans localcms-v5.html

| Module | Identifiant | Adopt tests | Statut |
|---|---|---|---|
| `memory-view` | MOD_MEMORY_VIEW | **38/38 PASS** | pas de fichier .js standalone — extrait de localcms-v5.html |

---

## Critères de sélection

| Critère | Poids | Raison |
|---|---|---|
| Couverture tests existante | fort | valide que le module est déjà stable avant formalisation |
| Taille / complexité | moyen | module trop petit = peu de valeur, trop grand = risque |
| Famille / suite logique | moyen | continuer la série en cours plutôt que sauter une famille |
| Dépendances M3 | fort | préférer un module déjà wired to Config Store |
| Smokes PASS | requis | aucun module avec smoke FAIL ne peut être candidat M4 |

---

## Évaluation des candidats prioritaires

### Candidat A — `data-sources.js` (M-3.3)

- **Pour** : 52 adopt tests PASS (couverture la plus forte) + 136 smokes OK · taille moyenne (303 lignes) · famille M-3.x suite logique de M3 Config Store
- **Contre** : pas de chantier d'acceptance formelle · pas de doc opérateur · pas d'adopt tests dans npm run test:adopt (non référencé dans le runner)
- **Risque** : faible — module déclaratif pur, aucun effet de bord

### Candidat B — `sec-config.js` (M-4.2)

- **Pour** : 50 adopt tests PASS · 169 smokes OK · surface sécurité à forte valeur · taille moyenne (344 lignes)
- **Contre** : saute M-4.1 (queue-config) dans la numérotation
- **Risque** : faible — module déclaratif pur

### Candidat C — `queue-config.js` (M-4.1)

- **Pour** : premier de la série M-4.x · 169 smokes OK · taille moyenne (301 lignes)
- **Contre** : 0 adopt tests — moins de couverture existante
- **Risque** : faible

### Candidat D — `memory-view`

- **Pour** : 38 adopt tests PASS · module distinct non encore standalone
- **Contre** : pas de fichier .js isolé dans modules/ — extrait de localcms-v5.html · chantier de nature différente (extraction + acceptance)
- **Risque** : moyen — nécessite un chantier d'extraction préalable

---

## Décision

**Module M4 sélectionné : `data-sources.js` — MOD_DATA_SOURCES_DATA · M-3.3**

### Justification

1. **Couverture tests la plus forte** : 52 adopt tests PASS déjà existants — c'est la meilleure preuve de stabilité avant formalisation.
2. **Suite logique directe** : M-3.3 suit naturellement M-3.4 (`env-global`) qui a été le module candidat de toutes les acceptances M3. La famille M-3.x est la continuation immédiate de M3 Config Store.
3. **Complexité maîtrisée** : 303 lignes, module déclaratif pur (données uniquement), aucun effet de bord.
4. **Smokes stables** : 136 assertions OK.
5. **Pas de dépendance bloquante** : indépendant de M-4.x, peut être accepté avant d'entrer dans la série M-4.

### Prochain GO

```text
GO_LOCALCMS_DATA_SOURCES_M4_ACCEPTANCE_01
```

Objectif :
- Acceptance réelle de `data-sources.js` (MOD_DATA_SOURCES_DATA)
- Vérification des 52 adopt tests + 136 smokes dans le runner
- Intégration Config Store M3 si applicable
- Doc opérateur ou fiche module
- Rapport PASS/FAIL

---

## Ce qui n'est pas M4

| Module | Décision | Raison |
|---|---|---|
| `memory-view` | hors M4 | extraction localcms-v5.html nécessaire d'abord |
| `apps-config.js` | M-4.3, après M-4.1 et M-4.2 | respecter l'ordre de la série |
| `devtools-config.js` | M-4.4, dernier de la série | idem |
| `ia-config.js`, `machines-config.js` | M-3.1/M-3.2, après M-3.3 | continuer M-3.x dans l'ordre inverse |

---

## Aucune modification applicative

- Aucun fichier `modules/` modifié
- Aucun fichier `api/` modifié
- Aucun fichier `tests/` modifié

---

## Verdict

**PASS — M4 sélectionné : `data-sources.js` (MOD_DATA_SOURCES_DATA · M-3.3)**

La sélection est documentée, justifiée et compatible avec la baseline `v1.0.0-m3-baseline`.

## Prochain GO

```text
GO_LOCALCMS_DATA_SOURCES_M4_ACCEPTANCE_01
Partir de main @ 72ba1d4
Module : data-sources.js — MOD_DATA_SOURCES_DATA · M-3.3
```
