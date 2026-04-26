# 02_COMMANDS_DBLAYER — commandes exécutables

## 0. Connexion

```bash
ssh db-layer
```

## 1. Session tmux

```bash
tmux new -s claude-localcms
```

Reconnexion :

```bash
tmux attach -t claude-localcms
```

Lister :

```bash
tmux ls
```

## 2. Vérification outils

```bash
set -Eeuo pipefail
trap 'echo "ERR line=$LINENO cmd=$BASH_COMMAND" >&2' ERR

hostname
whoami
pwd
git --version
tmux -V
claude --version || true
```

## 3. Installation Claude CLI

```bash
set -Eeuo pipefail
trap 'echo "ERR line=$LINENO cmd=$BASH_COMMAND" >&2' ERR

curl -fsSL https://claude.ai/install.sh | bash

export PATH="$HOME/.local/bin:$PATH"
claude --version
```

## 4. Préparation `/opt/localcms`

```bash
set -Eeuo pipefail
trap 'echo "ERR line=$LINENO cmd=$BASH_COMMAND" >&2' ERR

sudo mkdir -p /opt/localcms
sudo chown -R "$USER:$USER" /opt/localcms
ls -ld /opt/localcms
```

## 5. Clone

Remplacer `<OWNER>/<LOCALCMS_REPO>`.

```bash
set -Eeuo pipefail
trap 'echo "ERR line=$LINENO cmd=$BASH_COMMAND" >&2' ERR

rm -rf /opt/localcms
git clone git@github.com:<OWNER>/<LOCALCMS_REPO>.git /opt/localcms

cd /opt/localcms
git status --short --branch
git remote -v
git branch -vv
git log --oneline -5
```

## 6. Branche dédiée

```bash
set -Eeuo pipefail
trap 'echo "ERR line=$LINENO cmd=$BASH_COMMAND" >&2' ERR

cd /opt/localcms

git fetch origin
git status --short --branch

git checkout -b go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01

mkdir -p docs/chantiers/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01

git status --short --branch
```

## 7. Lancement Claude

```bash
cd /opt/localcms
claude
```
