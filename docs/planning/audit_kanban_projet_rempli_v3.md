# Audit documentaire + Kanban opérationnel prérempli

Base utilisée : `archive.tgz` + `journal.md` fournis par l’utilisateur.

Règle de lecture : **ÉTABLI** = validé clairement par les documents ; **À CONFIRMER** = probable mais non assez solide ; **TODO** = travail non fait / non validé ; **BLOQUÉ** = dépendance ou information manquante.

## BLOC 1 — INVENTAIRE DOCUMENTAIRE

| ID | Nom / titre | Type | Rôle supposé | Fiabilité | Utilité |
|---|---|---|---|---|---|
| D01 | journal.md | journal | Journal opérationnel des sessions et validations | Fort | Critique |
| D02 | doc-workflow/workflow-claude.txt | workflow | Workflow canonique actif de coordination | Fort | Critique |
| D03 | ops-workflow/claude/OPT_TRADING_CONTINUITE_PACK_V3/* | pack continuité | Pack canonique de reprise rapide | Fort | Critique |
| D04 | ops-workflow/chatgpt/workflow-ops-todo/2026-03-09_localcms_etabli.txt | établi de session | Décisions validées LocalCMS / P0 | Fort | Critique |
| D05 | ops-workflow/chatgpt/workflow-ops-todo/2026-03-09_localcms_todo.txt | todo de session | Suite logique LocalCMS / P0 -> M-1.1 | Fort | Critique |
| D06 | doc-workflow/validated_prompt_factory_spec_v1.txt | spec module | Spécification du module validated_prompt_factory | Fort | Critique |
| D07 | doc-workflow/synthese_validee_officielle_validated_prompt_factory_v1.txt | synthèse validée | Base de prompt factory approuvée | Fort | Élevée |
| D08 | doc-workflow/session_cloture_student_duo_2026-03-08.txt | clôture de session | Référence Student Duo / Ollama / learning-only | Fort | Élevée |
| D09 | doc-workflow/session_cloture_student_mathematique.txt | clôture de session | Référence labo mathématique / paramétrique | Fort | Élevée |
| D10 | doc-workflow/deskpro_coinglass_tradingview_plan_2026-03-03.txt | plan opératoire | Plan Desk Pro + Coinglass + TradingView | Fort | Élevée |
| D11 | doc-workflow/INFOS_UTILES_RECURRENTES.txt | notes récurrentes | Canaux, chemins, reprises, contextuals_shell | Moyen | Élevée |
| D12 | ops-workflow/claude/workflow-claude.txt | workflow | Autre copie du workflow canonique | Moyen | Moyenne |
| D13 | ops-workflow/chatgpt/desk-pro_architecture-complete/* | architecture cible | Vision AI Trading Desk / modules / roadmap | Moyen | Élevée |
| D14 | Trading/anciens/* | archives métier | Archives trading / Desk Pro / TRAE / rapports anciens | Moyen | Moyenne |
| D15 | Quick Share/Screenshot_20250820-135000_BlockDAG X1.jpg | capture isolée | Élément annexe non structurant | Faible | Faible |
| D16 | menu_audit_admin-trading_20260303_181724.log | log d’audit | Preuve ponctuelle d’environnement | Fort | Faible |
| D17 | shortcut_targets_admin-trading_20260303_182130.log | log d’audit | Preuve ponctuelle de shortcuts | Fort | Faible |
| D18 | plan_modulaire_explorateur_shared_installateur_cms.docx | note de cadrage | Plan modulaire CMS /shared : explorateur d’abord, installateur ensuite | Fort | Élevée |

## BLOC 2 — SYNTHÈSE CANONIQUE DU PROJET

**Objectif global** : Construire un desk local multi-machines orienté trading, analyse, workflow et observabilité, avec continuité stricte, Git comme canal principal, et un cockpit local modulaire (LocalCMS / Desk Pro) connecté à un socle opérationnel réel dans opt-trading.

### Sous-projets / chantiers
- Opt-Trading / AI Trading Desk : noyau opérationnel et modules réels
- Desk Pro : surfaces UI, dashboard, formulaires, intégration Coinglass / TradingView
- Registry / readers / UI registry : couche de vérité structurée
- Workflow / continuité : pack V3, workflow-claude, TODO/GO, journalisation
- Validated Prompt Factory : module de génération de prompts à partir d’une base validée
- Student Lab / Student Duo : laboratoire IA local learning-only sur machine student
- LocalCMS : cockpit local modulaire guidé par contrats, avec P0 de compatibilité avant le core
- Shared Explorer / CMS Module Installer : axe LocalCMS /shared à cadrer en deux briques, d’abord exploration, ensuite installation
- Contextuals shell : découverte d’actions modules via contextuels

### Architecture / structure générale
- admin-trading : Debian 12 headless, bots, webhook, perf, exécution, orchestration, possède /shared
- student : Debian 12 headless, IA locale, Student Lab, prompts système, examinateur
- cursor-ai : Windows 11, développement, Trae/Cursor, Git, orchestration humaine
- db-layer : MSI Ubuntu, UI, analytics, stockage, surfaces Desk Pro, Coinglass minimum BTC + XAU

### Workflow de travail identifié
- Toujours partir de la demande courante + contexte projet + fichiers de continuité + état réel connu + règles workflow
- Priorité de vérité : état réel de session > workflow validé > état réel repo/fichiers > journal/docs versionnés > roadmap/specs > mémoire > hypothèses
- Git prioritaire ; zip secondaire pour transfert ciblé
- Patch minimal, mission bornée, validation explicite, commit isolé
- GO_XXXX comme déclencheurs de reprise ; journalisation seulement si changement réel

### Décisions déjà validées
- workflow-claude.txt est la source de vérité active canonique V100
- Le pack de continuité V3 est la base de reprise projet
- module_contextuals_shell V1 est validé runtime Linux sur admin-trading
- Student Duo V1 est validé en direction : learning-only, Researcher/Critic/Examiner/Journal/Mémoire
- Validated Prompt Factory est cadré comme premier module officiel dérivé du Prompt Socle Workflow V2
- LocalCMS doit traiter la compatibilité comme invariant et passer par P0 avant M-1.1 ($FORMS)
- Pour l’axe CMS /shared, fixer d’abord un module explorateur de fichiers, puis un module d’installation de modules standardisés, sans retirer la roadmap existante
- GO_NAPKIN reste bloqué jusqu’à stabilisation complète du registry

### Contraintes importantes
- Ne rien inventer ni lisser artificiellement les contradictions
- Ne pas casser l’existant ; éviter les régressions
- Pas de hardcodes locaux ni logique mono-OS dans le socle
- Distinguer clairement ÉTABLI / À CONFIRMER / TODO / BLOQUÉ
- Ne pas confondre vision cible documentaire et état réel du repo

### Dépendances techniques / organisationnelles
- Document P0 Compatibility Contract effectif pour lancer M-1.1
- Accès à l’état réel du repo pour confirmer 'EXISTE / PARTIEL / CIBLE'
- Accès machine student pour industrialiser Student Lab V1
- Stabilisation registry avant toute reprise Napkin

**Point de reprise le plus logique** : Point de reprise le plus logique : repartir du pack de continuité V3, récupérer/valider le document P0 de LocalCMS, puis seulement lancer M-1.1 ($FORMS). En parallèle, aligner la documentation haut niveau avec l’état réel du repo.

## BLOC 3.1 — ÉTABLI

| ID | Élément | Description courte | Source(s) | Impact | Priorité | Dépendances éventuelles |
|---|---|---|---|---|---|---|
| E01 | Workflow canonique V100 actif | workflow-claude.txt est déclaré source de vérité active, version canonique retenue V100. | D02 | Structurant | P1 | Aucune |
| E02 | Pack de continuité V3 | Le pack V3 regroupe workflow socle, project state, roadmap sticky, TODO/GO, transit, map repo/cible. | D03 | Structurant | P1 | Aucune |
| E03 | Architecture 4 machines | admin-trading, student, cursor-ai, db-layer sont explicitement définies avec rôles. | D03 | Structurant | P1 | Aucune |
| E04 | Git prioritaire / zip secondaire | La stabilisation durable passe par Git ; le zip est secondaire pour transfert/reprise. | D02 + D03 | Élevé | P1 | Aucune |
| E05 | module_contextuals_shell V1 validé | Sanity/cmd/menu validés ; logique contextuelle retenue sur admin-trading. | D11 | Élevé | P2 | Aucune |
| E06 | Student Duo V1 learning-only | Cycle d’apprentissage, rôles et doctrine learning-only sont validés. | D08 | Élevé | P1 | Reprise réelle sur machine student |
| E07 | Validated Prompt Factory cadré | Module officiel dérivé du Prompt Socle Workflow V2 avec préconditions et classifications. | D06 + D07 | Élevé | P1 | Implémentation réelle à faire |
| E08 | LocalCMS : P0 avant P1 | La phase P0 Compatibility Contract est obligatoire avant M-1.1 ($FORMS). | D04 + D05 | Très élevé | P1 | Document P0 effectif |
| E09 | Desk Pro comme chantier durable | Desk Pro et ses surfaces sont un axe durable du projet. | D10 + D13 | Élevé | P1 | Aucune |
| E10 | GO_NAPKIN bloqué | Napkin ne doit pas être repris avant stabilisation complète du registry. | D03 | Moyen | P2 | Registry stable |

## BLOC 3.2 — À CONFIRMER

| ID | Élément | Description courte | Source(s) | Impact | Priorité | Dépendances éventuelles |
|---|---|---|---|---|---|---|
| C01 | Document P0 effectivement livré | D04 mentionne des livrables de session, mais le document P0 lui-même n’est pas dans l’archive fournie. | D04 + D05 | Très élevé | P1 | Accès au fichier réel |
| C02 | Workflow V100 vs autres copies | Plusieurs copies du workflow existent ; il faut confirmer laquelle reste la seule canonique en pratique. | D02 + D12 | Élevé | P1 | Arbitrage documentaire |
| C03 | État réel précis du repo | Le pack V3 décrit beaucoup de modules comme EXISTE ; le repo réel n’est pas fourni ici pour vérification directe. | D03 | Très élevé | P1 | Accès repo |
| C04 | Présence réelle des artefacts annoncés dans le journal | Le journal mentionne divers fichiers/présentations/prompts qu’il faut localiser ou reclasser comme non livrés. | D01 | Élevé | P1 | Audit de présence |
| C05 | Chemin canonique unique du shared | D11 mentionne à la fois /shared et /srv/sftp/shared_files/shared ; le statut exact doit être clarifié. | D11 | Élevé | P2 | Clarification ops |
| C06 | Périmètre exact LocalCMS vs opt-trading | Le workflow les relie, mais l’interface produit/socle mérite un document de périmètre explicite. | D02 + D04 | Élevé | P1 | Clarification produit |
| C07 | Industrialisation effective Student Lab V1 | La direction est validée, mais l’industrialisation réelle reste à confirmer sur machine student. | D08 + D03 | Élevé | P1 | Accès machine student |

## BLOC 3.3 — TODO

| ID | Élément | Description courte | Source(s) | Impact | Priorité | Dépendances éventuelles |
|---|---|---|---|---|---|---|
| T01 | Récupérer et valider P0 Compatibility Contract | Retrouver le document P0 réel puis le valider selon les 4 critères définis. | D05 | Très élevé | P1 | Accès au livrable P0 |
| T02 | Produire la mission bornée M-1.1 $FORMS | Seulement après validation de P0, cadrer puis implémenter le moteur de champs unifié. | D05 | Très élevé | P1 | T01 |
| T03 | Revue critique de M-1.1 avant commit | Vérifier cohérence avec P0, impact minimal, absence de régression et dette technique. | D05 | Élevé | P1 | T02 |
| T04 | Implémenter validated_prompt_factory | Créer le module durable avec scripts standards et sorties texte ciblées. | D06 + D07 | Élevé | P1 | Base validée + repo |
| T05 | Tester validated_prompt_factory sur cas réels | Au moins un cas registry et un cas module/bundle. | D06 + D07 + D01 | Élevé | P1 | T04 |
| T06 | Industrialiser Student Lab V1 | Créer arborescence, prompts système, orchestrator, examiner, mémoire simple, menu/cmd/sanity. | D08 + D03 | Élevé | P1 | Accès machine student |
| T07 | Continuer Desk Pro par incréments sûrs | Faire avancer surfaces et alimentation sans refactor global. | D10 + D13 | Élevé | P1 | Validation ciblée |
| T08 | Aligner documentation cible et repo réel | Maintenir une cartographie propre EXISTE / PARTIEL / CIBLE. | D03 | Élevé | P1 | Accès repo |
| T09 | Unifier chemins et conventions de transfert | Documenter clairement chemin logique vs chemin physique du shared. | D11 | Moyen | P2 | Clarification ops |
| T10 | Poursuivre la découverte modules via contextuels | Étape logique après validation de contextuals_shell V1. | D11 | Moyen | P2 | E05 |
| T11 | Cadrer Shared Explorer V1 | Définir le premier module CMS pour /shared : arborescence, ouverture, métadonnées, bornes et architecture. | D18 | Élevé | P1 | Aucune |
| T12 | Cadrer CMS Module Installer V1 | Définir le second module CMS pour bundles standardisés depuis /shared, après Shared Explorer. | D18 | Élevé | P1 | T11 |

## BLOC 3.4 — BLOQUÉ

| ID | Élément | Description courte | Source(s) | Impact | Priorité | Dépendances éventuelles |
|---|---|---|---|---|---|---|
| B01 | M-1.1 $FORMS | Ne doit pas démarrer avant validation de P0. | D04 + D05 | Très élevé | P1 | T01 |
| B02 | GO_NAPKIN | Bloqué jusqu’à stabilisation complète du registry. | D03 | Moyen | P2 | Registry stable |
| B03 | Audit fin repo réel | Impossible à clôturer proprement sans arborescence / état réel du repo. | D03 | Élevé | P1 | Accès repo |
| B04 | Industrialisation Student Lab V1 | Bloqué tant qu’aucune reprise concrète n’a lieu sur la machine student. | D08 + D03 | Moyen | P2 | Accès machine student |
| B05 | Validation de certains artefacts annoncés | Bloqué tant que les fichiers annoncés dans le journal ne sont pas localisés. | D01 | Élevé | P1 | Audit de présence |

## BLOC 4 — CONTRADICTIONS, TROUS, RISQUES

| ID | Problème | Type | Description courte | Source(s) | Impact | Action recommandée |
|---|---|---|---|---|---|---|
| R01 | Écart entre vision cible et état réel | contradiction | Les docs haut niveau AI Trading Desk décrivent une cible cohérente, mais le pack V3 dit que le repo réel est plus large et pas parfaitement reflété par ces docs. | D03 + D13 + D14 | Très élevé | Produire une cartographie repo réel -> doc cible et arrêter de supposer. |
| R02 | Ancien réflexe '$FORMS maintenant' vs nouveau gate P0 | contradiction | Les sources récentes imposent P0 avant M-1.1 ; tout plan antérieur contraire doit être reclassé. | D04 + D05 | Très élevé | Considérer P0 comme gate obligatoire et invalider les plans précédents si besoin. |
| R03 | Chemins /shared vs /srv/sftp/shared_files/shared | contradiction | Le canal Linux est nommé de deux manières dans D11, ce qui crée une ambiguïté opératoire. | D11 | Élevé | Documenter un chemin logique et un chemin physique, puis normaliser. |
| R04 | Multiplicité de copies workflow | risque | Plusieurs copies du workflow existent dans l’archive ; risque d’utiliser une version non canonique. | D02 + D12 | Élevé | Désigner un seul workflow canonique et classer les autres comme copies/archives. |
| R05 | Artefacts annoncés mais non localisés | manque | Le journal et certains fichiers mentionnent des livrables qui ne figurent pas clairement dans le corpus reçu. | D01 + D04 | Élevé | Faire un audit de présence et reclasser comme non livré ce qui n’est pas retrouvable. |
| R06 | LocalCMS vs opt-trading : frontière produit/socle floue | manque | Le cockpit local et la source de vérité opérationnelle sont distingués, mais leur interface mérite une note claire. | D02 + D04 | Élevé | Rédiger une note canonique de périmètre et d’interface. |
| R07 | Archives anciennes mélangées au socle actif | obsolète | Le dossier Trading/anciens contient beaucoup d’archives pouvant polluer la lecture des priorités. | D14 | Moyen | Séparer clairement archives métier et source de vérité projet. |

## BLOC 5 — TABLEAU KANBAN FINAL

| Backlog | À clarifier | Prêt | En cours | Bloqué | Terminé |
|---|---|---|---|---|---|
| K03 — Lancer M-1.1 $FORMS | K01 — Récupérer le document P0 réel | K04 — Implémenter validated_prompt_factory | K07 — Auditer les artefacts annoncés | K13 — Reprendre Napkin après stabilisation registry | K14 — Valider backbone exécution paper |
| K05 — Tester validated_prompt_factory sur 2 cas | K02 — Valider P0 selon 4 critères | K08 — Industrialiser Student Lab V1 | K10 — Aligner doc cible et repo réel |  | K15 — Conserver le pack V3 comme entrée de session |
| K12 — Étendre la découverte via contextuels | K06 — Figer le workflow canonique unique | K09 — Continuer Desk Pro par incréments sûrs | K11 — Unifier chemins shared/transfert |  | K16 — Conserver contextuals_shell V1 comme acquis |
| K18 — Cadrer CMS Module Installer V1 |  | K17 — Cadrer Shared Explorer V1 |  |  |  |

| ID | Titre | Description actionnable | Catégorie | Priorité | Effort estimé | Dépendances | Source documentaire | Définition de terminé | Colonne Kanban recommandée |
|---|---|---|---|---|---|---|---|---|---|
| K01 | Récupérer le document P0 réel | Retrouver le livrable P0 Compatibility Contract produit par Claude. | LocalCMS | P1 | S | Accès fichiers réels | D04 + D05 | Le document P0 est localisé et lisible. | À clarifier |
| K02 | Valider P0 selon 4 critères | Compatibilité comme invariant, module contract clair, séparation nette, pas de pseudo-roadmap floue. | LocalCMS | P1 | S | K01 | D05 | P0 est explicitement validé ou corrigé. | À clarifier |
| K03 | Lancer M-1.1 $FORMS | Produire la mission bornée puis l’implémentation du moteur de champs unifié. | LocalCMS | P1 | M | K02 | D05 | Mission cadrée et prête à exécuter. | Backlog |
| K04 | Implémenter validated_prompt_factory | Créer le module durable avec scripts standards et sorties texte utiles. | Workflow tooling | P1 | L | Synthèse validée + repo | D06 + D07 | Module présent avec sanity/cmd/menu et sorties ciblées. | Prêt |
| K05 | Tester validated_prompt_factory sur 2 cas | Cas registry + cas module/bundle. | Workflow tooling | P1 | M | K04 | D06 + D07 + D01 | Deux cas passent et produisent des prompts exploitables. | Backlog |
| K06 | Figer le workflow canonique unique | Arbitrer les copies et désigner la source active unique. | Workflow | P1 | S | Audit présence | D02 + D12 | Un seul workflow est marqué canonique actif. | À clarifier |
| K07 | Auditer les artefacts annoncés | Vérifier présence de V101, P0, prompts finaux, PDF/synthèses mentionnés. | Gouvernance documentaire | P1 | M | Accès fichiers réels | D01 | Tableau de présence complet et fiable. | En cours |
| K08 | Industrialiser Student Lab V1 | Créer arborescence, prompts, orchestrator, examiner, mémoire simple, scripts. | IA locale | P1 | L | Accès machine student | D08 + D03 | Flux minimal Researcher/Critic/Examiner fonctionne. | Prêt |
| K09 | Continuer Desk Pro par incréments sûrs | Avancer surfaces et alimentation sans casser l’existant. | Desk Pro | P1 | L | Validation ciblée | D10 + D13 | Un incrément utile est livré sans régression. | Prêt |
| K10 | Aligner doc cible et repo réel | Maintenir une carte EXISTE / PARTIEL / CIBLE basée sur le repo réel. | Documentation projet | P1 | M | Accès repo | D03 | Cartographie actualisée et vérifiée. | En cours |
| K11 | Unifier chemins shared/transfert | Définir chemin logique vs physique et mettre à jour la doc de transfert. | Ops / workflow | P2 | S | Audit présence | D11 | Convention unique documentée. | En cours |
| K12 | Étendre la découverte via contextuels | Faire découvrir les actions des modules via contextuels plutôt que menu codé en dur. | Shell / modules | P2 | M | E05 | D11 | Le menu lit automatiquement les contextuels compatibles. | Backlog |
| K13 | Reprendre Napkin après stabilisation registry | Aucune action avant GO explicite post-stabilisation. | Napkin | P2 | M | Registry stable | D03 | GO_NAPKIN levé explicitement. | Bloqué |
| K14 | Valider backbone exécution paper | Socle risk/engine/execution/position déjà validé ; maintenir comme base réelle. | Exécution | P1 | M | Aucune | D01 | Chaîne PAPER_TEST considérée comme base stable. | Terminé |
| K15 | Conserver le pack V3 comme entrée de session | L’utiliser comme base de reprise et ne le mettre à jour que sur changement réel. | Workflow | P1 | S | Aucune | D03 | Le pack est la base standard de reprise. | Terminé |
| K16 | Conserver contextuals_shell V1 comme acquis | Ne pas ouvrir le consommateur avant réel besoin d’intégration. | Shell / modules | P2 | S | Aucune | D11 | V1 reste stable et documentée. | Terminé |
| K17 | Cadrer Shared Explorer V1 | Définir le premier module CMS pour /shared : arborescence, ouverture, métadonnées, bornes et architecture backend/frontend, sans actions destructives. | LocalCMS / shared | P1 | S | Aucune | D18 | Le cadrage V1 est écrit, validé et prêt à servir de base d’implémentation. | Prêt |
| K18 | Cadrer CMS Module Installer V1 | Définir le second module CMS pour bundles standardisés depuis /shared : manifeste, precheck, install, log, rollback, sans shell libre. | LocalCMS / shared | P1 | S | K17 | D18 | Le cadrage V1 est écrit, validé et ordonné après Shared Explorer. | Backlog |

## BLOC 6 — PROCHAINE SÉQUENCE D’EXÉCUTION

| Ordre | Action | Quand | Note |
|---|---|---|---|
| 1 | Auditer la présence des artefacts annoncés | Immédiat | Peut être fait tout de suite à partir du stockage réel |
| 2 | Récupérer le document P0 réel | Immédiat | Bloquant principal pour LocalCMS |
| 3 | Valider ou corriger P0 selon les 4 critères | Après 2 | Gate avant tout travail core LocalCMS |
| 4 | Figer le workflow canonique unique | Immédiat | Réduit la confusion documentaire |
| 5 | Lancer M-1.1 $FORMS seulement après P0 | Après 3 | Ne pas anticiper |
| 6 | Implémenter validated_prompt_factory | Peut démarrer après cadrage final | Chantier durable et transversal |
| 7 | Tester validated_prompt_factory sur 2 cas réels | Après 6 | Valide l’utilité opérationnelle |
| 8 | Mettre à jour la cartographie repo réel -> cible | Dès que le repo est accessible | Évite les suppositions |
| 9 | Unifier les chemins shared / transferts | Immédiat | Évite les erreurs ops récurrentes |
| 10 | Reprendre Student Lab V1 sur machine student | Dépend machine | À lancer quand la reprise réelle est possible |
| 11 | Cadrer Shared Explorer V1 | Peut démarrer immédiatement en parallèle | Première brique CMS pour /shared, sans perturber les gates LocalCMS déjà en place |
| 12 | Cadrer CMS Module Installer V1 | Après 11 | Deuxième brique, basée sur le cadre Shared Explorer et les bundles /shared |

### Ce qui peut être fait immédiatement
- audit de présence des artefacts annoncés
- arbitrage de la version canonique unique du workflow
- préparation de la grille de validation P0
- mise à jour des chemins canoniques shared / transfert
- cadrage du module Shared Explorer V1

### Ce qui doit attendre une validation
- M-1.1 $FORMS
- toute suite core LocalCMS
- réouverture de Napkin
- industrialisation Student Lab V1 si la machine student n’est pas reprise

### Ce qui manque pour débloquer la suite
- le document P0 effectif
- l’état réel du repo (ou au moins une arborescence / liste modules)
- la présence réelle des artefacts annoncés
- une convention unique pour le shared et les chemins de transfert