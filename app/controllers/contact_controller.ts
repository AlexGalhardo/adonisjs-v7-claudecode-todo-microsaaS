import mail from '@adonisjs/mail/services/main'
import { contactValidator } from '#validators/contact'
import ContactNotification from '#mails/contact_notification'
import type { HttpContext } from '@adonisjs/core/http'

export default class ContactController {
  async create({ inertia }: HttpContext) {
    return inertia.render('contact', {})
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(contactValidator)
    await mail.send(new ContactNotification(payload))

    session.flash('success', "Message sent — we'll get back to you soon.")
    response.redirect().back()
  }
}
