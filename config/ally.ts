import { defineConfig, services } from '@adonisjs/ally'
import type { InferSocialProviders } from '@adonisjs/ally/types'
import env from '#start/env'

const allyConfig = defineConfig({
  /**
   * clientId/clientSecret default to an empty string when unset so the app can
   * boot without real OAuth credentials — the provider will simply fail to
   * authenticate until GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are set in .env.
   */
  google: services.google({
    clientId: env.get('GOOGLE_CLIENT_ID', ''),
    clientSecret: env.get('GOOGLE_CLIENT_SECRET', ''),
    callbackUrl: `${env.get('APP_URL')}/oauth/google/callback`,
  }),
  github: services.github({
    clientId: env.get('GITHUB_CLIENT_ID', ''),
    clientSecret: env.get('GITHUB_CLIENT_SECRET', ''),
    callbackUrl: `${env.get('APP_URL')}/oauth/github/callback`,
  }),
})

export default allyConfig

declare module '@adonisjs/ally/types' {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
