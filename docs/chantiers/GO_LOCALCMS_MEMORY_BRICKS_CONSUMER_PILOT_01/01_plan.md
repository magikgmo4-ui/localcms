---
doc_id: GO_LOCALCMS_MEMORY_BRICKS_CONSUMER_PILOT_01_PLAN
doc_type: chantier_plan
repo: localcms
project: localcms
module: memory_bricks_consumer
go_id: GO_LOCALCMS_MEMORY_BRICKS_CONSUMER_PILOT_01
status: active
lifecycle_stage: plan
topic_keys:
  - localcms
  - memory_bricks
  - consumer
  - plan
surface: consumer
source_kind: canonical
updated_at: 2026-04-11
links:
  - docs/chantiers/GO_LOCALCMS_MEMORY_BRICKS_CONSUMER_PILOT_01/00_cadrage.md
---

# 01_plan — GO_LOCALCMS_MEMORY_BRICKS_CONSUMER_PILOT_01

## But du plan
- but : compléter un premier pilote canonique localcms dédié à la consommation de `memory_bricks`
- ordre d’exécution retenu : cadrage -> plan -> journal technique -> décisions -> closeout

## Étapes
1. poser le dossier chantier canonique complet
2. documenter le rôle consumer réellement visé dans `localcms`
3. stabiliser les décisions minimales de non-inversion de vérité
4. fermer le lot avec un closeout exploitable comme référence locale

## Zones de travail pressenties
- `docs/chantiers/GO_LOCALCMS_MEMORY_BRICKS_CONSUMER_PILOT_01/`
- `docs/index/GO_INDEX.md`
- `docs/index/ACTIVE_STREAMS.md`
- `docs/index/REPRISE.md`
- `docs/next/NEXT_GO_CANDIDATES.md`

## Validations prévues
- cohérence avec le rôle consumer de `localcms`
- cohérence avec le canon amont déjà posé dans `opt-trading` et `openclaw`
- utilité réelle comme modèle de reprise produit

## Risques
- risque : rester descriptif sans valeur pratique pour la continuité produit
- mitigation : garder le lot court, explicite et relié au rôle consumer réel

## Point d’arrêt acceptable
- arrêt acceptable si : le pilote produit déjà un cadrage, des décisions et un closeout suffisants pour servir de référence locale initiale
