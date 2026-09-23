import { AuthorizationResponse, BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import stripeConfig from '#config/stripe'
import Todo from '#models/todo'
import type User from '#models/user'

export default class TodoPolicy extends BasePolicy {
  private owns(user: User, todo: Todo): AuthorizerResponse {
    return todo.userId === user.id
  }

  /**
   * Free plan: `stripeConfig.freeTodoLimit` todos. Subscribers (active or
   * trialing) skip the count query entirely.
   */
  async create(user: User): Promise<AuthorizerResponse> {
    if (user.hasActiveSubscription) return true

    const count = await Todo.query().where('userId', user.id).count('* as total')
    const total = Number(count[0].$extras.total)

    if (total >= stripeConfig.freeTodoLimit) {
      return AuthorizationResponse.deny(
        `You've reached the free plan limit of ${stripeConfig.freeTodoLimit} todos. Upgrade to create more.`
      )
    }
    return true
  }

  view(user: User, todo: Todo): AuthorizerResponse {
    return this.owns(user, todo)
  }

  update(user: User, todo: Todo): AuthorizerResponse {
    return this.owns(user, todo)
  }

  delete(user: User, todo: Todo): AuthorizerResponse {
    return this.owns(user, todo)
  }
}
