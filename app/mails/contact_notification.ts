import { BaseMail } from '@adonisjs/mail'
import { ContactNotification as ContactNotificationEmail } from '#mails/components/contact_notification'
import { renderEmail } from '#mails/render'
import env from '#start/env'

export default class ContactNotification extends BaseMail {
  subject = 'New contact form message'

  constructor(
    private payload: {
      fullName: string
      email: string
      subject: 'bug' | 'suggestion' | 'other'
      message: string
    }
  ) {
    super()
  }

  async prepare() {
    // Notify the app's own mailbox, but let the admin reply straight to the
    // person who wrote in — Resend's "from" must stay a verified address.
    this.message.to(env.get('MAIL_FROM_ADDRESS'))
    this.message.replyTo(this.payload.email)
    this.message.html(await renderEmail(ContactNotificationEmail(this.payload)))
  }
}
