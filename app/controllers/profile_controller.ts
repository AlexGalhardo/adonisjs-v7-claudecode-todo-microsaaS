import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AccountDeletionService from '#services/account_deletion_service'
import { updateNameValidator, updatePasswordValidator } from '#validators/profile'

@inject()
export default class ProfileController {
  constructor(protected accountDeletionService: AccountDeletionService) {}

  async show({ inertia, auth }: HttpContext) {
    const user = auth.user!

    return inertia.render('profile/index', {
      twoFactorEnabled: !!user.twoFactorConfirmedAt,
    })
  }

  async updateName({ request, auth, response, session }: HttpContext) {
    const { fullName } = await request.validateUsing(updateNameValidator)
    const user = auth.user!

    user.fullName = fullName
    await user.save()

    session.flash('success', 'Name updated.')
    response.redirect().back()
  }

  async updatePassword({ request, auth, response, session }: HttpContext) {
    const payload = await request.validateUsing(updatePasswordValidator)
    const user = auth.user!

    if (!(await user.verifyPassword(payload.currentPassword))) {
      session.flash('error', 'Current password is incorrect.')
      response.redirect().back()
      return
    }

    user.password = payload.password
    await user.save()

    session.flash('success', 'Password updated.')
    response.redirect().back()
  }

  async destroy({ auth, response, session }: HttpContext) {
    const user = auth.user!

    await this.accountDeletionService.requestDeletion(user)
    await auth.use('web').logout()

    session.flash(
      'success',
      'Your account is scheduled for deletion. Log back in within 30 days to cancel it.'
    )
    response.redirect().toRoute('session.create')
  }
}
