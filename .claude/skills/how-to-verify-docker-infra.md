# How to verify Docker infra actually works (not just looks right)

Writing a Dockerfile/docker-compose.yml that *looks* correct and one that actually builds
and serves traffic are different claims — only the second is worth committing. This is the
checklist that caught two real bugs in this project's `infra/` (see
`.claude/skills/how-to-avoid-npm-legacy-peer-deps-surprises.md` and the trailing-newline
bug in `TODO.md`'s Fase 7 notes).

## 1. Actually run `docker build`, don't just review the Dockerfile

```bash
docker build -f infra/Dockerfile -t <name> .
```

Native npm dependencies (anything needing `node-gyp`, e.g. `better-sqlite3`) fail in a
`-slim`/`-alpine` base image without build tools. If `npm ci`/`npm install` fails with
`gyp ERR! find Python`, add `python3 make g++` (Debian) or `python3 make g++ musl-dev`
(Alpine) to that stage before the install step.

## 2. Actually run `docker compose up` and hit the app

```bash
docker compose -f infra/docker-compose.yml up -d
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:<port>/
```

A 200 on the root route only proves the process booted — it doesn't prove the database
connection works. Run migrations against the containerized DB and check a page that
actually queries it:

```bash
docker compose -f infra/docker-compose.yml exec app node ace migration:run --force
docker compose -f infra/docker-compose.yml exec app node ace db:seed
```

`--force` is required for `migration:run` when `NODE_ENV=production` (the container's
value) — without it the command blocks on an interactive confirmation prompt that never
gets an answer, and just hangs.

## 3. Env vars: don't rely on the calling shell's exports

`docker compose`'s `${VAR}` substitution only sees variables exported in the *exact* shell
invocation that runs `docker compose up` — not ones exported in a previous command (each
tool call may be a fresh shell). Symptom: `APP_KEY` (or similar) silently becomes an empty
string, logged as a compose warning easy to miss. Fix: use `env_file: [../.env]` on the
service instead of expecting `${APP_KEY}` to be exported — it reads the project's own
`.env` directly, works the same regardless of how compose was invoked, and needs no
env-var gymnastics from whoever runs it.

## 4. Finish with a real login through a browser driver

`curl` proves the server responds; it doesn't prove the frontend renders or a full
request/response/redirect chain (login, session cookie, redirect to the authenticated
page) works. Drive it with Playwright (see the `run` skill) and screenshot the result.

## 5. Tear down and remove images when done testing

```bash
docker compose -f infra/docker-compose.yml down -v
docker rmi <name> <compose-project>-app 2>/dev/null || true
```

Leftover test images/volumes are easy to forget and bloat local disk — clean up as part of
finishing the verification, not as an afterthought.
