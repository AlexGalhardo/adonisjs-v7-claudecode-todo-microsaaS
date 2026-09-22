import User from '#models/user'
import { randomBytes } from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'

const PROVIDERS = ['google', 'github'] as const
type Provider = (typeof PROVIDERS)[number]

function isSupportedProvider(value: string): value is Provider {
  return (PROVIDERS as readonly string[]).includes(value)
}

export default class SocialAuthsController {
  async redirect({ params, ally, response }: HttpContext) {
    if (!isSupportedProvider(params.provider)) {
      return response.notFound()
    }

    return ally.use(params.provider).redirect()
  }

  async callback({ params, ally, auth, response, session }: HttpContext) {
    if (!isSupportedProvider(params.provider)) {
      return response.notFound()
    }

    const provider = ally.use(params.provider)

    if (provider.accessDenied() || provider.stateMisMatch() || provider.hasError()) {
      session.flash('error', 'Something went wrong while signing in. Please try again.')
      response.redirect().toRoute('session.create')
      return
    }

    const socialUser = await provider.user()
    if (!socialUser.email) {
      session.flash(
        'error',
        `Your ${params.provider} account has no public email address to sign in with.`
      )
      response.redirect().toRoute('session.create')
      return
    }

    let user = await User.findBy('email', socialUser.email)
    if (!user) {
      // Social accounts never use this password to log in (only the OAuth
      // flow does), but the column is NOT NULL — generate one they'll never
      // need instead of relaxing the schema for every user.
      user = await User.create({
        email: socialUser.email,
        fullName: socialUser.name,
        password: randomBytes(32).toString('hex'),
      })
    }

    await auth.use('web').login(user)
    response.redirect().toRoute('todos.index')
  }
}
