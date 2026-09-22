import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/limiter'
import type { InferLimiters } from '@adonisjs/limiter/types'

const limiterConfig = defineConfig({
  default: env.get('LIMITER_STORE'),
  stores: {
    /**
     * Database store — no extra infrastructure (Redis) needed, backed by the
     * same SQLite/Postgres connection already configured for the app.
     */
    database: stores.database({
      tableName: 'rate_limits',
    }),

    /**
     * Memory store, used during tests so rate limiting never depends on the
     * database transaction wrapping each test.
     */
    memory: stores.memory({}),
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
