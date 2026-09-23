import { DateTime } from 'luxon'
import Stripe from 'stripe'
import stripeConfig from '#config/stripe'
import PaymentTransaction from '#models/payment_transaction'
import User from '#models/user'

export type TodoPlan = 'monthly' | 'annual'

/**
 * Thin wrapper around the Stripe SDK — every call site goes through here
 * instead of instantiating `Stripe` directly, so the "is Stripe configured
 * at all" check and the plan/price-id mapping live in exactly one place.
 */
export default class StripeService {
  #client: Stripe | null = null

  get isConfigured(): boolean {
    return Boolean(
      stripeConfig.secretKey && stripeConfig.prices.monthly && stripeConfig.prices.annual
    )
  }

  /**
   * Always call methods on an instantiated client (never the deprecated
   * `Stripe.setApiKey`/global-key pattern).
   */
  get client(): Stripe {
    if (!stripeConfig.secretKey) {
      throw new Error('Stripe is not configured — set STRIPE_SECRET_KEY.')
    }
    if (!this.#client) {
      this.#client = new Stripe(stripeConfig.secretKey)
    }
    return this.#client
  }

  priceIdFor(plan: TodoPlan): string {
    const priceId = stripeConfig.prices[plan]
    if (!priceId) {
      throw new Error(`Stripe is not configured — set STRIPE_PRICE_${plan.toUpperCase()}.`)
    }
    return priceId
  }

  planFor(priceId: string): TodoPlan | null {
    if (priceId === stripeConfig.prices.monthly) return 'monthly'
    if (priceId === stripeConfig.prices.annual) return 'annual'
    return null
  }

  /**
   * Finds (or creates) the Stripe customer for this user, persisting the id
   * so future calls reuse it instead of creating duplicate customers.
   */
  async customerIdFor(user: User): Promise<string> {
    if (user.stripeCustomerId) {
      return user.stripeCustomerId
    }

    const customer = await this.client.customers.create({
      email: user.email,
      name: user.fullName ?? undefined,
      metadata: { userId: String(user.id) },
    })

    user.stripeCustomerId = customer.id
    await user.save()

    return customer.id
  }

  async createCheckoutSession(user: User, plan: TodoPlan, baseUrl: string): Promise<string> {
    const customerId = await this.customerIdFor(user)

    const session = await this.client.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: String(user.id),
      line_items: [{ price: this.priceIdFor(plan), quantity: 1 }],
      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/checkout`,
    })

    if (!session.url) {
      throw new Error('Stripe did not return a Checkout Session URL.')
    }
    return session.url
  }

  async createBillingPortalSession(user: User, baseUrl: string): Promise<string> {
    const customerId = await this.customerIdFor(user)

    const session = await this.client.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/profile`,
    })

    return session.url
  }

  constructWebhookEvent(rawBody: string, signature: string): Stripe.Event {
    if (!stripeConfig.webhookSecret) {
      throw new Error('Stripe is not configured — set STRIPE_WEBHOOK_SECRET.')
    }
    return this.client.webhooks.constructEvent(rawBody, signature, stripeConfig.webhookSecret)
  }

  /**
   * Applies a subscription's current state to the owning user — the single
   * place that writes subscriptionStatus/Plan/currentPeriodEnd, called from
   * every webhook event that carries a subscription object.
   */
  async syncSubscription(user: User, subscription: Stripe.Subscription): Promise<void> {
    const item = subscription.items.data[0]
    const plan = item ? this.planFor(item.price.id) : null

    user.stripeSubscriptionId = subscription.id
    user.subscriptionStatus = subscription.status
    user.subscriptionPlan = plan
    user.currentPeriodEnd = item ? DateTime.fromSeconds(item.current_period_end) : null
    await user.save()
  }

  /**
   * Idempotent by `stripeEventId` — Stripe retries webhook deliveries, so the
   * same event can arrive more than once.
   */
  async logTransaction(
    user: User,
    event: Stripe.Event,
    fields: { status: string; amount?: number | null; currency?: string | null }
  ): Promise<void> {
    const existing = await PaymentTransaction.findBy('stripeEventId', event.id)
    if (existing) return

    await PaymentTransaction.create({
      userId: user.id,
      stripeEventId: event.id,
      type: event.type,
      status: fields.status,
      amount: fields.amount ?? null,
      currency: fields.currency ?? null,
    })
  }
}
