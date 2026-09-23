<div align="center">

# AdonisJS v7 ClaudeCode ToDo MicroSaaS

[![CI](https://github.com/AlexGalhardo/todo-adonisjs-v7-claude/actions/workflows/ci.yml/badge.svg)](https://github.com/AlexGalhardo/todo-adonisjs-v7-claude/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D24-brightgreen.svg)](https://nodejs.org)
[![AdonisJS](https://img.shields.io/badge/AdonisJS-v7-5A45FF.svg)](https://adonisjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

Project built to learn the AdonisJS framework alongside Inertia + React, with ~99% of the
code written by [Claude Code](https://claude.com/claude-code). It's a todo list app that
doubles as a reference implementation of a small, real micro-SaaS: authentication (password,
magic link, 2FA, social login), a todo CRUD (web + REST API), and a Stripe subscription flow
gating a free-plan limit — all following AdonisJS's own conventions strictly, with no parallel
architecture invented on top.

## Features

- Email/password signup & login, password recovery, passwordless login (magic link),
  two-factor authentication (2FA/TOTP), social login (Google/GitHub)
- Todo CRUD with per-user authorization — web (Inertia) and an equivalent REST API
- **Micro-SaaS billing**: 10 todos free per user, then a Stripe subscription (monthly/annual)
  is required — Stripe Checkout, Customer Portal, and webhook-driven subscription state (see
  [`docs/billing.md`](docs/billing.md))
- Rate limiting, automated tests (unit/functional/E2E), Docker infra, CI

## Tech stack

| Layer          | Technology                                                              |
| -------------- | ------------------------------------------------------------------------ |
| Backend        | [AdonisJS v7](https://docs.adonisjs.com/) (TypeScript)                    |
| ORM            | [Lucid](https://lucid.adonisjs.com/)                                        |
| Validation     | [VineJS](https://vinejs.dev/)                                                 |
| Frontend       | [Inertia v3](https://inertiajs.com/) + [React 19](https://react.dev/)          |
| Styling        | [Tailwind CSS v4](https://tailwindcss.com/) + [Base UI](https://base-ui.com/)   |
| Database       | SQLite (dev) **or** PostgreSQL (dev/production), switched via `.env`             |
| Payments       | [Stripe](https://stripe.com/) — Checkout, Billing/Customer Portal, webhooks         |
| Email          | [Resend](https://resend.com/)                                                        |
| Testing        | [Japa](https://japa.dev/) (unit, functional, browser/E2E via Playwright)              |
| Lint/format    | [BiomeJS](https://biomejs.dev/)                                                         |
| Hosting        | [Galaxy Cloud](https://galaxycloud.app/) (Node/AdonisJS buildpack, auto-deploy on push)  |
| Runtime        | Node.js **v24+**                                                                          |

## Development setup

The fastest way to get running from scratch is one of the idempotent scripts in
[`setups/`](setups/) — pick the one matching your OS and database choice. Each one validates
prerequisites, creates `.env`, installs dependencies, generates the app key, runs migrations,
seeds the database, and finally starts the dev server (logs stream in the same terminal):

```bash
# SQLite (simplest, no Docker)
./setups/setup-unix-using-sqlite-localhost.sh          # Linux/macOS
./setups/setup-windows-using-sqlite-localhost.sh        # Windows (via Git Bash)

# PostgreSQL already installed locally (not Docker)
./setups/setup-unix-using-postgresql-localhost.sh
./setups/setup-windows-using-postgresql-localhost.sh

# PostgreSQL via Docker (app still runs locally with hot-reload)
./setups/setup-unix-using-postgresql-docker.sh
./setups/setup-windows-using-postgresql-docker.sh
```

Then open **http://localhost:3333** and log in with the seeded admin account:

```
email:    admin@gmail.com
password: adminBR@123
```

Prefer doing it by hand, or need PostgreSQL/Docker specifics? See the full manual steps and
environment variable reference in [`docs/database.md`](docs/database.md) and
[`docs/deployment.md`](docs/deployment.md). All variables are documented in `.env.example`.

### Useful commands

```bash
npm run dev              # dev server with HMR (http://localhost:3333)
npm run build             # production build
npm run test                # full test suite (unit + functional + browser)
npm run lint                  # biome check
npm run format                  # biome format --write
npm run typecheck                 # tsc --noEmit (backend + frontend)
node ace migration:run              # run pending migrations
node ace db:seed                      # seed the database (admin + sample todos)
npm run db:studio                       # Drizzle Studio (database viewer)
```

## Documentation

In-depth docs live in [`docs/`](docs/):

- [`docs/architecture.md`](docs/architecture.md) — architecture decisions and why
- [`docs/database.md`](docs/database.md) — modeling, migrations, seeds, switching SQLite/Postgres
- [`docs/auth.md`](docs/auth.md) — every authentication flow in detail
- [`docs/api.md`](docs/api.md) — REST API contracts
- [`docs/billing.md`](docs/billing.md) — Stripe subscriptions, webhooks, credential setup
- [`docs/testing.md`](docs/testing.md) — testing strategy and how to run it
- [`docs/deployment.md`](docs/deployment.md) — Docker and production (Galaxy Cloud)

Also see [`CLAUDE.md`](CLAUDE.md) (quick guide for working in this codebase) and
[`TODO.md`](TODO.md) (task-by-task progress log).

## Contributing

Contributions are welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md) for the workflow,
conventions, and pre-PR checklist.

## Credits

Built by [Alex Galhardo](https://github.com/AlexGalhardo), ~99% of the implementation by
[Claude Code](https://claude.com/claude-code), as a hands-on way to learn AdonisJS.

## License

[MIT](LICENSE)
