import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import AccountDeletionService from '#services/account_deletion_service'
import TwoFactorService from '#services/two_factor_service'
import { twoFactorChallengeValidator } from '#validators/two_factor'

const PENDING_USER_SESSION_KEY = 'two_factor_user_id'

@inject()
export default class TwoFactorChallengesController {
  constructor(
    protected twoFactorService: TwoFactorService,
    protected accountDeletionService: AccountDeletionService
  ) {}

  async create({ inertia, session, response }: HttpContext) {
    if (!session.get(PENDING_USER_SESSION_KEY)) {
      response.redirect().toRoute('session.create')
      return
    }

    return inertia.render('auth/two_factor_challenge', {})
  }

  async store({ request, session, auth, response }: HttpContext) {
    const userId = session.get(PENDING_USER_SESSION_KEY) as number | undefined
    if (!userId) {
      response.redirect().toRoute('session.create')
      return
    }

    const { code } = await request.validateUsing(twoFactorChallengeValidator)
    const user = await User.findOrFail(userId)
    const isValid = await this.twoFactorService.verifyChallenge(user, code)

    if (!isValid) {
      session.flash('error', 'That code did not match. Please try again.')
      response.redirect().back()
      return
    }

    session.forget(PENDING_USER_SESSION_KEY)

    // The second factor is now verified — safe to act on a pending
    // deletion (see AccountDeletionService for why this can't happen on
    // the password step alone).
    const deletionStatus = this.accountDeletionService.checkOnLogin(user)
    if (deletionStatus === 'expired') {
      session.flash('error', 'This account has been deleted.')
      response.redirect().toRoute('session.create')
      return
    }
    if (deletionStatus === 'pending') {
      await this.accountDeletionService.cancelPendingDeletion(user)
      session.flash('success', 'Welcome back — your account deletion was cancelled.')
    }

    await auth.use('web').login(user)
    response.redirect().toRoute('dashboard')
  }
}
