import Todo from '#models/todo'
import type User from '#models/user'

type CreateTodoPayload = {
  title: string
  description?: string | null
}

type UpdateTodoPayload = Partial<{
  title: string
  description: string | null
  completed: boolean
}>

export default class TodoService {
  list(user: User) {
    return Todo.query().where('userId', user.id).orderBy('createdAt', 'desc')
  }

  findForUser(user: User, id: number) {
    return Todo.query().where('userId', user.id).where('id', id).firstOrFail()
  }

  create(user: User, payload: CreateTodoPayload) {
    return Todo.create({
      userId: user.id,
      title: payload.title,
      description: payload.description ?? null,
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
