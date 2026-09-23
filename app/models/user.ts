import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { UserSchema } from '#database/schema'
import Todo from '#models/todo'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  static accessTokens = DbAccessTokensProvider.forModel(User)

  @hasMany(() => Todo)
  declare todos: HasMany<typeof Todo>

  /**
   * `active`/`trialing` are the only Stripe subscription statuses that grant
   * access — `past_due`, `canceled`, `unpaid`, etc. must not. Set only by
   * the Stripe webhook handler (`app/controllers/stripe_webhooks_controller.ts`),
   * never assumed from a client request.
   */
  get hasActiveSubscription() {
    return this.subscriptionStatus === 'active' || this.subscriptionStatus === 'trialing'
  }

  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }
}
