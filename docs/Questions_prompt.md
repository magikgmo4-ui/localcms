# Questions Prompt — Workflow

## Avant de commencer
Toujours évaluer puis proposer les rôles ou postures pertinents avant de démarrer.

Format recommandé :
- rôle principal
- garde-fou
- validation si nécessaire
- recommandation par défaut

Exemples fréquents :
- Gardien canonique
- Architecte workflow
- Implémenteur
- Validateur
- Auditeur risques/gates
- Intégrateur read-only
- Prompt engineer

## Barrière d’écriture persistante
Avant toute écriture durable, vérifier :

### Q1 — Où ?
Où cette information doit-elle vivre ?
Exemples : note temporaire, journal, établi/closeout, mémoire durable, repo Git, ou nulle part.

### Q2 — Sous quel nom canonique ?
Quel nom unique doit être retenu ?
Exemples : titre de session, trigger GO_XXXX, nom de fichier, nom de module.

### Q3 — Avec quel statut ?
Quel est le niveau de confiance ou de maturité ?
Exemples : hypothèse, en cours, validé, close, archive, point de reprise.

### Q4 — À quel niveau d’écriture ?
Quel niveau de persistance est justifié maintenant ?
Règle : si c’est flou, on descend d’un niveau. En cas de doute, ne pas écrire durablement.

## Pourquoi cette méthode
Elle évite surtout :
- écrire trop tôt un état provisoire
- mélanger local, remote, stash, sandbox et canonique
- figer un prochain pas encore flou
- créer plusieurs noms pour la même chose
- polluer la mémoire durable avec du temporaire

## Filtres utiles
### Filtre A — Collision
Est-ce que cette information existe déjà sous un autre nom ?

### Filtre B — Horizon
Est-ce durable, ou seulement utile pour cette session ?

## Utiliser la technique de Feynman
Quand une idée, un workflow, une règle ou un chantier doit être clarifié, utiliser la technique de Feynman.

Principe : expliquer la chose simplement, avec ses propres mots, sans jargon inutile.

But : détecter les zones floues, les faux raccourcis, les dépendances cachées et les mots qui donnent une illusion de compréhension.

Applications utiles :
- expliquer un workflow
- justifier une décision d’architecture
- résumer un module
- reformuler un trigger
- valider qu’un concept est réellement compris

Questions Feynman utiles :
- Est-ce que je peux l’expliquer simplement ?
- Est-ce que je peux le reformuler sans jargon ?
- Où est le trou réel dans ma compréhension ?
- Quelle phrase est trop vague pour être vraiment utile ?

Règle pratique : si une idée ne peut pas être expliquée simplement, elle n’est pas encore assez claire pour être figée comme règle durable.

## Version ultra courte
Avant d’écrire durablement :
1. Où ?
2. Sous quel nom ?
3. Avec quel statut ?
4. À quel niveau d’écriture ?

Avant de commencer un chantier :
1. Quels rôles sont pertinents ?
2. Quel rôle principal recommander ?
3. Peut-on expliquer le sujet simplement avec Feynman ?

## Règle de sécurité
Si la cible, le nom, le statut ou le niveau d’écriture sont flous :
- ne pas figer en mémoire durable
- ne pas déclarer canonique trop tôt
- préférer journal, note temporaire ou clarification

## Doctrine retenue
Écrire moins, mais écrire mieux.
Clarifier avant de figer.
Nommer avant de mémoriser.
Expliquer simplement avant de déclarer compris.
