# Deployment

## Docker

`infra/Dockerfile` é um build multi-stage:

1. `deps` — instala todas as dependências (incluindo dev). `better-sqlite3` não tem binário
   pré-compilado para toda combinação de plataforma/Node, então compila do zero aqui — por
   isso o estágio instala `python3 make g++` antes do `npm ci`.
2. `build` — copia o código, roda `node ace build` (compila TypeScript, empacota o frontend
   com Vite).
3. `production-deps` — reinstala só as dependências de produção (`npm ci --omit=dev`) a
   partir do `package.json`/`package-lock.json` gerados dentro de `build/`.
4. `runtime` — imagem final: copia a saída do build + `node_modules` de produção, roda como
   usuário não-root, expõe a porta 3333.

`.npmrc` (`legacy-peer-deps=true`, ver comentário no arquivo) é copiado explicitamente em
todo estágio que roda `npm ci` — sem ele o install falha por causa de um peer dependency
desatualizado do `@adonisjs/ally` contra o `@adonisjs/inertia` v5.

Build manual (a partir da raiz do projeto):

```bash
docker build -f infra/Dockerfile -t ado .
```

## docker-compose

`infra/docker-compose.yml` sobe três serviços:

- **`app`** — a aplicação, buildada a partir do `Dockerfile` acima. Carrega `APP_KEY` e o
  resto de `../.env` via `env_file` (por isso `.env` precisa existir antes — rode um dos
  scripts em `setups/` primeiro), e sobrescreve só o necessário para rodar dentro da rede
  Docker (`DB_CONNECTION=pg`, `DB_HOST=db`, `SMTP_HOST=mailpit`, etc.).
- **`db`** — PostgreSQL 17, com healthcheck (`pg_isready`) para o `app` esperar antes de
  subir.
- **`mailpit`** — caixa de entrada de email local (SMTP na porta 1025, UI web em
  `http://localhost:8025`), sem precisar de nenhuma conta real.

### Rodar tudo (app + banco + email) via Docker

```bash
docker compose -f infra/docker-compose.yml up -d
docker compose -f infra/docker-compose.yml exec app node ace migration:run --force
docker compose -f infra/docker-compose.yml exec app node ace db:seed
```

`--force` é necessário porque `node ace migration:run` pede confirmação interativa quando
`NODE_ENV=production` (que é o valor dentro do container) — sem o flag, o comando fica
esperando um "y" que nunca vem.

Verificado na prática: as três etapas acima rodaram do zero (build → up → migrate → seed)
contra um Postgres real em container, e login com o admin semeado
(`admin@gmail.com`/`adminBR@123`) funcionou de ponta a ponta pelo navegador.

Acesse em `http://localhost:3333`. Pare tudo com:

```bash
docker compose -f infra/docker-compose.yml down
```

### Rodar só a infraestrutura (banco + email), app local com hot-reload

Fluxo usado pelos scripts `setups/*-postgresql-docker.sh`:

```bash
docker compose -f infra/docker-compose.yml up -d db mailpit
npm run dev
```

Nesse modo o `NODE_ENV` continua `development` (do `.env` local), então
`node ace migration:run` (sem `--force`) funciona normalmente.

## Scripts de setup

Ver `setups/` — seis scripts idempotentes (`setup-<unix|windows>-using-<sqlite-localhost|
postgresql-localhost|postgresql-docker>.sh`), todos em bash (rodam via Git Bash no
Windows). Cada um: valida pré-requisitos (Node 24+, e Docker rodando quando aplicável),
cria `.env` a partir de `.env.example` se não existir, instala dependências, gera
`APP_KEY` se necessário, roda migrations e o seed — terminando com as credenciais do admin
semeado prontas para uso.