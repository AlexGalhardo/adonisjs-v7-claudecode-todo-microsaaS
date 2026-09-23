import { randomBytes } from 'node:crypto'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import User from '#models/user'
import AccountDeletionService from '#services/account_deletion_service'

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
      response.redirect().withQs(false).toRoute('session.create')
      return
    }

    // provider.user() makes real HTTP calls to the provider's token/userinfo
    // endpoints — a network hiccup, a misconfigured client secret, or an API
    // response shape change would otherwise bubble up as an unhandled 500.
    // Log the real error server-side and degrade to a friendly redirect.
    let socialUser: Awaited<ReturnType<typeof provider.user>>
    try {
      socialUser = await provider.user()
    } catch (error) {
      logger.error({ err: error, provider: params.provider }, 'OAuth callback failed')
      session.flash('error', 'Something went wrong while signing in. Please try again.')
      response.redirect().withQs(false).toRoute('session.create')
      return
    }

    if (!socialUser.email) {
      session.flash(
        'error',
        `Your ${params.provider} account has no public email address to sign in with.`
      )
      response.redirect().withQs(false).toRoute('session.create')
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

    // The OAuth round-trip is itself the whole authentication — no second
    // factor gate in between — so it's safe to check and cancel together.
    const deletionStatus = this.accountDeletionService.checkOnLogin(user)
    if (deletionStatus === 'expired') {
      session.flash('error', 'This account has been deleted.')
      response.redirect().withQs(false).toRoute('session.create')
      return
    }
    if (deletionStatus === 'pending') {
      await this.accountDeletionService.cancelPendingDeletion(user)
      session.flash('success', 'Welcome back — your account deletion was cancelled.')
    }

    await auth.use('web').login(user)
    response.redirect().withQs(false).toRoute('dashboard')
  }
}
