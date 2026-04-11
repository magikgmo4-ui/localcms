---
doc_id: LOCALCMS_DOC_LAYERS
doc_type: workflow_rule
repo: localcms
project: localcms
module:
go_id: GO_LOCALCMS_UNIFORM_CONTINUITY_ALIGNMENT_01
status: reference
lifecycle_stage: governance
topic_keys:
  - localcms
  - doc_layers
  - governance
  - continuity
  - consumer
surface: consumer
source_kind: canonical
updated_at: 2026-04-11
links:
  - docs/governance/REPO_ROLE.md
---

# DOC_LAYERS — localcms

## Objet

Ce document fixe les couches documentaires utilisées dans `localcms` dans le cadre de la méthode uniforme.

---

## 1. Couches retenues

- gouvernance locale
- chantier local
- continuité projet
- consommation de compaction
- couche humaine à dériver si utile

---

## 2. Gouvernance locale

### But
Définir le rôle local de `localcms` et ses règles d’alignement avec le canon amont.

### Artefacts typiques
- `REPO_ROLE.md`
- `DOC_LAYERS.md`

---

## 3. Chantier local

### But
Porter les chantiers propres à `localcms` au format canonique retenu.

### Structure canonique
- `00_cadrage.md`
- `01_plan.md`
- `02_journal_technique.md`
- `03_decisions.md`
- `90_closeout.md`

---

## 4. Continuité projet

### But
Rendre visibles :
- reprise locale
- next projet
- closeouts projet
- opportunités utiles au produit

### Artefacts typiques
- `docs/index/GO_INDEX.md`
- `docs/index/ACTIVE_STREAMS.md`
- `docs/index/REPRISE.md`
- `docs/next/NEXT_GO_CANDIDATES.md`
- `docs/opportunities/OPPORTUNITY_LOG.md`

---

## 5. Consommation de compaction

### But
Permettre à `localcms` de consommer `memory_bricks` sans devenir la source maîtresse de la compaction.

### Règle
La couche consumer reste dérivée et alignée sur le schéma canonique amont.

---

## 6. Règles anti-mélange

### 6.1 La surface produit ne remplace pas le canon d’exécution

### 6.2 La continuité projet ne remplace pas la gouvernance transverse

### 6.3 La consommation de compaction ne remplace pas `memory_bricks`

---

## 7. Statut

Statut :
- document de référence locale
