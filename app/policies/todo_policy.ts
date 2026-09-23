import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import type Todo from '#models/todo'
import type User from '#models/user'

export default class TodoPolicy extends BasePolicy {
  private owns(user: User, todo: Todo): AuthorizerResponse {
    return todo.userId === user.id
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
