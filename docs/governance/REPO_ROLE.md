---
doc_id: LOCALCMS_REPO_ROLE
doc_type: repo_role
repo: localcms
project: localcms
module:
go_id: GO_LOCALCMS_UNIFORM_CONTINUITY_ALIGNMENT_01
status: reference
lifecycle_stage: governance
topic_keys:
  - localcms
  - repo_role
  - governance
  - consumer
  - continuity
surface: consumer
source_kind: canonical
updated_at: 2026-04-11
links: []
---

# REPO_ROLE — localcms

## Objet

Ce document fixe le rôle réel de `localcms` dans la méthode uniforme de continuité.

Il sert à éviter :
- les confusions entre repo consumer et repo canonique d’exécution
- les doublons documentaires concurrents
- les dérives où la surface de consommation deviendrait la vérité maîtresse

---

## 1. Rôle principal

`localcms` est un **repo produit / consumer humain / continuité projet**.

Il est la référence dominante pour :
- la consommation projet des informations utiles à l’humain
- les reprises projet
- les next projet
- les closeouts projet
- l’intégration consumer de `memory_bricks`

---

## 2. Responsabilités dominantes

### 2.1 Consumer humain
`localcms` doit servir une lecture et une continuité adaptées à l’usage humain.

### 2.2 Continuité projet
`localcms` porte utilement :
- reprise locale projet
- next locaux
- closeouts projet
- trajectoires de développement côté produit

### 2.3 Consumer de `memory_bricks`
`localcms` peut consommer les formes compactes issues du canon, mais ne devient pas la source souveraine de la compaction.

---

## 3. Ce que `localcms` n’est pas

`localcms` n’est pas :
- le canon d’exécution runtime
- la source maîtresse de `memory_bricks`
- le repo maître de gouvernance transverse
- le sas documentaire final du système entier

---

## 4. Relations avec les autres repos

### 4.1 Relation avec `opt-trading`
`opt-trading` reste le canon d’exécution et la source dominante de `memory_bricks`.

### 4.2 Relation avec `openclaw`
`openclaw` reste le canon transverse de gouvernance, workflow, statuts et séquence GO.

### 4.3 Relation avec `llm_wiki_minimal`
`llm_wiki_minimal` reste une couche de pré-consolidation, pas une surface produit.

---

## 5. Règles locales

### 5.1 Consumer sans inversion de vérité
Une vue consumer ne remplace pas la source canonique amont.

### 5.2 Continuité projet utile
Les artefacts locaux doivent rendre la reprise projet plus rapide et plus lisible.

### 5.3 Alignement avec `memory_bricks`
L’intégration de `memory_bricks` doit rester compatible avec le schéma canonique déjà posé en amont.

---

## 6. Statut

Statut :
- document de référence locale
- à maintenir cohérent avec le canon posé dans `opt-trading` et `openclaw`
