# How SQLite/PostgreSQL switching works in this project

`config/database.ts` reads the active connection from `env.get('DB_CONNECTION')`
(`'sqlite' | 'pg'`, validated in `start/env.ts`). Both connections are defined side by
side; switching drivers is purely an env change — never touch `config/database.ts` for
this.

```bash
# .env
DB_CONNECTION=sqlite            # zero setup, default for local dev

DB_CONNECTION=pg                # local (native/Docker) or production
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=ado
```

`DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_DATABASE` are declared `.optional()` in
`start/env.ts` because the SQLite driver doesn't use them.

## Verifying the switch actually works

Don't just trust the config — prove it migrates cleanly against a real Postgres:

```bash
docker run -d --rm --name pg-verify -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ado -p 55432:5432 postgres:17-alpine
DB_CONNECTION=pg DB_HOST=localhost DB_PORT=55432 DB_USER=postgres DB_PASSWORD=postgres DB_DATABASE=ado node ace migration:run
docker stop pg-verify
```

## Test database isolation

`config/database.ts`'s SQLite connection uses `app.inTest` to point at
`tmp/db_test.sqlite3` instead of `tmp/db.sqlite3`, so `node ace test` never touches the
dev database. `.env.test` pins `DB_CONNECTION=sqlite` regardless of what `.env` uses, so
the suite never needs a Postgres instance running. To run the suite against Postgres
instead, override `DB_CONNECTION=pg` + a distinct `DB_DATABASE` in `.env.test`.

Remember to migrate the test database separately after adding a migration:

```bash
NODE_ENV=test node ace migration:run
```
