import { test } from '@japa/runner'
import { createTodoValidator, updateTodoValidator } from '#validators/todo'

test.group('Todo validators', () => {
  test('createTodoValidator accepts a title-only payload', async ({ assert }) => {
    const output = await createTodoValidator.validate({ title: 'Buy milk' })

    assert.equal(output.title, 'Buy milk')
  })

  test('createTodoValidator rejects an empty title', async ({ assert }) => {
    await assert.rejects(() => createTodoValidator.validate({ title: '' }))
  })

  test('createTodoValidator rejects a title over 255 characters', async ({ assert }) => {
    await assert.rejects(() => createTodoValidator.validate({ title: 'a'.repeat(256) }))
  })

  test('updateTodoValidator accepts a completed-only payload', async ({ assert }) => {
    const output = await updateTodoValidator.validate({ completed: true })

    assert.isTrue(output.completed)
  })

  test('updateTodoValidator rejects a non-boolean completed value', async ({ assert }) => {
    await assert.rejects(() => updateTodoValidator.validate({ completed: 'yes' }))
  })
})
