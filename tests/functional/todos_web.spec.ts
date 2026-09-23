import { test } from '@japa/runner'
import { TodoFactory } from '#database/factories/todo_factory'
import { UserFactory } from '#database/factories/user_factory'
import Todo from '#models/todo'

test.group('Todos web', () => {
  test('index renders only the authenticated user todos', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const otherUser = await UserFactory.create()
    await TodoFactory.merge({ userId: user.id }).create()
    await TodoFactory.merge({ userId: otherUser.id }).create()

    const response = await client.get('/dashboard').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('dashboard')
    assert.lengthOf(response.inertiaProps.todos.data, 1)
  })

  test('guests are redirected to login', async ({ client }) => {
    const response = await client.get('/dashboard')

    response.assertRedirectsTo('/login')
  })

  test('store creates a todo for the authenticated user', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const response = await client
      .post('/todos')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .form({ title: 'Buy milk', description: 'Whole milk', category: 'other' })

    response.assertStatus(302)
    const todo = await Todo.query().where('userId', user.id).firstOrFail()
    assert.equal(todo.title, 'BUY MILK')
  })

  test('store rejects an empty title', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const response = await client
      .post('/todos')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .form({ title: '' })

    response.assertStatus(302)
    assert.property(response.flashMessage('inputErrorsBag'), 'title')
  })

  test('update rejects requests from a non-owner and leaves the todo untouched', async ({
    client,
    assert,
  }) => {
    const owner = await UserFactory.create()
    const intruder = await UserFactory.create()
    const todo = await TodoFactory.merge({ userId: owner.id, title: 'Original' }).create()

    const response = await client
      .put(`/todos/${todo.id}`)
      .loginAs(intruder)
      .withCsrfToken()
      .redirects(0)
      .form({ title: 'Hijacked' })

    // AdonisJS's bouncer redirects browser (non-JSON) requests back with a
    // flashed error instead of a raw 403 — matches how the Inertia frontend
    // surfaces this failure as a toast rather than an error page.
    response.assertStatus(302)
    response.assertFlashMessage('error')
    await todo.refresh()
    assert.equal(todo.title, 'ORIGINAL')
  })

  test('destroy removes the todo', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const todo = await TodoFactory.merge({ userId: user.id }).create()

    const response = await client
      .delete(`/todos/${todo.id}`)
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(302)
    const found = await Todo.find(todo.id)
    assert.isNull(found)
  })
})
