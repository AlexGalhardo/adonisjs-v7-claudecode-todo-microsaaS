import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import qrcode from 'qrcode'
import TwoFactorService from '#services/two_factor_service'
import { confirmTwoFactorValidator } from '#validators/two_factor'

const PENDING_SECRET_SESSION_KEY = 'pending_2fa_secret'

/**
 * Two-factor is managed from a modal on /profile, not a dedicated page — every
 * action here is a plain JSON endpoint the modal calls via `fetch`, never an
 * Inertia page render or a redirect.
 */
@inject()
export default class TwoFactorSettingsController {
  constructor(protected twoFactorService: TwoFactorService) {}

  async create({ auth, session, response }: HttpContext) {
    const user = auth.user!

    if (user.twoFactorConfirmedAt) {
      return response.json({ enabled: true })
    }

    let pendingSecret = session.get(PENDING_SECRET_SESSION_KEY) as string | undefined
    if (!pendingSecret) {
      pendingSecret = this.twoFactorService.generatePendingSecret()
      session.put(PENDING_SECRET_SESSION_KEY, pendingSecret)
    }

    const qrCode = await qrcode.toDataURL(this.twoFactorService.keyUri(pendingSecret, user))

    return response.json({ enabled: false, secret: pendingSecret, qrCode })
  }

  async store({ request, auth, session, response }: HttpContext) {
    const user = auth.user!
    const { code } = await request.validateUsing(confirmTwoFactorValidator)
    const pendingSecret = session.get(PENDING_SECRET_SESSION_KEY) as string | undefined

    if (!pendingSecret) {
      return response.badRequest({ error: 'Your enrollment session expired. Please try again.' })
    }

    const recoveryCodes = await this.twoFactorService.confirm(user, pendingSecret, code)

    if (!recoveryCodes) {
      return response.badRequest({ error: 'That code did not match. Please try again.' })
    }

    session.forget(PENDING_SECRET_SESSION_KEY)

    return response.json({ enabled: true, recoveryCodes })
  }

  async destroy({ auth, response }: HttpContext) {
    await this.twoFactorService.disable(auth.user!)

    return response.json({ enabled: false })
  }
}
