import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import StripeService from '#services/stripe_service'
import env from '#start/env'

@inject()
export default class BillingPortalController {
  constructor(protected stripeService: StripeService) {}

  async create({ auth, response, session, inertia }: HttpContext) {
    const user = auth.user!

    if (!user.stripeCustomerId || !this.stripeService.isConfigured) {
      session.flash('error', 'No billing account found yet.')
      response.redirect().back()
      return
    }

    let url: string
    try {
      url = await this.stripeService.createBillingPortalSession(user, env.get('APP_URL'))
    } catch (error) {
      logger.error({ err: error }, 'Failed to create Stripe Billing Portal session')
      session.flash('error', 'Something went wrong opening the billing portal. Please try again.')
      response.redirect().back()
      return
    }

    inertia.location(url)
  }
}
