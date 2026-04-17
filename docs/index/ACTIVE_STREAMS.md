---
doc_id: LOCALCMS_ACTIVE_STREAMS
doc_type: reprise
repo: localcms
project: localcms
module:
go_id:
status: reference
lifecycle_stage: reprise
topic_keys:
  - localcms
  - active_streams
  - continuity
  - consumer
surface: consumer
source_kind: canonical
updated_at: 2026-04-16
links:
  - docs/index/GO_INDEX.md
---

# ACTIVE_STREAMS — localcms

## Objet

Ce document référence les flux réellement actifs ou bloqués dans `localcms`.

## Flux actifs

### GO_LOCALCMS_UNIFORM_CONTINUITY_ALIGNMENT_01
- statut : clos (suppléanté par GO_LOCALCMS_CONTINUITY_INDEX_REALIGN_01)
- repo : localcms
- branche : main
- dernier point établi : socle consumer local posé ; index locaux réalignés post-campagne adopt 8/8 + intégration shared_explorer PASS
- prochaine action : aucune — ce flux est fermé

### GO_LOCALCMS_FULL_TEST_CAMPAIGN_01
- statut : candidat prioritaire
- repo : localcms
- branche : main — HEAD `79250cc`
- dernier point établi : adopt 8/8 PASS · shared_explorer integration 23/23 PASS · devtools-config-adopt PASS sur Ghost
- prochaine action : lancer campagne test complète sur `main` — toutes suites adopt + intégration + smoke en séquence ; nettoyage branches mortes après campagne verte
- blocages : aucun
