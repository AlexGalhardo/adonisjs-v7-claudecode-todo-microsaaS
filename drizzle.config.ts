import { defineConfig } from 'drizzle-kit'

/**
 * Drizzle Studio is used ONLY as a read/write database viewer (`npm run db:studio`)
 * — Lucid remains the app's ORM and the only thing that owns migrations
 * (`node ace migration:run`). This file lets `drizzle-kit` introspect whichever
 * database `DB_CONNECTION` points at, matching config/database.ts. Run
 * `npx drizzle-kit pull` again after any Lucid migration so Studio picks up new
 * tables/columns — `./drizzle` (the generated schema snapshot) is gitignored.
 */
const isPostgres = process.env.DB_CONNECTION === 'pg'

export default isPostgres
  ? defineConfig({
      dialect: 'postgresql',
      out: './drizzle',
      dbCredentials: {
        host: process.env.DB_HOST!,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE!,
      },
    })
  : defineConfig({
      dialect: 'sqlite',
      out: './drizzle',
      dbCredentials: {
        url: './tmp/db.sqlite3',
      },
    })
