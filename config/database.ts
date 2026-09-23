import { mkdirSync } from 'node:fs'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'
import env from '#start/env'

/**
 * `tmp/` only ships in the production build via .gitkeep (see adonisrc.ts
 * metaFiles) — some deploy targets (e.g. Galaxy Cloud, which builds with
 * `node ace build` directly and never runs infra/Dockerfile's `mkdir -p tmp`)
 * can still end up without it, which makes the sqlite3 driver fail with
 * SQLITE_CANTOPEN instead of creating the file. Guarantee the directory
 * exists before Lucid ever tries to open the database file.
 */
mkdirSync(app.tmpPath(), { recursive: true })

const dbConfig = defineConfig({
  /**
   * Default connection used for all queries. Driven entirely by DB_CONNECTION so
   * switching between SQLite and PostgreSQL never requires touching code.
   */
  connection: env.get('DB_CONNECTION'),

  connections: {
    /**
     * SQLite connection — used for local development, no external service required.
     */
    sqlite: {
      client: 'sqlite3',

      connection: {
        /**
         * A dedicated file for the test environment keeps the test suite from
         * touching (and truncating) the local development database.
         */
        filename: app.tmpPath(app.inTest ? 'db_test.sqlite3' : 'db.sqlite3'),
      },

      /**
       * Required by Knex for SQLite defaults.
       */
      useNullAsDefault: true,

      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },

      /**
       * Custom rules (e.g. serializeAs: null for sensitive columns) applied
       * when generating database/schema.ts from migrations.
       */
      schemaGeneration: {
        rulesPaths: ['#database/schema_rules'],
      },
    },

    /**
     * PostgreSQL connection — used for local development (via Docker or a native
     * install) and production.
     */
    pg: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      schemaGeneration: {
        rulesPaths: ['#database/schema_rules'],
      },
      debug: app.inDev,
    },
  },
})

export default dbConfig
