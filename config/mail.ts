import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'
import type { InferMailers } from '@adonisjs/mail/types'

const mailConfig = defineConfig({
  default: 'smtp',

  from: {
    address: env.get('MAIL_FROM_ADDRESS'),
    name: env.get('MAIL_FROM_NAME'),
  },

  mailers: (() => {
    const smtpUsername = env.get('SMTP_USERNAME')

    /**
     * SMTP works for both a local dev inbox (e.g. Mailpit, see infra/docker-compose.yml)
     * and a real provider in production — only the env vars change.
     */
    return {
      smtp: transports.smtp({
        host: env.get('SMTP_HOST'),
        port: env.get('SMTP_PORT'),
        auth: smtpUsername
          ? {
              type: 'login',
              user: smtpUsername,
              pass: env.get('SMTP_PASSWORD', ''),
            }
          : undefined,
      }),
    }
  })(),
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
