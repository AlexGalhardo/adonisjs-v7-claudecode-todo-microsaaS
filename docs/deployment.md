# Deployment

## Docker

`infra/Dockerfile` é um build multi-stage:

1. `deps` — instala todas as dependências (incluindo dev). O driver `sqlite3` tenta baixar
   um binário pré-compilado (`prebuild-install`) e só cai em compilação via `node-gyp` se
   nenhum binário bater com a plataforma — por isso o estágio instala `python3 make g++`
   antes do `npm ci`, como rede de segurança para esse fallback.
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

`infra/docker-compose.yml` sobe dois serviços:

- **`app`** — a aplicação, buildada a partir do `Dockerfile` acima. Carrega `APP_KEY` e o
  resto de `../.env` via `env_file` (por isso `.env` precisa existir antes — rode um dos
  scripts em `setups/` primeiro, incluindo um `RESEND_API_KEY` real para enviar email), e
  sobrescreve só o necessário para rodar dentro da rede Docker (`DB_CONNECTION=pg`,
  `DB_HOST=db`, etc.).
- **`db`** — PostgreSQL 17, com healthcheck (`pg_isready`) para o `app` esperar antes de
  subir.

Email (password reset, magic link, contato) é enviado via Resend — não há mais um serviço
local de inbox (Mailpit foi removido); ver `docs/deployment.md#galaxy-cloud` e
`config/mail.ts`.

### Rodar tudo (app + banco) via Docker

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

### Rodar só a infraestrutura (banco), app local com hot-reload

Fluxo usado pelos scripts `setups/*-postgresql-docker.sh`:

```bash
docker compose -f infra/docker-compose.yml up -d db
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

## Galaxy Cloud

[Galaxy Cloud](https://galaxycloud.app/) builda apps Node/AdonisJS com um buildpack próprio
(imagem base `meteor/galaxy-node`) — ele **não** usa `infra/Dockerfile`, nem existe forma
documentada de adicionar pacotes apt (`python3 make g++`) ou apontar para um Dockerfile
customizado do repositório. Isso quebrava o deploy: `better-sqlite3` não publica binário
pré-compilado (todo `npm install` roda `node-gyp rebuild`, que exige Python), e o build
image do Galaxy não tem Python.

Por isso o driver SQLite do projeto é `sqlite3` (não `better-sqlite3`) — ele tenta baixar um
binário pré-compilado via `prebuild-install` antes de cair em `node-gyp`, e publica prebuilds
para `linux-x64` (glibc), que é a plataforma usada pela imagem `meteor/galaxy-node`. Isso
evita a compilação nativa no ambiente de build do Galaxy sem precisar de nenhuma configuração
adicional na plataforma.

Se esse problema voltar a acontecer (por exemplo com uma dependência nativa diferente), a
única alternativa validada é evitar dependências que exigem `node-gyp` sem fallback de
binário pré-compilado — o Galaxy não oferece um jeito de instalar pacotes de sistema para
apps Node/AdonisJS no momento em que este documento foi escrito.

## CI/CD (GitHub Actions)

`.github/workflows/ci.yml` roda em todo push/PR para `master`: `npm ci` → cria um `.env` a
partir de `.env.example` (com `APP_KEY` gerado e um `RESEND_API_KEY` fake — os testes que
enviam email usam `mail.fake()`, nunca fazem chamada de rede real) → `node ace migration:run`
contra o banco de teste → `npx playwright install --with-deps chromium` (necessário para a
suíte `tests/browser/`) → lint (Biome) → typecheck → testes (Japa) → build de produção.

Não há step de deploy: o Galaxy Cloud já observa o repositório e builda/publica sozinho a
cada push em `master` (deploy automático via Git, sem token/secret do lado do GitHub
Actions) — o workflow existe só como esteira de qualidade antes desse deploy acontecer.