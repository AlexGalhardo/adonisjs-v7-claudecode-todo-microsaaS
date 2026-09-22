import User from '#models/user'
import mail from '@adonisjs/mail/services/main'
import { inject } from '@adonisjs/core'
import AuthTokenService from '#services/auth_token_service'
import MagicLinkNotification from '#mails/magic_link_notification'
import { requestMagicLinkValidator } from '#validators/magic_link'
import type { HttpContext } from '@adonisjs/core/http'

const MAGIC_LINK_TTL_MINUTES = 15

@inject()
export default class MagicLinksController {
  constructor(protected authTokenService: AuthTokenService) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/magic_link', {})
  }

  async store({ request, response, session }: HttpContext) {
    const { email } = await request.validateUsing(requestMagicLinkValidator)
    const user = await User.findBy('email', email)

    if (user) {
      const token = await this.authTokenService.create(user, 'magic_link', MAGIC_LINK_TTL_MINUTES)
      const loginUrl = `${request.protocol()}://${request.host()}/magic-link/${token}`
      await mail.send(new MagicLinkNotification(user, loginUrl))
    }

    session.flash('success', 'If that email is registered, a login link is on its way.')
    response.redirect().toRoute('session.create')
  }

  async consume({ params, auth, response, session }: HttpContext) {
    const record = await this.authTokenService.verify(params.token, 'magic_link')

    if (!record) {
      session.flash('error', 'This login link is invalid or has expired.')
      response.redirect().toRoute('session.create')
      return
    }

    await this.authTokenService.consume(record)
    await auth.use('web').login(record.user)

    response.redirect().toRoute('todos.index')
  }
}
