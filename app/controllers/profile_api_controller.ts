import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { createTokenValidator } from '#validators/api_token'

/**
 * Self-service API token management for the authenticated web user — no
 * password re-entry needed, unlike POST /api/login. The plain token value is
 * only ever available once, right after creation (AccessToken only persists
 * its hash), so `store` flashes it back for the page to show a one-time
 * "copy this now" reveal.
 */
export default class ProfileApiController {
  async index({ inertia, auth, session }: HttpContext) {
    const tokens = await User.accessTokens.all(auth.user!)

    return inertia.render('profile/api', {
      tokens: tokens.map((token) => ({
        id: String(token.identifier),
        name: token.name,
        createdAt: token.createdAt.toISOString(),
        lastUsedAt: token.lastUsedAt?.toISOString() ?? null,
        expiresAt: token.expiresAt?.toISOString() ?? null,
      })),
      newToken: session.flashMessages.get('newApiToken') as string | undefined,
    })
  }

  async store({ request, response, auth, session }: HttpContext) {
    const { name } = await request.validateUsing(createTokenValidator)
    const token = await User.accessTokens.create(auth.user!, ['*'], {
      name,
      expiresIn: '1 year',
    })

    session.flash('newApiToken', token.value!.release())
    response.redirect().back()
  }

  async destroy({ params, response, auth, session }: HttpContext) {
    await User.accessTokens.delete(auth.user!, params.id)

    session.flash('success', 'Token revoked.')
    response.redirect().back()
  }
}
