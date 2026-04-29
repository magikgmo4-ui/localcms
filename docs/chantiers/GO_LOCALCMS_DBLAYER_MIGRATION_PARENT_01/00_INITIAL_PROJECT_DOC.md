# 00_INITIAL_PROJECT_DOC — GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01

## 1_MASTER_TARGET

Migrer LocalCMS vers `db-layer` comme repo séparé, avec Claude Code CLI comme worker Ubuntu cowork-like.

## 2_INITIAL_PROJECT_DOC

Document initial transporteur du chantier. Il fixe le cadrage de départ :

- LocalCMS est un projet/repo séparé de `opt-trading`.
- `db-layer` devient la machine worker Ubuntu pour LocalCMS.
- Claude Desktop n'est pas requis.
- Claude Code CLI + `tmux` fournit le mode cowork-like réel.
- La migration doit être traçable via Git, branche dédiée, documentation chantier et tests/smokes.

## 3_INITIAL_NEED

L'utilisateur veut que Claude travaille sur LocalCMS, mais sur `db-layer`, dans un autre repo et un autre travail. Le besoin est de rendre ce travail autonome et reproductible sans dépendre du Desktop.

## 4_MASTER_PROJECT_PLAN

1. Vérifier l'état source LocalCMS actuel.
2. Installer ou valider Claude Code CLI sur `db-layer`.
3. Cloner LocalCMS proprement dans `/opt/localcms`.
4. Ouvrir une branche dédiée :
   `go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01`
5. Créer la documentation chantier.
6. Lancer Claude Code CLI dans une session `tmux`.
7. Laisser Claude auditer le repo, détecter la stack, proposer les smokes.
8. Exécuter uniquement des changements minimaux et validés.
9. Documenter l'état Git, les fichiers modifiés, les tests et le point de reprise.
10. Fermer par un closeout PASS/FAIL.

## 5_GO_PLAN

GO parent :

`GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01`

GO enfants possibles :

- `GO_LOCALCMS_DBLAYER_ENV_SETUP_01`
- `GO_LOCALCMS_DBLAYER_REPO_CLONE_01`
- `GO_LOCALCMS_DBLAYER_SMOKE_BASELINE_01`
- `GO_LOCALCMS_DBLAYER_CLAUDE_WORKER_BOOTSTRAP_01`
- `GO_LOCALCMS_DBLAYER_CLOSEOUT_01`

## 6_FINAL_TARGET

Livrable attendu :

- LocalCMS cloné sur `db-layer`
- Claude Code CLI fonctionnel
- Session `tmux` réutilisable
- Branche dédiée ouverte
- Documentation chantier présente
- État baseline validé par smokes
- Point de reprise stable

## 7_CANONICAL_STATE

État canonique initial :

- Machine : `db-layer`
- Chemin repo cible : `/opt/localcms`
- Agent : Claude Code CLI
- Persistance session : `tmux`
- Branche : `go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01`
- Docs : `docs/chantiers/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01/`

## 8_VALIDATED_PLAN

Plan validé pour démarrage :

- Ne pas mélanger `opt-trading` et LocalCMS.
- Ne pas copier un dossier sale sans Git.
- D'abord vérifier le repo source.
- Ensuite cloner proprement sur `db-layer`.
- Puis ouvrir branche dédiée.
- Puis seulement lancer Claude CLI pour l'audit et les actions.

## 9_SELECTED_SOLUTION

Solution retenue :

`Claude Code CLI + tmux + Git branch dédiée + docs/chantiers`.

## 10_SELECTED_SETUP

```text
db-layer
├── /opt/localcms
├── tmux session: claude-localcms
└── Claude Code CLI
```

## 11_KEY_DECISIONS

- Desktop non requis.
- Claude Web peut servir au raisonnement mais pas comme worker local principal.
- Claude Code CLI est l'agent exécuteur.
- Le repo LocalCMS reste séparé.
- Le travail se fait en branche dédiée.

## 12_INVARIANTS

- Pas de travail direct sur `main`.
- Pas de refactor global.
- Pas de mélange avec `opt-trading`.
- Pas de patch sans état Git avant/après.
- Pas de commit sans smoke réel ou justification documentée.
- Toute limite doit être notée dans le closeout.

## 13_ESTABLISHED

- Le modèle cowork-like terminal est suffisant :
  - `ssh db-layer`
  - `tmux`
  - `claude`
  - Git
  - tests/smokes
  - docs chantier

## 14_HYPOTHESIS

À valider :

- Le repo LocalCMS GitHub est accessible depuis `db-layer`.
- Les clés SSH GitHub sont configurées.
- Claude CLI peut s'authentifier sur `db-layer`.
- La stack LocalCMS est exécutable sur Ubuntu.
- Les tests/smokes existent ou doivent être ajoutés.

## 15_REMAINING_GAP

- URL exacte du repo LocalCMS.
- Branche source exacte actuellement utilisée.
- État du travail non commité sur la machine source.
- Stack runtime exacte : Node, Python, FastAPI, autre.
- Commandes de test réelles du repo.

## 16_TODO

1. Vérifier source LocalCMS.
2. Installer Claude CLI sur `db-layer`.
3. Cloner le repo.
4. Ouvrir branche dédiée.
5. Créer docs chantier.
6. Lancer Claude CLI dans `tmux`.
7. Exécuter audit baseline.
8. Documenter closeout.

## 17_RESUME_POINT

Reprendre depuis :

```bash
ssh db-layer
tmux attach -t claude-localcms || tmux new -s claude-localcms
cd /opt/localcms
git status --short --branch
```
