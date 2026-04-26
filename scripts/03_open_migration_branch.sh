#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "ERR line=$LINENO cmd=$BASH_COMMAND" >&2' ERR

TARGET="${1:-/opt/localcms}"
BRANCH="${2:-go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01}"
GO_ID="GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01"

cd "$TARGET"

git fetch origin
git status --short --branch

if git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

mkdir -p "docs/chantiers/$GO_ID"

cat > "docs/chantiers/$GO_ID/03_BRANCH_STATE.md" <<EOF
# 03_BRANCH_STATE — $GO_ID

## État branche

| Champ | Valeur |
|---|---|
| Machine | $(hostname) |
| Repo path | $(pwd) |
| Remote | $(git remote get-url origin 2>/dev/null || echo "UNKNOWN") |
| Branche chantier | $BRANCH |
| HEAD initial | $(git rev-parse --short HEAD) |
| Date ouverture | $(date -Is) |
| Agent | Claude Code CLI |

## Commandes de preuve

\`\`\`bash
pwd
git status --short --branch
git remote -v
git branch -vv
git log --oneline -5
\`\`\`

## Résultat réel

\`\`\`text
$(git status --short --branch)
\`\`\`
EOF

git status --short --branch
