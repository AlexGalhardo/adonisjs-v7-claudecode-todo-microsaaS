import type User from '#models/user'
import { BaseMail } from '@adonisjs/mail'
import { renderEmail } from '#mails/render'
import { EmailLayout } from '#mails/components/email_layout'

export default class MagicLinkNotification extends BaseMail {
  subject = 'Your login link'

  constructor(
    private user: User,
    public loginUrl: string
  ) {
    super()
  }

  async prepare() {
    this.message.to(this.user.email)
    this.message.html(
      await renderEmail(
        EmailLayout({
          previewText: 'Log in to Todo',
          heading: 'Log in to Todo',
          message: `Click the button below to log in. This link expires in 15 minutes and can only be used once. If you didn't request this, you can safely ignore this email.`,
          actionUrl: this.loginUrl,
          actionLabel: 'Log in',
        })
      )
    )
  }
}
