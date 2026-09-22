import type User from '#models/user'
import { BaseMail } from '@adonisjs/mail'
import { emailLayout } from '#mails/email_layout'

export default class MagicLinkNotification extends BaseMail {
  subject = 'Your login link'

  constructor(
    private user: User,
    public loginUrl: string
  ) {
    super()
  }

  prepare() {
    this.message.to(this.user.email)
    this.message.html(
      emailLayout({
        heading: 'Log in to Todo',
        message: `Click the button below to log in. This link expires in 15 minutes and can only be used once. If you didn't request this, you can safely ignore this email.`,
        actionUrl: this.loginUrl,
        actionLabel: 'Log in',
      })
    )
  }
}
