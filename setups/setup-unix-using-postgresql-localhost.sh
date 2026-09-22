#!/usr/bin/env bash
# Idempotent local setup — Unix (Linux/macOS), PostgreSQL installed natively
# (NOT via Docker — see setup-unix-using-postgresql-docker.sh for that).
#
# What it does:
#   1. Checks prerequisites (Node.js >= 24, a reachable Postgres server)
#   2. Creates .env from .env.example if missing, forced to PostgreSQL
#   3. Installs npm dependencies
#   4. Generates an APP_KEY if one isn't set yet
#   5. Runs migrations and seeds the database (admin@gmail.com / adminBR@123)
#
# Set DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_DATABASE env vars before running
# if your local Postgres isn't on the defaults below.
#
# Usage: ./setups/setup-unix-using-postgresql-localhost.sh
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
die() { printf '\n\033[1;31merror:\033[0m %s\n' "$1" >&2; exit 1; }

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_DATABASE="${DB_DATABASE:-ado}"

if [[ "$(uname -s)" == MINGW* || "$(uname -s)" == MSYS* ]]; then
  log "Note: you're on Windows — setup-windows-using-postgresql-localhost.sh has the same steps with Windows-specific prerequisite hints, but this script works fine too."
fi

log "Checking Node.js version"
command -v node >/dev/null 2>&1 || die "Node.js not found. Install Node.js 24+ (https://nodejs.org) and re-run."
NODE_MAJOR="$(node -e 'console.log(process.versions.node.split(".")[0])')"
if [[ "$NODE_MAJOR" -lt 24 ]]; then
  die "Node.js 24+ required, found $(node -v). Install a newer version (https://nodejs.org) and re-run."
fi
echo "Node.js $(node -v) OK"

log "Checking a local PostgreSQL server is reachable at $DB_HOST:$DB_PORT"
if command -v pg_isready >/dev/null 2>&1; then
  pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1 \
    || die "No PostgreSQL server responding at $DB_HOST:$DB_PORT. Install/start PostgreSQL (e.g. 'brew install postgresql' on macOS, 'apt install postgresql' on Debian/Ubuntu), create a database named '$DB_DATABASE', then re-run. Or use setup-unix-using-postgresql-docker.sh instead."
else
  node -e "
    const net = require('net');
    const s = net.createConnection({ host: process.argv[1], port: Number(process.argv[2]) });
    s.on('connect', () => { s.end(); process.exit(0); });
    s.on('error', () => process.exit(1));
    setTimeout(() => process.exit(1), 3000);
  " "$DB_HOST" "$DB_PORT" \
    || die "No PostgreSQL server responding at $DB_HOST:$DB_PORT. Install/start PostgreSQL, create a database named '$DB_DATABASE', then re-run. Or use setup-unix-using-postgresql-docker.sh instead."
fi
echo "PostgreSQL reachable at $DB_HOST:$DB_PORT"

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
set_env() {
  local key="$1" value="$2"
  if grep -q "^${key}=" .env; then
    sed -i.bak "s#^${key}=.*#${key}=${value}#" .env && rm -f .env.bak
  else
    echo "${key}=${value}" >> .env
  fi
}
set_env DB_CONNECTION pg
set_env DB_HOST "$DB_HOST"
set_env DB_PORT "$DB_PORT"
set_env DB_USER "$DB_USER"
set_env DB_PASSWORD "$DB_PASSWORD"
set_env DB_DATABASE "$DB_DATABASE"
echo "DB_CONNECTION=pg ($DB_USER@$DB_HOST:$DB_PORT/$DB_DATABASE)"

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

log "Done!"
cat <<'EOF'

Start the dev server:
  npm run dev

Then open http://localhost:3333 and log in with:
  email:    admin@gmail.com
  password: adminBR@123
EOF
