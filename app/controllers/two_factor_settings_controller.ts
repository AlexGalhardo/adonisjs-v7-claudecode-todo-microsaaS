import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import qrcode from 'qrcode'
import TwoFactorService from '#services/two_factor_service'
import { confirmTwoFactorValidator } from '#validators/two_factor'

const PENDING_SECRET_SESSION_KEY = 'pending_2fa_secret'

@inject()
export default class TwoFactorSettingsController {
  constructor(protected twoFactorService: TwoFactorService) {}

  async create({ inertia, auth, session }: HttpContext) {
    const user = auth.user!

    if (user.twoFactorConfirmedAt) {
      return inertia.render('settings/two_factor', { enabled: true })
    }

    let pendingSecret = session.get(PENDING_SECRET_SESSION_KEY) as string | undefined
    if (!pendingSecret) {
      pendingSecret = this.twoFactorService.generatePendingSecret()
      session.put(PENDING_SECRET_SESSION_KEY, pendingSecret)
    }

    const qrCode = await qrcode.toDataURL(this.twoFactorService.keyUri(pendingSecret, user))

    return inertia.render('settings/two_factor', {
      enabled: false,
      secret: pendingSecret,
      qrCode,
    })
  }

  async store({ request, auth, session, response, inertia }: HttpContext) {
    const user = auth.user!
    const { code } = await request.validateUsing(confirmTwoFactorValidator)
    const pendingSecret = session.get(PENDING_SECRET_SESSION_KEY) as string | undefined

    if (!pendingSecret) {
      response.redirect().toRoute('two_factor_settings.create')
      return
    }

    const recoveryCodes = await this.twoFactorService.confirm(user, pendingSecret, code)

    if (!recoveryCodes) {
      session.flash('error', 'That code did not match. Please try again.')
      response.redirect().back()
      return
    }

    session.forget(PENDING_SECRET_SESSION_KEY)

    return inertia.render('settings/two_factor', {
      enabled: true,
      recoveryCodes,
    })
  }

  async destroy({ auth, response, session }: HttpContext) {
    await this.twoFactorService.disable(auth.user!)

    session.flash('success', 'Two-factor authentication has been disabled.')
    response.redirect().toRoute('two_factor_settings.create')
  }
}
