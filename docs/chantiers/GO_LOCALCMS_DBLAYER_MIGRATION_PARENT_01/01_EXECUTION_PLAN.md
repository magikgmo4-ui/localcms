# 01_EXECUTION_PLAN — LocalCMS sur db-layer

## Phase A — Vérification source

Objectif : savoir quel repo/branche/commit Claude utilise actuellement.

Commandes :

```bash
cd /chemin/vers/localcms

pwd
git status --short --branch
git remote -v
git branch -vv
git log --oneline -5
```

Résultat attendu :

- URL GitHub connue
- Branche connue
- Commit HEAD connu
- Travail non commité identifié
- Décision : push, stash, commit, ou abandon explicite des fichiers locaux

## Phase B — Préparation db-layer

Objectif : valider que `db-layer` est prêt.

Commandes :

```bash
ssh db-layer
hostname
whoami
pwd
git --version
tmux -V
```

Installer Claude CLI si absent :

```bash
curl -fsSL https://claude.ai/install.sh | bash
claude --version
```

## Phase C — Accès GitHub

Objectif : vérifier que `db-layer` peut cloner le repo.

```bash
ssh -T git@github.com
```

Résultat acceptable :

- message GitHub d'authentification réussie
- ou accès HTTPS/token configuré

## Phase D — Clone repo

```bash
sudo mkdir -p /opt/localcms
sudo chown -R "$USER:$USER" /opt/localcms

git clone git@github.com:<OWNER>/<LOCALCMS_REPO>.git /opt/localcms
cd /opt/localcms
git status --short --branch
git remote -v
git branch -vv
```

## Phase E — Branche dédiée

```bash
cd /opt/localcms
git fetch origin
git checkout -b go/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01
mkdir -p docs/chantiers/GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01
```

## Phase F — Session Claude cowork-like

```bash
tmux new -s claude-localcms
cd /opt/localcms
claude
```

Coller ensuite le prompt :

`prompts/GO_PROMPT_CLAUDE_CODE_DBLAYER_LOCALCMS.txt`

## Phase G — Baseline smoke

Claude doit détecter la stack et proposer les tests. Commandes possibles selon repo :

```bash
ls
find . -maxdepth 2 -type f \( -name "package.json" -o -name "pyproject.toml" -o -name "requirements.txt" -o -name "pytest.ini" -o -name "vite.config.*" \)
```

Puis selon détection :

```bash
npm test
npm run build
pytest
python -m pytest
```

## Phase H — Closeout

Remplir :

- `03_BRANCH_STATE.md`
- `04_CLOSEOUT_TEMPLATE.md`
- `SESSION_REPRISE.txt`
