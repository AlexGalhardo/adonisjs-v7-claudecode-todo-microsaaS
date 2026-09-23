import env from '#start/env'

/**
 * Plain config object (not a Stripe client) — kept separate from
 * app/services/stripe_service.ts so nothing here needs the `stripe` package
 * itself, and so the app still boots with Stripe unconfigured (see
 * StripeService#isConfigured).
 */
const stripeConfig = {
  secretKey: env.get('STRIPE_SECRET_KEY'),
  publishableKey: env.get('STRIPE_PUBLISHABLE_KEY'),
  webhookSecret: env.get('STRIPE_WEBHOOK_SECRET'),

  /**
   * Both prices belong to the same Stripe Product (a single "Pro" plan) —
   * monthly and annual are billing variants of it, not separate products.
   * See docs/billing.md for how these are created.
   */
  prices: {
    monthly: env.get('STRIPE_PRICE_MONTHLY'),
    annual: env.get('STRIPE_PRICE_ANNUAL'),
  },

  /** Todos a user can create before a paid plan is required. */
  freeTodoLimit: 10,
} as const

export default stripeConfig
