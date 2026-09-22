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

Ver `database/migrations/` para o histórico de schema e `database/seeders/` para os dados
de desenvolvimento (detalhado quando a Fase 5 do `TODO.md` for concluída).
