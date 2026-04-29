#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "ERR line=$LINENO cmd=$BASH_COMMAND" >&2' ERR

REPO_URL="${1:-}"
TARGET="${2:-/opt/localcms}"

if [[ -z "$REPO_URL" ]]; then
  echo "Usage: $0 git@github.com:OWNER/LOCALCMS_REPO.git [/opt/localcms]" >&2
  exit 2
fi

if [[ -e "$TARGET/.git" ]]; then
  echo "Repo déjà présent : $TARGET"
else
  sudo mkdir -p "$(dirname "$TARGET")"
  sudo chown -R "$USER:$USER" "$(dirname "$TARGET")"
  git clone "$REPO_URL" "$TARGET"
fi

cd "$TARGET"

pwd
git status --short --branch
git remote -v
git branch -vv
git log --oneline -5
