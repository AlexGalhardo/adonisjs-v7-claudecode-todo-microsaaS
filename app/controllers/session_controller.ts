import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import AccountDeletionService from '#services/account_deletion_service'
import { loginValidator } from '#validators/user'

@inject()
export default class SessionController {
  constructor(protected accountDeletionService: AccountDeletionService) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, response, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)

    // Read-only at this point — a password alone must never cancel a
    // pending deletion for a 2FA-enabled account; only denying on 'expired'
    // is safe to act on before the second factor is checked.
    const deletionStatus = this.accountDeletionService.checkOnLogin(user)
    if (deletionStatus === 'expired') {
      session.flash('error', 'This account has been deleted.')
      response.redirect().back()
      return
    }

    if (user.twoFactorConfirmedAt) {
      session.put('two_factor_user_id', user.id)
      response.redirect().toRoute('two_factor_challenges.create')
      return
    }

    if (deletionStatus === 'pending') {
      await this.accountDeletionService.cancelPendingDeletion(user)
      session.flash('success', 'Welcome back — your account deletion was cancelled.')
    }
    await auth.use('web').login(user)
    response.redirect().toRoute('dashboard')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect().toRoute('session.create')
  }
}
