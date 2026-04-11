---
doc_id: GO_LOCALCMS_MEMORY_BRICKS_CONSUMER_PILOT_01_CADRAGE
doc_type: chantier_cadrage
repo: localcms
project: localcms
module: memory_bricks_consumer
go_id: GO_LOCALCMS_MEMORY_BRICKS_CONSUMER_PILOT_01
status: active
lifecycle_stage: cadrage
topic_keys:
  - localcms
  - memory_bricks
  - consumer
  - pilot
surface: consumer
source_kind: canonical
updated_at: 2026-04-11
links:
  - docs/governance/REPO_ROLE.md
  - docs/governance/DOC_LAYERS.md
  - docs/index/REPRISE.md
---

# 00_cadrage — GO_LOCALCMS_MEMORY_BRICKS_CONSUMER_PILOT_01

## Identité
- GO : GO_LOCALCMS_MEMORY_BRICKS_CONSUMER_PILOT_01
- Repo : localcms
- Branche : main
- Statut : active
- Type de travail : chantier pilote consumer `memory_bricks`

## État de départ retenu
- état repo retenu : socle minimal d’alignement `localcms` déjà posé sur `main`
- artefacts existants retenus : `REPO_ROLE.md`, `DOC_LAYERS.md`, `REPRISE.md`, `GO_INDEX.md`, `ACTIVE_STREAMS.md`, `NEXT_GO_CANDIDATES.md`, `OPPORTUNITY_LOG.md`
- limites connues : aucun chantier pilote canonique localcms n’était encore directement dédié au rôle consumer `memory_bricks`
- dépendances : compatibilité avec le canon amont posé dans `opt-trading` et `openclaw`

## Objectif du lot
- objectif principal : produire un premier chantier canonique localcms directement ancré sur la consommation de `memory_bricks`
- résultat attendu : un dossier chantier complet qui fixe le rôle consumer sans inverser la source de vérité

## Non-objectifs
- modifier le canon `memory_bricks` dans `opt-trading`
- refondre l’ensemble de l’historique documentaire `localcms`

## Contexte utile
- source humaine / contexte : après pose du canon dans `opt-trading` et `openclaw`, `localcms` doit être aligné comme repo consumer projet
- artefacts de référence : socle localcms, canon amont, rôle consumer retenu

## Critères PASS / FAIL
- PASS si : le dossier chantier complet montre clairement comment `localcms` consomme `memory_bricks` sans concurrencer le canon amont
- FAIL si : le chantier reste abstrait ou brouille la distinction entre consumer et source maîtresse

## Point de vigilance
- risque principal : retomber dans une doc trop théorique sans valeur de reprise produit
- point d’arrêt acceptable : cadrage, décisions et closeout suffisants pour servir de premier exemple canonique consumer
