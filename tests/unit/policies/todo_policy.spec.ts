import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { test } from '@japa/runner'
import stripeConfig from '#config/stripe'
import { UserFactory } from '#database/factories/user_factory'
import TodoPolicy from '#policies/todo_policy'
import TodoService from '#services/todo_service'

function isAuthorized(response: AuthorizerResponse): boolean {
  return typeof response === 'boolean' ? response : response.authorized
}

test.group('Todo policy — create (free plan limit)', () => {
  test('allows creating todos under the free limit', async ({ assert }) => {
    const user = await UserFactory.create()

    const response = await new TodoPolicy().create(user)

    assert.isTrue(isAuthorized(response))
  })

  test('denies creating another todo once the free limit is reached', async ({ assert }) => {
    const user = await UserFactory.create()
    const todoService = new TodoService()
    for (let i = 0; i < stripeConfig.freeTodoLimit; i++) {
      await todoService.create(user, { title: `Todo ${i}` })
    }

    const response = await new TodoPolicy().create(user)

    assert.isFalse(isAuthorized(response))
  })

  test('allows creating todos past the free limit for an active subscriber', async ({ assert }) => {
    const user = await UserFactory.merge({ subscriptionStatus: 'active' }).create()
    const todoService = new TodoService()
    for (let i = 0; i < stripeConfig.freeTodoLimit; i++) {
      await todoService.create(user, { title: `Todo ${i}` })
    }

    const response = await new TodoPolicy().create(user)

    assert.isTrue(isAuthorized(response))
  })
})
