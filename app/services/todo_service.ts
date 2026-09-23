import type { DateTime } from 'luxon'
import Todo from '#models/todo'
import type User from '#models/user'
import type { TODO_CATEGORIES } from '#validators/todo'

type Category = (typeof TODO_CATEGORIES)[number]

type CreateTodoPayload = {
  title: string
  description?: string | null
  category?: Category | null
  dueDate?: DateTime | null
}

type UpdateTodoPayload = Partial<{
  title: string
  description: string | null
  category: Category | null
  dueDate: DateTime | null
  completed: boolean
}>

export type TodoFilters = {
  search?: string
  category?: string
  dateFrom?: string
  dateTo?: string
}

export const TODOS_PER_PAGE = 10

export default class TodoService {
  /**
   * Returns the (not-yet-executed) filtered query — callers decide whether to
   * await it directly (API: full list) or call `.paginate()` on it (web
   * dashboard: 10 per page), so filtering logic isn't duplicated either way.
   */
  list(user: User, filters: TodoFilters = {}) {
    const query = Todo.query().where('userId', user.id)

    if (filters.search) {
      const term = `%${filters.search}%`
      query.where((builder) => {
        builder.whereLike('title', term).orWhereLike('description', term)
      })
    }

    if (filters.category) {
      query.where('category', filters.category)
    }

    if (filters.dateFrom) {
      query.where('dueDate', '>=', filters.dateFrom)
    }

    if (filters.dateTo) {
      query.where('dueDate', '<=', filters.dateTo)
    }

    return query.orderBy('createdAt', 'desc')
  }

  findForUser(user: User, id: number) {
    return Todo.query().where('userId', user.id).where('id', id).firstOrFail()
  }

  create(user: User, payload: CreateTodoPayload) {
    return Todo.create({
      userId: user.id,
      title: payload.title,
      description: payload.description ?? null,
      category: payload.category ?? null,
      dueDate: payload.dueDate ?? null,
      // Set explicitly rather than relying on the DB-level default: SQLite
      // inserts don't report generated defaults back, so the in-memory
      // instance would otherwise read `completed` as undefined until refetched.
      completed: false,
    })
  }

  update(todo: Todo, payload: UpdateTodoPayload) {
    todo.merge(payload)
    return todo.save()
  }

  toggle(todo: Todo) {
    todo.completed = !todo.completed
    return todo.save()
  }

  delete(todo: Todo) {
    return todo.delete()
  }
}
