import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import MagicLinkNotification from '#mails/magic_link_notification'
import User from '#models/user'
import AccountDeletionService from '#services/account_deletion_service'
import AuthTokenService from '#services/auth_token_service'
import { requestMagicLinkValidator } from '#validators/magic_link'

const MAGIC_LINK_TTL_MINUTES = 15

@inject()
export default class MagicLinksController {
  constructor(
    protected authTokenService: AuthTokenService,
    protected accountDeletionService: AccountDeletionService
  ) {}

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

    // No second factor to wait for in this flow — consuming the token IS
    // full authentication, so it's safe to check and cancel together here
    // (unlike the password step in SessionController, which can lead into
    // a 2FA challenge before login is actually complete).
    const deletionStatus = this.accountDeletionService.checkOnLogin(record.user)
    if (deletionStatus === 'expired') {
      session.flash('error', 'This account has been deleted.')
      response.redirect().toRoute('session.create')
      return
    }
    if (deletionStatus === 'pending') {
      await this.accountDeletionService.cancelPendingDeletion(record.user)
      session.flash('success', 'Welcome back — your account deletion was cancelled.')
    }

    await auth.use('web').login(record.user)
    response.redirect().toRoute('dashboard')
  }
}
