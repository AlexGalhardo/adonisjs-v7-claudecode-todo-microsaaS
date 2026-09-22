import User from '#models/user'
import { inject } from '@adonisjs/core'
import TwoFactorService from '#services/two_factor_service'
import { twoFactorChallengeValidator } from '#validators/two_factor'
import type { HttpContext } from '@adonisjs/core/http'

const PENDING_USER_SESSION_KEY = 'two_factor_user_id'

@inject()
export default class TwoFactorChallengesController {
  constructor(protected twoFactorService: TwoFactorService) {}

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
    await auth.use('web').login(user)

    response.redirect().toRoute('todos.index')
  }
}
