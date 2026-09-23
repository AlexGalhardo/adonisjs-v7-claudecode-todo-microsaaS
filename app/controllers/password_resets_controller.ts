import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import PasswordResetNotification from '#mails/password_reset_notification'
import User from '#models/user'
import AuthTokenService from '#services/auth_token_service'
import { forgotPasswordValidator, resetPasswordValidator } from '#validators/password_reset'

const RESET_TOKEN_TTL_MINUTES = 60

@inject()
export default class PasswordResetsController {
  constructor(protected authTokenService: AuthTokenService) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/forgot_password', {})
  }

  async store({ request, response, session }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)
    const user = await User.findBy('email', email)

    if (user) {
      const token = await this.authTokenService.create(
        user,
        'password_reset',
        RESET_TOKEN_TTL_MINUTES
      )
      const resetUrl = `${request.protocol()}://${request.host()}/reset-password/${token}`
      await mail.send(new PasswordResetNotification(user, resetUrl))
    }

    // Same response whether the email exists or not — avoids leaking which
    // addresses have an account.
    session.flash('success', 'If that email is registered, a reset link is on its way.')
    response.redirect().toRoute('session.create')
  }

  async edit({ inertia, params }: HttpContext) {
    return inertia.render('auth/reset_password', { token: params.token })
  }

  async update({ request, response, auth, session }: HttpContext) {
    const payload = await request.validateUsing(resetPasswordValidator)
    const record = await this.authTokenService.verify(payload.token, 'password_reset')

    if (!record) {
      session.flash('error', 'This password reset link is invalid or has expired.')
      response.redirect().back()
      return
    }

    const user = record.user
    user.password = payload.password
    await user.save()
    await this.authTokenService.consume(record)

    await auth.use('web').login(user)
    session.flash('success', 'Your password has been reset.')
    response.redirect().toRoute('dashboard')
  }
}
