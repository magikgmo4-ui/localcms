# Bundle IDE — LocalCMS → db-layer avec Claude Code CLI

## 1_MASTER_TARGET

Migrer le travail LocalCMS vers `db-layer` comme repo séparé, avec Claude Code CLI en mode worker/cowork-like via terminal + `tmux`.

## 3_INITIAL_NEED

Claude travaille déjà sur LocalCMS ailleurs. L'objectif est de déplacer ou reproduire le contexte de travail sur `db-layer`, sans dépendre de Claude Desktop, tout en gardant une continuité Git/documentation propre.

## 7_CANONICAL_STATE

- Machine cible : `db-layer`
- Repo cible : `/opt/localcms`
- Agent : Claude Code CLI
- Mode de travail : `tmux` + Git + docs chantier
- Chantier parent : `GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01`
- LocalCMS reste séparé de `opt-trading`
- Aucun travail direct sur `main` ou branche canonique
- Toute modification passe par état Git réel, branche dédiée, diff, test/smoke, closeout

## Structure du bundle

```text
localcms_dblayer_claude_ide_bundle/
├── README.md
├── localcms-dblayer.code-workspace
├── docs/chantiers/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01/
│   ├── 00_INITIAL_PROJECT_DOC.md
│   ├── 01_EXECUTION_PLAN.md
│   ├── 02_COMMANDS_DBLAYER.md
│   ├── 03_BRANCH_STATE.md
│   ├── 04_CLOSEOUT_TEMPLATE.md
│   ├── 05_CHECKLIST.md
│   └── SESSION_REPRISE.txt
├── prompts/
│   └── GO_PROMPT_CLAUDE_CODE_DBLAYER_LOCALCMS.txt
└── scripts/
    ├── 00_verify_source_localcms.sh
    ├── 01_setup_dblayer_claude_cli.sh
    ├── 02_clone_localcms_on_dblayer.sh
    ├── 03_open_migration_branch.sh
    └── 04_smoke_localcms_discovery.sh
```

## Ordre d'utilisation

1. Lire `docs/chantiers/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01/00_INITIAL_PROJECT_DOC.md`
2. Exécuter les scripts dans l'ordre, après avoir remplacé les placeholders GitHub.
3. Lancer `tmux new -s claude-localcms`
4. Aller dans `/opt/localcms`
5. Coller le prompt `prompts/GO_PROMPT_CLAUDE_CODE_DBLAYER_LOCALCMS.txt` dans Claude Code CLI.
6. Documenter le résultat dans `03_BRANCH_STATE.md` puis `04_CLOSEOUT_TEMPLATE.md`.
