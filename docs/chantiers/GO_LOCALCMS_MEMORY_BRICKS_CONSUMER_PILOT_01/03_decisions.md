---
doc_id: GO_LOCALCMS_MEMORY_BRICKS_CONSUMER_PILOT_01_DECISIONS
doc_type: decision
repo: localcms
project: localcms
module: memory_bricks_consumer
go_id: GO_LOCALCMS_MEMORY_BRICKS_CONSUMER_PILOT_01
status: active
lifecycle_stage: validation
topic_keys:
  - localcms
  - memory_bricks
  - consumer
  - decisions
surface: consumer
source_kind: canonical
updated_at: 2026-04-11
links:
  - docs/governance/REPO_ROLE.md
  - docs/governance/DOC_LAYERS.md
---

# 03_decisions — GO_LOCALCMS_MEMORY_BRICKS_CONSUMER_PILOT_01

## Décision 1
- sujet : rôle du pilote localcms
- option retenue : pilote explicitement consumer `memory_bricks`
- raison du choix : valider le rôle local de `localcms` sans le confondre avec la source amont
- impact : le lot reste centré sur la consommation projet et la continuité locale

## Décision 2
- sujet : support Git retenu
- option retenue : `main`
- raison du choix : branche réellement observable via GitHub pour ce lot
- impact : le chantier avance sur un support vérifié, sans inventer une branche non confirmée

## Décision 3
- sujet : portée du lot
- option retenue : chantier documentaire canonique sans modification du canon `memory_bricks`
- raison du choix : fixer d’abord le rôle consumer avant tout raffinement produit plus large
- impact : le pilote reste court, lisible et réutilisable comme référence locale
