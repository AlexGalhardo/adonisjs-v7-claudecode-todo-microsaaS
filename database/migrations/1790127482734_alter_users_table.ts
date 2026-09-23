import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Set when the user requests account deletion. Logging back in before
      // 30 days have passed clears this (cancels the deletion); the
      // `users:purge-deleted` command permanently removes accounts whose
      // window has expired.
      table.timestamp('deletion_requested_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('deletion_requested_at')
    })
  }
}
