---
doc_id: LOCALCMS_REPRISE
doc_type: reprise
repo: localcms
project: localcms
module:
go_id: GO_LOCALCMS_CONTINUITY_INDEX_REALIGN_01
status: reference
lifecycle_stage: reprise
topic_keys:
  - localcms
  - reprise
  - continuity
  - tests
surface: consumer
source_kind: canonical
updated_at: 2026-04-16
links:
  - docs/governance/REPO_ROLE.md
  - docs/governance/DOC_LAYERS.md
---

# REPRISE — localcms

## Reprendre ici
- repo : `localcms`
- branche retenue : `main` — HEAD `79250cc`
- flux à lire : `GO_LOCALCMS_CONTINUITY_INDEX_REALIGN_01`
- références prioritaires :
  - `docs/governance/REPO_ROLE.md`
  - `docs/governance/DOC_LAYERS.md`
  - `docs/go/CLOSEOUT_MACHINES_CONFIG_ADOPT_01.txt`
  - `docs/go/CLOSEOUT_SHARED_EXPLORER_INTEGRATION_01.txt`
- dernier point établi :
  - campagne adopt config 8/8 CLOSE sur `main`
  - tests d’intégration `shared_explorer` 23/23 PASS sur `main`
  - `devtools-config-adopt` PASS — validé sur machine Ghost
  - rôle consumer local confirmé
- prochaine action recommandée : `GO_LOCALCMS_FULL_TEST_CAMPAIGN_01` — campagne test complète sur `main` ; nettoyage de branches mortes seulement après campagne verte
