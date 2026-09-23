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

### Regressão: `sqlite3@6.0.1` quebra em produção com `GLIBC_2.38' not found`

Mesmo usando `sqlite3` (que baixa um binário pré-compilado em vez de compilar via
`node-gyp`), o app ainda quebrava em produção com 500 em qualquer request que tocasse o
banco:

```
Knex: run
$ npm install sqlite3 --save
/lib/x86_64-linux-gnu/libm.so.6: version `GLIBC_2.38' not found (required by
/app/node_modules/sqlite3/build/Release/node_sqlite3.node)
```

Causa raiz: a partir da release `6.0.1`, o binário pré-compilado do `sqlite3` passou a ser
gerado numa imagem de CI com uma `glibc` mais nova (2.38) do que a que o container de
**runtime** do Galaxy Cloud oferece — mesmo o *build* completando sem erro (o binário é só
baixado, não compilado ali), ele falha ao carregar depois, no pod que efetivamente serve a
aplicação. Esse é um problema conhecido e documentado do pacote (afeta Vercel, Railway e
outras plataformas com a mesma divisão build/runtime), com o binário da `5.1.7` — a última
release antes dessa mudança de toolchain — confirmado como correção pela comunidade.

- **Fix**: `sqlite3` fixado em `5.1.7` (exato, sem `^`) em `package.json` — ainda usa
  N-API (`node-addon-api`), então o mesmo binário funciona em qualquer versão do Node que
  suporte N-API estável, incluindo o Node 24 usado aqui; não precisa recompilar nada.
- Se uma futura atualização do `sqlite3` corrigir esse problema na origem (ou se o Galaxy
  Cloud alinhar a glibc do build/runtime), vale revisitar o pin.

### Regressão: `SQLITE_CANTOPEN: unable to open database file` em produção

Depois do fix de GLIBC acima, o app ainda quebrava em qualquer request que tocasse o banco,
agora com `SQLITE_CANTOPEN` em vez de erro de `glibc`.

Causa raiz: `tmp/` (onde mora o arquivo `db.sqlite3`, ver `config/database.ts`) nunca chegava
no build de produção. `adonisrc.ts` (`metaFiles`) só copiava `resources/views/**/*.edge` e
`public/**` para `build/` — `tmp/` fica de fora por padrão, e o `RUN mkdir -p tmp` do
`infra/Dockerfile` não ajuda porque o Galaxy Cloud builda com `node ace build` direto (seu
próprio buildpack), sem passar pelo Dockerfile deste repositório.

- **Fix**: duas camadas independentes, cada uma suficiente sozinha, mas redundantes de
  propósito para qualquer método de deploy futuro:
  - `tmp/.gitkeep` adicionado a `metaFiles` em `adonisrc.ts`, para que `tmp/` sempre exista no
    build de produção.
  - `config/database.ts` chama `mkdirSync(app.tmpPath(), { recursive: true })` antes de
    definir a conexão SQLite, garantindo o diretório em tempo de execução independente de
    como o build foi gerado.

## CI/CD (GitHub Actions)

`.github/workflows/ci.yml` roda em todo push/PR para `master`: `npm ci` → cria um `.env` a
partir de `.env.example` (com `APP_KEY` gerado e um `RESEND_API_KEY` fake — os testes que
enviam email usam `mail.fake()`, nunca fazem chamada de rede real) → `node ace migration:run`
contra o banco de teste → `npx playwright install --with-deps chromium` (necessário para a
suíte `tests/browser/`) → lint (Biome) → typecheck → testes (Japa) → build de produção.

Não há step de deploy: o Galaxy Cloud já observa o repositório e builda/publica sozinho a
cada push em `master` (deploy automático via Git, sem token/secret do lado do GitHub
Actions) — o workflow existe só como esteira de qualidade antes desse deploy acontecer.