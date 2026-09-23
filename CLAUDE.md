# CLAUDE.md

Guia rápido para trabalhar neste repositório. Detalhes ficam em `docs/`.

## Visão geral

TODO list full-stack em AdonisJS v7 (TypeScript), usado como projeto de referência para
aprendizado do framework por um desenvolvedor vindo de Laravel. Segue estritamente o padrão
MVC e as convenções impostas pelo AdonisJS — sem arquitetura paralela.

## Stack

- **Backend**: AdonisJS v7 + Lucid ORM + VineJS (validação)
- **Frontend**: Inertia v3 + React 19, Tailwind CSS v4 + Base UI, fonte global JetBrains Mono
- **Banco**: SQLite (dev/prod) ou PostgreSQL (dev/produção), escolhido via `.env`
  (`DB_CONNECTION`) — driver SQLite é `sqlite3` (não `better-sqlite3`, ver
  `docs/deployment.md#galaxy-cloud`). Visualizador: Drizzle Studio (`npm run db:studio`,
  ver `docs/database.md`) — Lucid continua sendo o único ORM/dono de migrations.
- **Email**: Resend (`config/mail.ts`), templates em JSX renderizados via
  `@react-email/render` (ver `app/mails/`)
- **Lint/format**: BiomeJS v2 (`biome.json`) — substitui ESLint/Prettier. `useImportType`
  fica desligado de propósito: veja
  `.claude/skills/how-to-avoid-breaking-inject-with-biome.md` antes de reativá-lo (quebra o
  `@inject()` do AdonisJS).
- **Git hooks**: Husky (`.husky/`) — `pre-commit` roda `biome check --staged`, `pre-push`
  roda typecheck + build + testes, `commit-msg` valida Conventional Commits. Instalado via
  `npm install` (script `prepare`).
- **Testes**: Japa (unit, functional, browser/E2E)
- **Runtime**: Node.js v24+

## Regras de idioma e navegação (obrigatórias em todo o app)

- Toda a interface visível ao usuário (textos, labels, mensagens, emails) deve estar em
  **inglês** — não em português — independente do idioma usado nesta documentação interna.
- Toda a lógica de endpoints, rotas e URLs deve estar em inglês (ex.: `/forgot-password`,
  não `/esqueci-senha`).
- Usuários autenticados não podem acessar as páginas de login, signup, forgot-password,
  reset-password e a landing page (`/`) — devem ser redirecionados para a área autenticada
  (`/dashboard`). Ver `app/middleware/guest_middleware.ts`.

## Comandos principais

```bash
npm run dev         # servidor de desenvolvimento com HMR (http://localhost:3333)
npm run build        # build de produção
npm run test          # roda a suíte Japa (unit + functional + browser)
npm run lint           # biome check
npm run format          # biome format --write
npm run typecheck       # tsc --noEmit (backend + inertia)
node ace migration:run   # roda migrations pendentes
node ace db:seed          # popula o banco (admin + todos de exemplo)
```

## Como rodar

Ver `README.md` na raiz para o passo a passo completo (SQLite, PostgreSQL local, Docker).
Ver `setups/` para scripts idempotentes por plataforma/driver.

## Documentação detalhada

- [docs/architecture.md](docs/architecture.md) — decisões de arquitetura e por quê
- [docs/database.md](docs/database.md) — modelagem, migrations, seeds, troca SQLite/Postgres
- [docs/auth.md](docs/auth.md) — autenticação, recuperação de senha, 2FA, login social, autorização
- [docs/api.md](docs/api.md) — endpoints REST, contratos de request/response
- [docs/testing.md](docs/testing.md) — estratégia de testes e como rodar
- [docs/deployment.md](docs/deployment.md) — Docker e produção

## Progresso

Ver `TODO.md` na raiz — fonte de verdade do progresso entre sessões.
