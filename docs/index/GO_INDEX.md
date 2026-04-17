---
doc_id: LOCALCMS_GO_INDEX
doc_type: reprise
repo: localcms
project: localcms
module:
go_id:
status: reference
lifecycle_stage: governance
topic_keys:
  - localcms
  - go_index
  - continuity
  - consumer
surface: consumer
source_kind: canonical
updated_at: 2026-04-16
links:
  - docs/governance/REPO_ROLE.md
  - docs/governance/DOC_LAYERS.md
---

# GO_INDEX — localcms

## Objet

Ce document référence les GO connus et utiles à la continuité locale de `localcms`.

## Entrées

### GO_LOCALCMS_UNIFORM_CONTINUITY_ALIGNMENT_01
- repo : localcms
- type : gouvernance locale / alignement consumer
- statut : active
- titre court : alignement localcms avec la méthode uniforme
- dernier état connu : socle consumer local posé ; campagne adopt 8/8 close sur `main` ; shared_explorer integration PASS ; point de reprise orienté vers campagne test complète
- lien utile : `docs/governance/REPO_ROLE.md`, `docs/governance/DOC_LAYERS.md`, `docs/index/REPRISE.md`, `docs/go/CLOSEOUT_MACHINES_CONFIG_ADOPT_01.txt`, `docs/go/CLOSEOUT_SHARED_EXPLORER_INTEGRATION_01.txt`

### GO_LOCALCMS_CONFIG_ADOPT_CAMPAIGN_01
- repo : localcms
- type : campagne tests adopt DATA-ONLY
- statut : pass — 8/8 COMPLETE
- titre court : campagne adopt config 8/8 — tous modules declaratifs couverts
- dernier état connu : env-global/sec-config/data-sources/queue-config/devtools-config/apps-config/ia-config/machines-config — tous PASS sur `main@997469c`
- lien utile : `docs/go/CLOSEOUT_MACHINES_CONFIG_ADOPT_01.txt`, `tests/machines-config-adopt.test.js`

### GO_LOCALCMS_SHARED_EXPLORER_INTEGRATION_01
- repo : localcms
- type : tests d'intégration backend
- statut : pass — 23/23
- titre court : tests d'intégration shared_explorer — 4 routes couvertes
- dernier état connu : list/read/download/search couverts, path traversal + noms bloqués + taille validés, sur `main@a88d965`
- lien utile : `docs/go/CLOSEOUT_SHARED_EXPLORER_INTEGRATION_01.txt`, `tests/integration_test_shared_explorer.py`

### GO_LOCALCMS_CONTINUITY_INDEX_REALIGN_01
- repo : localcms
- type : gouvernance / réalignement index
- statut : pass
- titre court : réalignement index continuité post-campagnes adopt + intégration
- dernier état connu : REPRISE / ACTIVE_STREAMS / GO_INDEX / NEXT_GO_CANDIDATES mis à jour sur `main@a88d965`
- lien utile : `docs/index/REPRISE.md`, `docs/index/ACTIVE_STREAMS.md`, `docs/next/NEXT_GO_CANDIDATES.md`

### GO_LOCALCMS_MEMORY_BRICKS_CONSUMER_PILOT_01
- repo : localcms
- type : chantier pilote consumer
- statut : pass
- titre court : pilote consumer `memory_bricks` local
- dernier état connu : closeout PASS posé sans faire de `localcms` la source maîtresse de `memory_bricks`
- lien utile : `docs/chantiers/GO_LOCALCMS_MEMORY_BRICKS_CONSUMER_PILOT_01/90_closeout.md`, `docs/governance/REPO_ROLE.md`
