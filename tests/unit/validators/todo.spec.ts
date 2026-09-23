import { test } from '@japa/runner'
import { createTodoValidator, updateTodoValidator } from '#validators/todo'

test.group('Todo validators', () => {
  test('createTodoValidator accepts a title + category payload', async ({ assert }) => {
    const output = await createTodoValidator.validate({ title: 'Buy milk', category: 'other' })

    assert.equal(output.title, 'BUY MILK')
  })

  test('createTodoValidator uppercases the title and description', async ({ assert }) => {
    const output = await createTodoValidator.validate({
      title: 'buy milk',
      description: 'whole milk',
      category: 'other',
    })

    assert.equal(output.title, 'BUY MILK')
    assert.equal(output.description, 'WHOLE MILK')
  })

  test('createTodoValidator rejects an empty title', async ({ assert }) => {
    await assert.rejects(() => createTodoValidator.validate({ title: '', category: 'other' }))
  })

  test('createTodoValidator rejects a missing category', async ({ assert }) => {
    await assert.rejects(() => createTodoValidator.validate({ title: 'Buy milk' }))
  })

  test('createTodoValidator rejects a title over 255 characters', async ({ assert }) => {
    await assert.rejects(() =>
      createTodoValidator.validate({ title: 'a'.repeat(256), category: 'other' })
    )
  })

  test('updateTodoValidator accepts a completed-only payload', async ({ assert }) => {
    const output = await updateTodoValidator.validate({ completed: true })

    assert.isTrue(output.completed)
  })

  test('updateTodoValidator rejects a non-boolean completed value', async ({ assert }) => {
    await assert.rejects(() => updateTodoValidator.validate({ completed: 'yes' }))
  })
})
