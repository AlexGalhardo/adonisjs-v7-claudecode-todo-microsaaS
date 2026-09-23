import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import StripeService, { type TodoPlan } from '#services/stripe_service'
import env from '#start/env'

const PLANS = ['monthly', 'annual'] as const

function isPlan(value: string): value is TodoPlan {
  return (PLANS as readonly string[]).includes(value)
}

@inject()
export default class CheckoutController {
  constructor(protected stripeService: StripeService) {}

  async show({ inertia, auth, response }: HttpContext) {
    const user = auth.user!

    // Someone with an active/trialing subscription has nothing to buy here.
    if (user.hasActiveSubscription) {
      response.redirect().toRoute('profile.show')
      return
    }

    return inertia.render('checkout', {
      stripeConfigured: this.stripeService.isConfigured,
      prices: { monthly: 2.99, annual: 29.9 },
    })
  }

  async create({ params, auth, response, session, inertia }: HttpContext) {
    const user = auth.user!

    if (!isPlan(params.plan)) {
      response.notFound()
      return
    }
    if (user.hasActiveSubscription) {
      response.redirect().toRoute('profile.show')
      return
    }
    if (!this.stripeService.isConfigured) {
      session.flash('error', 'Payments are not configured yet.')
      response.redirect().back()
      return
    }

    let url: string
    try {
      url = await this.stripeService.createCheckoutSession(user, params.plan, env.get('APP_URL'))
    } catch (error) {
      logger.error({ err: error }, 'Failed to create Stripe Checkout Session')
      session.flash('error', 'Something went wrong starting checkout. Please try again.')
      response.redirect().back()
      return
    }

    inertia.location(url)
  }

  async success({ session, response }: HttpContext) {
    // The actual subscription activation happens asynchronously via the
    // `checkout.session.completed` webhook — this page never fulfills
    // anything itself, it's just where Stripe sends the browser back to.
    session.flash('success', 'Subscription activated! It may take a few seconds to show up.')
    response.redirect().toRoute('dashboard')
  }
}
