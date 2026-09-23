#!/usr/bin/env bash
# Idempotent local setup — Unix (Linux/macOS), PostgreSQL via Docker Compose
# (infra/docker-compose.yml). The app itself still runs locally with
# `npm run dev` — only the database runs in a container. Email is sent via
# Resend (see RESEND_API_KEY in .env.example), no local mail container needed.
#
# What it does:
#   1. Checks prerequisites (Node.js >= 24, Docker running)
#   2. Creates .env from .env.example if missing, forced to Dockerized Postgres
#   3. Starts the "db" container and waits for Postgres to be healthy
#   4. Installs npm dependencies
#   5. Generates an APP_KEY if one isn't set yet
#   6. Runs migrations and seeds the database (admin@gmail.com / adminBR@123)
#   7. Starts the dev server (npm run dev) in this same window, so its logs
#      stay visible instead of the window closing right after setup
#
# Usage: ./setups/setup-unix-using-postgresql-docker.sh
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
# Keeps the window open (e.g. when double-clicked from a file manager, which
# closes the terminal the instant the script exits) so setup output, errors,
# and dev-server logs stay readable until dismissed.
trap 'read -n 1 -s -r -p "Press any key to close this window..." 2>/dev/null; echo' EXIT

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
die() { printf '\n\033[1;31merror:\033[0m %s\n' "$1" >&2; exit 1; }

if [[ "$(uname -s)" == MINGW* || "$(uname -s)" == MSYS* ]]; then
  log "Note: you're on Windows — setup-windows-using-postgresql-docker.sh has the same steps with Windows-specific prerequisite hints, but this script works fine too."
fi

log "Checking Node.js version"
command -v node >/dev/null 2>&1 || die "Node.js not found. Install Node.js 24+ (https://nodejs.org) and re-run."
NODE_MAJOR="$(node -e 'console.log(process.versions.node.split(".")[0])')"
if [[ "$NODE_MAJOR" -lt 24 ]]; then
  die "Node.js 24+ required, found $(node -v). Install a newer version (https://nodejs.org) and re-run."
fi
echo "Node.js $(node -v) OK"

log "Checking Docker is running"
command -v docker >/dev/null 2>&1 || die "Docker not found. Install Docker Desktop or Docker Engine (https://docs.docker.com/get-docker/) and re-run."
docker info >/dev/null 2>&1 || die "Docker is installed but not running. Start Docker Desktop (or the Docker daemon) and re-run."
echo "Docker OK"

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
set_env DB_HOST localhost
set_env DB_PORT 5432
set_env DB_USER postgres
set_env DB_PASSWORD postgres
set_env DB_DATABASE ado
echo "DB_CONNECTION=pg (via Docker)"
if ! grep -q '^RESEND_API_KEY=.\+' .env; then
  echo "Note: RESEND_API_KEY is empty in .env — set a real key from https://resend.com/api-keys to send emails."
fi

log "Starting Postgres container"
docker compose -f infra/docker-compose.yml up -d db

log "Waiting for Postgres to become healthy"
for _ in $(seq 1 30); do
  status="$(docker compose -f infra/docker-compose.yml ps db --format '{{.Health}}' 2>/dev/null || true)"
  [[ "$status" == "healthy" ]] && break
  sleep 1
done
[[ "$status" == "healthy" ]] || die "Postgres container did not become healthy in time. Check 'docker compose -f infra/docker-compose.yml logs db'."
echo "Postgres is healthy"

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

Emails sent by the app (password reset, magic link, contact form) go through
Resend — set RESEND_API_KEY in .env to a real key to actually deliver them.

Stop the containers when you're done:
  docker compose -f infra/docker-compose.yml down

EOF
npm run dev
