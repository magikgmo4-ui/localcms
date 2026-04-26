#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "ERR line=$LINENO cmd=$BASH_COMMAND" >&2' ERR

LOCALCMS_SOURCE_PATH="${1:-}"

if [[ -z "$LOCALCMS_SOURCE_PATH" ]]; then
  echo "Usage: $0 /chemin/vers/localcms-source" >&2
  exit 2
fi

cd "$LOCALCMS_SOURCE_PATH"

echo "== SOURCE LOCALCMS =="
pwd
git status --short --branch
git remote -v
git branch -vv
git log --oneline -5
