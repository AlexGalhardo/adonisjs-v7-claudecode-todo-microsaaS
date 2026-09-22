import { test } from '@japa/runner'
import Todo from '#models/todo'
import { UserFactory } from '#database/factories/user_factory'
import { TodoFactory } from '#database/factories/todo_factory'

test.group('Todos API', () => {
  test('index returns only the authenticated user todos', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const otherUser = await UserFactory.create()
    await TodoFactory.merge({ userId: user.id }).create()
    await TodoFactory.merge({ userId: otherUser.id }).create()

    const response = await client.get('/api/todos').withGuard('api').loginAs(user)

    response.assertStatus(200)
    assert.lengthOf(response.body().data, 1)
  })

  test('unauthenticated requests are rejected', async ({ client }) => {
    const response = await client.get('/api/todos')

    response.assertStatus(401)
  })

  test('store creates a todo and returns it serialized', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const response = await client
      .post('/api/todos')
      .withGuard('api')
      .loginAs(user)
      .json({ title: 'Buy milk' })

    response.assertStatus(201)
    assert.equal(response.body().data.title, 'Buy milk')
    assert.isFalse(response.body().data.completed)
  })

  test('store validates the payload', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client
      .post('/api/todos')
      .withGuard('api')
      .loginAs(user)
      .json({ title: '' })

    response.assertStatus(422)
  })

  test('update rejects requests from a non-owner', async ({ client, assert }) => {
    const owner = await UserFactory.create()
    const intruder = await UserFactory.create()
    const todo = await TodoFactory.merge({ userId: owner.id, title: 'Original' }).create()

    const response = await client
      .put(`/api/todos/${todo.id}`)
      .withGuard('api')
      .loginAs(intruder)
      .json({ title: 'Hijacked' })

    response.assertStatus(403)
    await todo.refresh()
    assert.equal(todo.title, 'Original')
  })

  test('destroy removes the todo', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const todo = await TodoFactory.merge({ userId: user.id }).create()

    const response = await client.delete(`/api/todos/${todo.id}`).withGuard('api').loginAs(user)

    response.assertStatus(204)
    const found = await Todo.find(todo.id)
    assert.isNull(found)
  })
})
