#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "ERR line=$LINENO cmd=$BASH_COMMAND" >&2' ERR

echo "== MACHINE =="
hostname
whoami
pwd

echo "== TOOLS =="
git --version
tmux -V || sudo apt-get update && sudo apt-get install -y tmux

if command -v claude >/dev/null 2>&1; then
  claude --version
else
  echo "Claude CLI absent — installation."
  curl -fsSL https://claude.ai/install.sh | bash
  export PATH="$HOME/.local/bin:$PATH"
  claude --version
fi

echo "== GITHUB SSH =="
ssh -T git@github.com || true

echo "DONE"
