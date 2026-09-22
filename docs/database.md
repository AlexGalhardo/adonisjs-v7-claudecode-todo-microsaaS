# Banco de dados

## Driver dual (SQLite / PostgreSQL)

`config/database.ts` lê a conexão padrão de `env.get('DB_CONNECTION')` e define as duas
conexões possíveis (`sqlite` e `pg`) lado a lado. Trocar de banco é só uma questão de
variáveis de ambiente — nenhum código muda:

```bash
# SQLite (padrão, zero setup)
DB_CONNECTION=sqlite

# PostgreSQL (local via Docker/instalação nativa, ou produção)
DB_CONNECTION=pg
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=ado
```

As variáveis `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_DATABASE` são opcionais no
schema de `start/env.ts` porque só são necessárias quando `DB_CONNECTION=pg` — o driver
SQLite não as utiliza.

Isso foi validado na prática: as mesmas migrations rodaram sem alterações tanto contra o
arquivo SQLite local quanto contra um container Postgres 17 temporário, apenas trocando as
variáveis de ambiente do comando.

## Banco de testes isolado

`config/database.ts` usa `app.inTest` para apontar o driver SQLite para
`tmp/db_test.sqlite3` em vez de `tmp/db.sqlite3` durante os testes, então a suíte nunca
sobrescreve o banco de desenvolvimento. `.env.test` fixa `DB_CONNECTION=sqlite` por padrão
para que os testes não dependam de um Postgres rodando; para rodar a suíte contra Postgres,
basta sobrescrever `DB_CONNECTION=pg` e `DB_DATABASE=ado_test` em `.env.test`.

## Migrations e seeds

```bash
node ace migration:run     # aplica migrations pendentes
node ace migration:rollback # desfaz o último batch
node ace db:seed             # popula o banco (usuário admin + todos de exemplo)
```

Ver `database/migrations/` para o histórico de schema.

### Seeder de admin

`database/seeders/admin_user_seeder.ts` cria (ou reaproveita, se já existir) a conta:

```
email: admin@gmail.com
senha: adminBR@123
```

junto com 3 todos de exemplo (um deles já marcado como concluído), para servir de
referência de como seeders funcionam com Lucid — `firstOrCreate` é usado tanto para o
usuário quanto para cada todo (chave: `userId` + `title`), o que torna o seeder
**idempotente**: rodar `node ace db:seed` várias vezes não duplica nada. Verificado na
prática (seed rodado duas vezes seguidas, contagem de linhas conferida diretamente no
SQLite) e via login real do admin na UI.

## Visualizador: Drizzle Studio

Lucid continua sendo o único ORM da aplicação — ele é quem roda migrations e é a única
fonte de verdade do schema. O Drizzle entra só como **visualizador de dados** (`drizzle-kit`
+ `drizzle-orm` são devDependencies, nunca vão para produção):

```bash
npm run db:studio
```

Isso roda `drizzle-kit pull` (introspecta o banco apontado por `DB_CONNECTION` — a mesma
variável que `config/database.ts` usa — e gera `./drizzle/schema.ts`, não versionado) e
depois `drizzle-kit studio`, que abre uma UI web em `https://local.drizzle.studio` para
navegar/editar linhas.

`drizzle.config.ts` decide o dialeto (`sqlite` ou `postgresql`) lendo `DB_CONNECTION` do
processo em tempo de execução, então o mesmo comando funciona nos dois bancos sem editar
nada. Sempre que uma migration Lucid mudar o schema, rode `npm run db:studio` de novo (ele
já reaplica o `pull` a cada execução) para o Studio enxergar as tabelas/colunas novas.

A introspecção de SQLite do `drizzle-kit` precisa de um driver próprio — `@libsql/client`
(devDependency), escolhido em vez de `better-sqlite3` pelo mesmo motivo do driver de
produção da aplicação (ver `docs/deployment.md#galaxy-cloud`): publica binário
pré-compilado para as plataformas comuns, então não precisa compilar nada localmente.
