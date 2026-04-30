#!/usr/bin/env bash
# scripts/run-ci-local.sh — LocalCMS CI Runner local
# Exécute toutes les validations stables sans runtime externe préexistant.
#
# Usage :
#   bash scripts/run-ci-local.sh
#
# Prérequis :
#   pip install -r requirements.txt
#   Node.js >= 18, Python 3.x, uvicorn, curl

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

# ── Terminal colors ────────────────────────────────────────────────────────────
if [ -t 1 ]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; NC='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; BOLD=''; NC=''
fi

W=62
step()  { printf "\n${YELLOW}▶  %s${NC}\n" "$*"; }
ok()    { printf "${GREEN}✓  %s${NC}\n" "$*"; }
fail()  { printf "${RED}✕  %s${NC}\n" "$*"; }
sep()   { printf '%*s\n' "$W" '' | tr ' ' '─'; }

# ── Runtime CI isolé ───────────────────────────────────────────────────────────
CI_RUNTIME="$(mktemp -d /tmp/localcms_ci_XXXXXX)"
export LOCALCMS_SHARED_ROOT="${CI_RUNTIME}/shared"
export LOCALCMS_MODULES_DIR="${CI_RUNTIME}/modules"
CI_PORT="${PORT:-8000}"
BASE_URL="http://127.0.0.1:${CI_PORT}"

step "Runtime CI isolé : ${CI_RUNTIME}"

# Créer la structure de dossiers runtime
mkdir -p \
  "${LOCALCMS_SHARED_ROOT}/install-queue" \
  "${LOCALCMS_SHARED_ROOT}/install-backups" \
  "${LOCALCMS_SHARED_ROOT}/install-logs" \
  "${LOCALCMS_SHARED_ROOT}/docs" \
  "${LOCALCMS_MODULES_DIR}"

# Fixtures shared (requises par shared-explorer smoke S2/S3/S5)
printf '# LocalCMS README\n\nShared root CI fixture.\n' \
  > "${LOCALCMS_SHARED_ROOT}/readme.md"

# big.log > 5 MB — requis pour S5 (413 preview refusé)
python3 -c "
import os
path = os.environ.get('LOCALCMS_SHARED_ROOT', '') + '/big.log'
with open(path, 'wb') as f:
    f.write(b'x' * (5 * 1024 * 1024 + 1))
"

# Générer les bundles CI depuis les sources fixtures (déterministes — versionnées)
export FIXTURES_SRC="${REPO_DIR}/tests/fixtures/cms-installer"
printf "  Génération bundles depuis fixtures...\n"
python3 << 'PYEOF'
import zipfile, os

fixtures_dir = os.environ['FIXTURES_SRC']
queue_dir    = os.environ['LOCALCMS_SHARED_ROOT'] + '/install-queue'

for bundle_name in sorted(os.listdir(fixtures_dir)):
    src = os.path.join(fixtures_dir, bundle_name)
    if not os.path.isdir(src):
        continue
    zp = os.path.join(queue_dir, bundle_name + '.zip')
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as zf:
        for fn in sorted(os.listdir(src)):
            zf.write(os.path.join(src, fn), fn)
    print(f'  Bundle créé : {bundle_name}.zip')
PYEOF

# Bundles additionnels depuis le runtime local si disponible
QUEUE_SRC="/home/ghost/localcms_runtime/shared/install-queue"
if [ -d "$QUEUE_SRC" ]; then
  for f in "$QUEUE_SRC"/*.zip; do
    [ -f "$f" ] || continue
    bn="$(basename "$f")"
    dest="${LOCALCMS_SHARED_ROOT}/install-queue/${bn}"
    [ -f "$dest" ] || { cp "$f" "$dest" && printf "  Bundle additionnel : %s\n" "$bn"; }
  done
fi

# ── Trap cleanup ───────────────────────────────────────────────────────────────
UVICORN_PID=""
CI_EXIT=0

cleanup() {
  if [ -n "$UVICORN_PID" ] && kill -0 "$UVICORN_PID" 2>/dev/null; then
    step "Arrêt uvicorn (PID ${UVICORN_PID})"
    kill "$UVICORN_PID" 2>/dev/null || true
    wait "$UVICORN_PID" 2>/dev/null || true
  fi
  rm -rf "$CI_RUNTIME"
  printf "  Runtime CI nettoyé.\n"
}
trap cleanup EXIT

# ── 1/5 — Tests Python : intégration pipeline ─────────────────────────────────
sep
step "1/5 — Tests Python : integration_test_pipeline.py"
python3 tests/integration_test_pipeline.py
ok "integration_test_pipeline.py PASS"

# ── 2/5 — Tests Python : intégration shared explorer ─────────────────────────
sep
step "2/5 — Tests Python : integration_test_shared_explorer.py"
python3 tests/integration_test_shared_explorer.py
ok "integration_test_shared_explorer.py PASS"

# ── 3/5 — npm run test:adopt ──────────────────────────────────────────────────
sep
step "3/5 — npm run test:adopt"
npm run test:adopt
ok "npm run test:adopt PASS"

# ── 4/5 — Démarrage uvicorn ───────────────────────────────────────────────────
sep
step "4/5 — Smokes live — démarrage uvicorn"
python3 -m uvicorn main:app \
  --host 127.0.0.1 \
  --port "${CI_PORT}" \
  --log-level warning &
UVICORN_PID=$!
printf "  uvicorn PID=%s\n" "$UVICORN_PID"

# Attendre /health (max 30 tentatives, 1s entre chaque)
printf "  Attente /health"
for i in $(seq 1 30); do
  if curl -sf "${BASE_URL}/health" > /dev/null 2>&1; then
    printf " → OK (%ds)\n" "$i"
    ok "/health répond"
    break
  fi
  printf "."
  sleep 1
  if [ "$i" -eq 30 ]; then
    printf "\n"
    fail "Timeout /health après 30s"
    exit 1
  fi
done

# ── 5a/5 — Smoke shared-explorer (live) ──────────────────────────────────────
sep
step "5a/5 — Smoke shared-explorer.smoke.js (live)"
BACKEND_URL="${BASE_URL}" node tests/shared-explorer.smoke.js
ok "shared-explorer.smoke.js PASS"

# ── 5b/5 — Smoke cms-installer (live) ────────────────────────────────────────
sep
step "5b/5 — Smoke cms-installer.smoke.js (live)"
BACKEND_URL="${BASE_URL}" node tests/cms-installer.smoke.js
ok "cms-installer.smoke.js PASS"

# ── Résumé final ──────────────────────────────────────────────────────────────
sep
printf "\n${BOLD}%s${NC}\n" "$(printf '%*s' "$W" '' | tr ' ' '═')"
printf "${BOLD}  LocalCMS CI — PASS${NC}\n"
printf "  integration_test_pipeline.py          ✓\n"
printf "  integration_test_shared_explorer.py   ✓\n"
printf "  npm run test:adopt (9 suites)          ✓\n"
printf "  shared-explorer.smoke.js (live 6/6)   ✓\n"
printf "  cms-installer.smoke.js  (live 10/10)   ✓\n"
printf "${BOLD}%s${NC}\n\n" "$(printf '%*s' "$W" '' | tr ' ' '═')"
