import User from '#models/user'
import { inject } from '@adonisjs/core'
import { randomBytes } from 'node:crypto'
import AccountDeletionService from '#services/account_deletion_service'
import type { HttpContext } from '@adonisjs/core/http'

const PROVIDERS = ['google', 'github'] as const
type Provider = (typeof PROVIDERS)[number]

function isSupportedProvider(value: string): value is Provider {
  return (PROVIDERS as readonly string[]).includes(value)
}

@inject()
export default class SocialAuthsController {
  constructor(protected accountDeletionService: AccountDeletionService) {}
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

    const deletionStatus = await this.accountDeletionService.checkOnLogin(user)
    if (deletionStatus === 'expired') {
      session.flash('error', 'This account has been deleted.')
      response.redirect().toRoute('session.create')
      return
    }

    await auth.use('web').login(user)
    if (deletionStatus === 'cancelled') {
      session.flash('success', 'Welcome back — your account deletion was cancelled.')
    }
    response.redirect().toRoute('dashboard')
  }
}
