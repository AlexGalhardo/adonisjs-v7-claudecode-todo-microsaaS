import type User from '#models/user'
import type Todo from '#models/todo'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

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
