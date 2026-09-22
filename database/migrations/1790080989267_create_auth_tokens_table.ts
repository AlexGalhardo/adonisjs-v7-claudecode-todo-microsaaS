import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auth_tokens'

  /**
   * Shared table for short-lived, single-use tokens sent by email — password
   * reset and magic link both need the same shape (hash a random secret,
   * expire it, mark it used), so one table with a `type` discriminator avoids
   * duplicating the model/service/migration for each flow.
   */
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
      table.enum('type', ['password_reset', 'magic_link']).notNullable()
      table.string('token_hash').notNullable()
      table.timestamp('expires_at').notNullable()
      table.timestamp('used_at').nullable()

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
