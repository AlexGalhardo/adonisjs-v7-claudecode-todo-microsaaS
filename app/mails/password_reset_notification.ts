import type User from '#models/user'
import { BaseMail } from '@adonisjs/mail'
import { emailLayout } from '#mails/email_layout'

export default class PasswordResetNotification extends BaseMail {
  subject = 'Reset your password'

  constructor(
    private user: User,
    public resetUrl: string
  ) {
    super()
  }

  prepare() {
    this.message.to(this.user.email)
    this.message.html(
      emailLayout({
        heading: 'Reset your password',
        message: `We received a request to reset the password for your account. This link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
        actionUrl: this.resetUrl,
        actionLabel: 'Reset password',
      })
    )
  }
}
