# 05_CHECKLIST — LocalCMS db-layer Claude CLI

## Pré-check

- [ ] `db-layer` accessible en SSH
- [ ] `git` installé
- [ ] `tmux` installé
- [ ] Claude CLI installé ou installable
- [ ] Accès GitHub validé
- [ ] URL repo LocalCMS connue
- [ ] Branche source connue
- [ ] Travail source non commité traité

## Clone

- [ ] `/opt/localcms` préparé
- [ ] Repo cloné
- [ ] Remote vérifié
- [ ] Branches listées
- [ ] HEAD noté

## Branche

- [ ] Branche dédiée créée
- [ ] Docs chantier créés
- [ ] BRANCH_STATE rempli
- [ ] Indexation ou GAP_INDEXATION notée

## Claude CLI

- [ ] `tmux` lancé
- [ ] `claude` lancé dans `/opt/localcms`
- [ ] Prompt GO collé
- [ ] Claude a commencé par état Git réel
- [ ] Claude a identifié les fichiers ciblés avant patch

## Validation

- [ ] Smoke baseline exécuté
- [ ] Tests disponibles exécutés
- [ ] Diff stat produit
- [ ] Closeout rempli
- [ ] Reprise documentée

## Critère PASS

PASS seulement si :

- repo cloné proprement sur `db-layer`
- branche dédiée active
- Claude CLI fonctionnel
- état Git documenté
- au moins un smoke baseline exécuté ou absence de smoke explicitement justifiée
- point de reprise écrit
