import { BaseMail } from '@adonisjs/mail'
import { EmailLayout } from '#mails/components/email_layout'
import { renderEmail } from '#mails/render'
import type User from '#models/user'

export default class PasswordResetNotification extends BaseMail {
  subject = 'Reset your password'

  constructor(
    private user: User,
    public resetUrl: string
  ) {
    super()
  }

  async prepare() {
    this.message.to(this.user.email)
    this.message.html(
      await renderEmail(
        EmailLayout({
          previewText: 'Reset your password',
          heading: 'Reset your password',
          message: `We received a request to reset the password for your account. This link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
          actionUrl: this.resetUrl,
          actionLabel: 'Reset password',
        })
      )
    )
  }
}
