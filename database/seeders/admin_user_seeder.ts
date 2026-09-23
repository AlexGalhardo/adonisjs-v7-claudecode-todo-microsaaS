import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Todo from '#models/todo'
import User from '#models/user'

const ADMIN_EMAIL = 'admin@gmail.com'
const ADMIN_PASSWORD = 'adminBR@123'

const SAMPLE_TODOS: { title: string; description: string; completed: boolean }[] = [
  {
    title: 'Welcome to your Todo app',
    description: 'This is a sample todo, created by the admin seeder — feel free to delete it.',
    completed: false,
  },
  {
    title: 'Try marking a todo as complete',
    description: 'Click the checkbox on the left to toggle it.',
    completed: true,
  },
  {
    title: 'Create your own todo',
    description: 'Use the "New todo" button above the list.',
    completed: false,
  },
]

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
  }
}
