#!/usr/bin/env bash
# Idempotent local setup — Unix (Linux/macOS), SQLite, no Docker needed.
#
# What it does:
#   1. Checks prerequisites (Node.js >= 24)
#   2. Creates .env from .env.example if missing, forced to SQLite
#   3. Installs npm dependencies
#   4. Generates an APP_KEY if one isn't set yet
#   5. Runs migrations and seeds the database (admin@gmail.com / adminBR@123)
#   6. Starts the dev server (npm run dev) in this same window, so its logs
#      stay visible instead of the window closing right after setup
#
# Usage: ./setups/setup-unix-using-sqlite-localhost.sh
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
# Keeps the window open (e.g. when double-clicked from a file manager, which
# closes the terminal the instant the script exits) so setup output, errors,
# and dev-server logs stay readable until dismissed.
trap 'read -n 1 -s -r -p "Press any key to close this window..." 2>/dev/null; echo' EXIT

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
die() { printf '\n\033[1;31merror:\033[0m %s\n' "$1" >&2; exit 1; }

if [[ "$(uname -s)" == MINGW* || "$(uname -s)" == MSYS* ]]; then
  log "Note: you're on Windows — setups/setup-windows-using-sqlite-localhost.sh has the same steps with Windows-specific prerequisite hints, but this script works fine too."
fi

log "Checking Node.js version"
command -v node >/dev/null 2>&1 || die "Node.js not found. Install Node.js 24+ (https://nodejs.org) and re-run."
NODE_MAJOR="$(node -e 'console.log(process.versions.node.split(".")[0])')"
if [[ "$NODE_MAJOR" -lt 24 ]]; then
  die "Node.js 24+ required, found $(node -v). Install a newer version (https://nodejs.org) and re-run."
fi
echo "Node.js $(node -v) OK"

log "Checking npm"
command -v npm >/dev/null 2>&1 || die "npm not found (should ship with Node.js)."
echo "npm $(npm -v) OK"

log "Setting up .env"
if [[ -f .env ]]; then
  echo ".env already exists — leaving it as is."
else
  cp .env.example .env
  echo "Created .env from .env.example."
fi
# A missing trailing newline would otherwise glue an appended value onto the
# end of the last existing line.
[[ -s .env && -z "$(tail -c1 .env)" ]] || echo >> .env
# Force SQLite regardless of what .env.example currently defaults to.
if grep -q '^DB_CONNECTION=' .env; then
  sed -i.bak 's/^DB_CONNECTION=.*/DB_CONNECTION=sqlite/' .env && rm -f .env.bak
else
  echo 'DB_CONNECTION=sqlite' >> .env
fi
echo "DB_CONNECTION=sqlite"

log "Installing npm dependencies"
npm install

log "Ensuring APP_KEY is set"
if grep -q '^APP_KEY=$' .env || ! grep -q '^APP_KEY=' .env; then
  node ace generate:key
else
  echo "APP_KEY already set — leaving it as is."
fi

log "Running migrations"
node ace migration:run

log "Seeding the database (admin user + sample todos)"
node ace db:seed

log "Done! Starting the dev server (logs will stream below — press Ctrl+C to stop)"
cat <<'EOF'

Open http://localhost:3333 and log in with:
  email:    admin@gmail.com
  password: adminBR@123

EOF
npm run dev
