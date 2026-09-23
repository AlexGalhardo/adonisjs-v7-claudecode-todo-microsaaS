import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('stripe_customer_id').nullable().unique()
      table.string('stripe_subscription_id').nullable().unique()
      // Mirrors the Stripe subscription `status` field verbatim (active,
      // trialing, past_due, canceled, unpaid, etc.) — set/kept in sync only
      // by the webhook handler, never assumed from a client request.
      table.string('subscription_status').nullable()
      table.enum('subscription_plan', ['monthly', 'annual']).nullable()
      table.timestamp('current_period_end').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('stripe_customer_id')
      table.dropColumn('stripe_subscription_id')
      table.dropColumn('subscription_status')
      table.dropColumn('subscription_plan')
      table.dropColumn('current_period_end')
    })
  }
}
