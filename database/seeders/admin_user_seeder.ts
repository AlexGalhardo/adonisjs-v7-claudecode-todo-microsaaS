import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Todo from '#models/todo'
import User from '#models/user'
import { TODO_CATEGORIES } from '#validators/todo'

const ADMIN_EMAIL = 'admin@gmail.com'
const ADMIN_PASSWORD = 'adminBR@123'
const RANDOM_TODO_COUNT = 32

const SAMPLE_TODOS: { title: string; description: string; completed: boolean }[] = [
  {
    title: 'Welcome to your Todo app',
    description: 'This is a sample todo, created by the admin seeder — feel free to delete it.',
    completed: false,
  },
  {
    title: 'Mark a todo as done',
    description: 'Click the checkbox on the left to toggle it.',
    completed: true,
  },
  {
    title: 'Create your own todo',
    description: 'Use the "New todo" button above the list.',
    completed: false,
  },
]

const RANDOM_TITLE_WORDS = [
  'Watch',
  'Read',
  'Finish',
  'Plan',
  'Review',
  'Buy',
  'Book',
  'Play',
  'Write',
  'Study',
]

/** Deterministic-ish pseudo-random title/description generator, no faker dependency needed here. */
function randomTodoData(index: number) {
  const category = TODO_CATEGORIES[index % TODO_CATEGORIES.length]
  const word = RANDOM_TITLE_WORDS[index % RANDOM_TITLE_WORDS.length]
  const title = `${word} item ${index + 1}`.slice(0, 24)
  const hasDescription = index % 3 !== 0
  const dueDate = index % 4 !== 0 ? DateTime.now().plus({ days: (index % 20) - 10 }) : null

  return {
    title,
    description: hasDescription ? `Sample generated description for demo item ${index + 1}.` : null,
    category,
    dueDate,
    completed: index % 3 === 0,
  }
}

/**
 * Idempotent: safe to run multiple times (e.g. re-running `node ace db:seed`
 * in an environment that already has data) without creating duplicates.
 */
export default class extends BaseSeeder {
  async run() {
    const admin = await User.firstOrCreate(
      { email: ADMIN_EMAIL },
      { email: ADMIN_EMAIL, fullName: 'Admin', password: ADMIN_PASSWORD }
    )

    for (const todo of SAMPLE_TODOS) {
      await Todo.firstOrCreate(
        { userId: admin.id, title: todo.title },
        { userId: admin.id, ...todo }
      )
    }

    // 32 randomly-generated todos so pagination/search/category/date filters
    // on the dashboard have enough data to exercise during manual testing.
    for (let i = 0; i < RANDOM_TODO_COUNT; i++) {
      const data = randomTodoData(i)
      await Todo.firstOrCreate(
        { userId: admin.id, title: data.title },
        { userId: admin.id, ...data }
      )
    }
  }
}
