import { test } from '@japa/runner'
import TodoService from '#services/todo_service'
import { UserFactory } from '#database/factories/user_factory'

test.group('Todo service', () => {
  test('create scopes the todo to the given user', async ({ assert }) => {
    const user = await UserFactory.create()
    const service = new TodoService()

    const todo = await service.create(user, { title: 'Buy milk' })

    assert.equal(todo.userId, user.id)
    assert.equal(todo.title, 'Buy milk')
    assert.isNull(todo.description)
    assert.isFalse(todo.completed)
  })

  test('list only returns todos owned by the given user', async ({ assert }) => {
    const [userA, userB] = await UserFactory.createMany(2)
    const service = new TodoService()

    await service.create(userA, { title: 'User A todo' })
    await service.create(userB, { title: 'User B todo' })

    const todos = await service.list(userA)

    assert.lengthOf(todos, 1)
    assert.equal(todos[0].title, 'User A todo')
  })

  test('update merges the given fields', async ({ assert }) => {
    const user = await UserFactory.create()
    const service = new TodoService()
    const todo = await service.create(user, { title: 'Original title' })

    await service.update(todo, { title: 'Updated title', completed: true })

    assert.equal(todo.title, 'Updated title')
    assert.isTrue(todo.completed)
  })

  test('toggle flips the completed flag', async ({ assert }) => {
    const user = await UserFactory.create()
    const service = new TodoService()
    const todo = await service.create(user, { title: 'Buy milk' })

    await service.toggle(todo)
    assert.isTrue(todo.completed)

    await service.toggle(todo)
    assert.isFalse(todo.completed)
  })

  test('delete removes the todo', async ({ assert }) => {
    const user = await UserFactory.create()
    const service = new TodoService()
    const todo = await service.create(user, { title: 'Buy milk' })

    await service.delete(todo)

    const todos = await service.list(user)
    assert.lengthOf(todos, 0)
  })

  test('findForUser throws when the todo belongs to another user', async ({ assert }) => {
    const [owner, other] = await UserFactory.createMany(2)
    const service = new TodoService()
    const todo = await service.create(owner, { title: 'Buy milk' })

    await assert.rejects(() => service.findForUser(other, todo.id))
  })
})
