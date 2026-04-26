#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "ERR line=$LINENO cmd=$BASH_COMMAND" >&2' ERR

TARGET="${1:-/opt/localcms}"
cd "$TARGET"

echo "== GIT =="
git status --short --branch
git log --oneline -5

echo "== STACK FILES =="
find . -maxdepth 3 -type f \( \
  -name "package.json" -o \
  -name "pnpm-lock.yaml" -o \
  -name "package-lock.json" -o \
  -name "yarn.lock" -o \
  -name "pyproject.toml" -o \
  -name "requirements.txt" -o \
  -name "pytest.ini" -o \
  -name "vite.config.*" -o \
  -name "next.config.*" \
\) | sort

echo "== TOP LEVEL =="
ls -la

echo "== PACKAGE SCRIPTS =="
if [[ -f package.json ]]; then
  node -e 'const p=require("./package.json"); console.log(JSON.stringify(p.scripts||{}, null, 2))'
fi

echo "== PYTHON TEST DISCOVERY =="
find . -maxdepth 3 -type f \( -name "test_*.py" -o -name "*_test.py" \) | sort || true

echo "DONE"
