import factory from '@adonisjs/lucid/factories'
import { UserFactory } from '#database/factories/user_factory'
import Todo from '#models/todo'

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
