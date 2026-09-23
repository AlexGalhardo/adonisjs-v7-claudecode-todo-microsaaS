import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payment_transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      // Stripe event id — guards against double-processing the same webhook
      // delivery (Stripe retries on timeout/non-2xx, so duplicates happen).
      table.string('stripe_event_id').notNullable().unique()
      // e.g. checkout.session.completed, invoice.paid, invoice.payment_failed,
      // customer.subscription.deleted — verbatim Stripe event `type`.
      table.string('type').notNullable()
      table.string('status').notNullable()
      // Smallest currency unit (cents), matching Stripe's own convention.
      table.integer('amount').unsigned().nullable()
      table.string('currency', 3).nullable()

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
