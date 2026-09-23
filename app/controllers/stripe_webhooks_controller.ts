import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import type Stripe from 'stripe'
import User from '#models/user'
import StripeService from '#services/stripe_service'

/**
 * Subscription state (active/canceled/past_due/...) only ever changes here —
 * never on the Checkout success page, which is just where the browser lands
 * and can't be trusted to fire reliably (closed tab, network blip, etc.).
 * See docs/billing.md.
 */
@inject()
export default class StripeWebhooksController {
  constructor(protected stripeService: StripeService) {}

  async handle({ request, response }: HttpContext) {
    const signature = request.header('stripe-signature')
    const rawBody = request.raw()

    if (!signature || !rawBody) {
      return response.badRequest('Missing signature or body')
    }

    let event: Stripe.Event
    try {
      event = this.stripeService.constructWebhookEvent(rawBody, signature)
    } catch (error) {
      logger.warn({ err: error }, 'Stripe webhook signature verification failed')
      return response.badRequest('Invalid signature')
    }

    try {
      await this.dispatch(event)
    } catch (error) {
      logger.error({ err: error, eventType: event.type }, 'Stripe webhook handler failed')
      // Still ack with 2xx isn't right here — a 500 makes Stripe retry the
      // delivery, which is what we want for a transient failure (e.g. a
      // momentary DB hiccup) rather than silently losing the event.
      return response.internalServerError()
    }

    return response.ok({ received: true })
  }

  private async dispatch(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status === 'unpaid') return
        await this.onCheckoutCompleted(event, session)
        return
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await this.onSubscriptionChanged(subscription)
        return
      }
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await this.onInvoiceEvent(event, invoice)
        return
      }
      default:
        return
    }
  }

  private async onCheckoutCompleted(event: Stripe.Event, session: Stripe.Checkout.Session) {
    const user = await this.findUser(session.client_reference_id, session.customer)
    if (!user) return

    if (typeof session.subscription === 'string') {
      const subscription = await this.stripeService.client.subscriptions.retrieve(
        session.subscription
      )
      await this.stripeService.syncSubscription(user, subscription)
    }

    await this.stripeService.logTransaction(user, event, {
      status: 'succeeded',
      amount: session.amount_total,
      currency: session.currency,
    })
  }

  private async onSubscriptionChanged(subscription: Stripe.Subscription) {
    const user = await this.findUser(null, subscription.customer)
    if (!user) return

    await this.stripeService.syncSubscription(user, subscription)
  }

  private async onInvoiceEvent(event: Stripe.Event, invoice: Stripe.Invoice) {
    const user = await this.findUser(null, invoice.customer)
    if (!user) return

    await this.stripeService.logTransaction(user, event, {
      status: event.type === 'invoice.paid' ? 'succeeded' : 'failed',
      amount: invoice.amount_paid || invoice.amount_due,
      currency: invoice.currency,
    })
  }

  private async findUser(
    clientReferenceId: string | null | undefined,
    customerId: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined
  ) {
    if (clientReferenceId) {
      const user = await User.find(Number(clientReferenceId))
      if (user) return user
    }
    if (typeof customerId === 'string') {
      return User.findBy('stripeCustomerId', customerId)
    }
    return null
  }
}
