# Todo

Aplicação de lista de tarefas (todo list) full-stack construída com **AdonisJS v7**,
**Inertia v3 + React 19** e **PostgreSQL/SQLite**, usada como projeto de referência para
quem está aprendendo o framework. Segue estritamente o padrão MVC e as convenções
impostas pelo AdonisJS — sem arquitetura paralela inventada.

Inclui: cadastro/login por email e senha, recuperação de senha, login sem senha (magic
link), autenticação de dois fatores (2FA/TOTP), login social (Google/GitHub), CRUD de
todos com autorização por usuário (camada web via Inertia **e** API REST equivalente),
rate limiting, testes automatizados (unit/functional/E2E) e infraestrutura Docker pronta.

## Stack

| Camada         | Tecnologia                                             |
| -------------- | ------------------------------------------------------- |
| Backend        | [AdonisJS v7](https://docs.adonisjs.com/) (TypeScript)   |
| ORM            | [Lucid](https://lucid.adonisjs.com/)                      |
| Validação      | [VineJS](https://vinejs.dev/)                               |
| Frontend       | [Inertia v3](https://inertiajs.com/) + [React 19](https://react.dev/) |
| Estilo         | [Tailwind CSS v4](https://tailwindcss.com/) + [Base UI](https://base-ui.com/) |
| Banco de dados | SQLite (dev) **ou** PostgreSQL (dev/produção), via `.env`   |
| Testes         | [Japa](https://japa.dev/) (unit, functional, browser/E2E) |
| Runtime        | Node.js **v24+**                                            |

## Pré-requisitos

- [Node.js 24+](https://nodejs.org)
- Para PostgreSQL local sem Docker: um servidor PostgreSQL rodando
- Para qualquer variante com Docker: [Docker](https://www.docker.com/) instalado e rodando

## Instalação rápida

A forma mais simples de rodar o projeto do zero é usando um dos scripts em `setups/` —
eles validam os pré-requisitos, criam o `.env`, instalam as dependências, geram a chave da
aplicação, rodam as migrations e semeiam o banco, tudo de uma vez.

```bash
# SQLite (mais simples, sem Docker)
./setups/setup-unix-using-sqlite-localhost.sh          # Linux/macOS
./setups/setup-windows-using-sqlite-localhost.sh        # Windows (via Git Bash)

# PostgreSQL já instalado localmente (não em Docker)
./setups/setup-unix-using-postgresql-localhost.sh
./setups/setup-windows-using-postgresql-localhost.sh

# PostgreSQL via Docker (app roda local com hot-reload)
./setups/setup-unix-using-postgresql-docker.sh
./setups/setup-windows-using-postgresql-docker.sh
```

(As três variantes "windows" rodam via Git Bash e têm a mesma lógica das variantes
"unix" — só trocam as dicas de instalação de pré-requisitos exibidas em caso de erro.)

Depois de rodar um dos scripts:

```bash
npm run dev
```

E acesse **http://localhost:3333**.

### Instalação manual (passo a passo)

Se preferir não usar os scripts:

```bash
cp .env.example .env
npm install
node ace generate:key
node ace migration:run
node ace db:seed
npm run dev
```

Por padrão, `.env.example` usa SQLite (`DB_CONNECTION=sqlite`) — zero configuração
adicional necessária. Para usar PostgreSQL, veja a seção abaixo.

## Variáveis de ambiente

Veja `.env.example` — todas as variáveis estão lá, comentadas. Os grupos principais:

- **Node/App**: porta, host, `APP_KEY` (gerada automaticamente por
  `node ace generate:key`), `APP_URL`.
- **Banco de dados**: `DB_CONNECTION=sqlite` ou `DB_CONNECTION=pg` (+ `DB_HOST`,
  `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`) — troca de banco é só uma questão de
  variável de ambiente, nenhum código muda. Detalhes em [`docs/database.md`](docs/database.md).
- **Mail** (`RESEND_API_KEY`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`): usado para recuperação
  de senha, magic link e o formulário de contato, enviados via [Resend](https://resend.com).
  Gere uma chave em https://resend.com/api-keys.
- **Rate limiting** (`LIMITER_STORE`): `database` em desenvolvimento/produção, `memory`
  automaticamente nos testes.
- **Login social** (`GOOGLE_CLIENT_*`, `GITHUB_CLIENT_*`): opcionais — sem eles o app
  funciona normalmente, só os botões "Continue with Google/GitHub" não completam o login.
  Veja [`docs/auth.md`](docs/auth.md#login-social-googlegithub) para como criar as
  credenciais.

## Rodando com SQLite

Já é o padrão de `.env.example`. Não precisa de nenhum serviço externo:

```bash
cp .env.example .env
npm install
node ace generate:key
node ace migration:run
node ace db:seed
npm run dev
```

## Rodando com PostgreSQL (local, sem Docker)

Com um PostgreSQL já rodando na máquina:

```bash
cp .env.example .env
# Edite o .env: descomente e ajuste as linhas DB_CONNECTION=pg / DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_DATABASE
npm install
node ace generate:key
node ace migration:run
node ace db:seed
npm run dev
```

## Rodando com Docker

Duas formas, dependendo do que você quer rodar em container:

### Só a infraestrutura (Postgres), app local com hot-reload

```bash
docker compose -f infra/docker-compose.yml up -d db
cp .env.example .env
```

No `.env`, defina:

```
DB_CONNECTION=pg
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=ado
RESEND_API_KEY=<sua chave>
```

```bash
npm install
node ace generate:key
node ace migration:run
node ace db:seed
npm run dev
```

### Tudo em containers (app + Postgres)

```bash
cp .env.example .env
npm install               # precisa do node_modules local só para gerar a APP_KEY abaixo
node ace generate:key      # grava a APP_KEY no .env, que o container lê via env_file
docker compose -f infra/docker-compose.yml up -d
docker compose -f infra/docker-compose.yml exec app node ace migration:run --force
docker compose -f infra/docker-compose.yml exec app node ace db:seed
```

Acesse **http://localhost:3333**. Pare tudo com
`docker compose -f infra/docker-compose.yml down`.

Detalhes completos (por que cada estágio do Dockerfile existe, etc.) em
[`docs/deployment.md`](docs/deployment.md).

## Credenciais de exemplo (seed)

O seeder (`database/seeders/admin_user_seeder.ts`, rodado por `node ace db:seed`) cria uma
conta admin com alguns todos de exemplo:

```
email:    admin@gmail.com
senha:    adminBR@123
```

Rodar o seed várias vezes é seguro — ele não duplica nada.

## Rodando os testes

```bash
# Uma vez, antes da primeira execução (ou depois de criar uma migration nova):
NODE_ENV=test node ace migration:run

npm run test          # todas as suítes (unit + functional + browser)
node ace test unit     # só unitários
node ace test functional
node ace test browser   # E2E — abre um Chromium headless via Playwright
```

Os testes usam um banco SQLite isolado (`tmp/db_test.sqlite3`) por padrão — nunca tocam no
banco de desenvolvimento, mesmo que você esteja usando PostgreSQL em dev. Detalhes e
gotchas encontrados escrevendo os testes em [`docs/testing.md`](docs/testing.md).

## Documentação

- [`CLAUDE.md`](CLAUDE.md) — guia rápido para quem for mexer no código
- [`TODO.md`](TODO.md) — progresso do projeto, tarefa por tarefa
- [`docs/architecture.md`](docs/architecture.md) — decisões de arquitetura e o porquê
- [`docs/database.md`](docs/database.md) — modelagem, migrations, seeds, troca de driver
- [`docs/auth.md`](docs/auth.md) — todos os fluxos de autenticação em detalhe
- [`docs/api.md`](docs/api.md) — contratos da API REST
- [`docs/testing.md`](docs/testing.md) — estratégia de testes
- [`docs/deployment.md`](docs/deployment.md) — Docker e produção
- [`.claude/skills/`](.claude/skills/) — como reproduzir cada fluxo dominado neste
  projeto (adicionar um recurso CRUD, um fluxo de email com token, verificar infra Docker
  de verdade, etc.)

## Comandos úteis

```bash
npm run dev         # servidor de desenvolvimento com HMR
npm run build         # build de produção
npm run test            # suíte de testes completa
npm run lint              # eslint
npm run typecheck          # tsc --noEmit (backend + frontend)
node ace migration:run      # roda migrations pendentes
node ace migration:rollback  # desfaz o último batch de migrations
node ace db:seed              # popula o banco (admin + todos de exemplo)
node ace codegen                # regenera tipos/registros (rotas, páginas, policies)
npm run db:studio                # abre o Drizzle Studio (visualizador do banco, ver docs/database.md)
```
