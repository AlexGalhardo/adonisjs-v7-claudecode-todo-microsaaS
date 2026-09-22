import factory from '@adonisjs/lucid/factories'
import Todo from '#models/todo'
import { UserFactory } from '#database/factories/user_factory'

export const TodoFactory = factory
  .define(Todo, async ({ faker }) => {
    return {
      title: faker.lorem.sentence(4),
      description: faker.lorem.paragraph(),
      completed: false,
    }
  })
  .relation('user', () => UserFactory)
  .build()
