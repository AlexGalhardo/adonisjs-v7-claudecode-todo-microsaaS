import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import Todo from '#models/todo'
import TodoPolicy from '#policies/todo_policy'
import TodoService from '#services/todo_service'
import TodoTransformer from '#transformers/todo_transformer'
import { createTodoValidator, updateTodoValidator } from '#validators/todo'

@inject()
export default class ApiTodosController {
  constructor(protected todoService: TodoService) {}

  async index({ auth, serialize }: HttpContext) {
    const todos = await this.todoService.list(auth.use('api').getUserOrFail())
    return serialize(TodoTransformer.transform(todos))
  }

  async store({ request, auth, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createTodoValidator)
    const todo = await this.todoService.create(auth.use('api').getUserOrFail(), payload)

    return response.created(await serialize(TodoTransformer.transform(todo)))
  }

  async show({ params, bouncer, serialize }: HttpContext) {
    const todo = await Todo.findOrFail(params.id)
    await bouncer.with(TodoPolicy).authorize('view', todo)

    return serialize(TodoTransformer.transform(todo))
  }

  async update({ request, params, bouncer, serialize }: HttpContext) {
    const todo = await Todo.findOrFail(params.id)
    await bouncer.with(TodoPolicy).authorize('update', todo)

    const payload = await request.validateUsing(updateTodoValidator)
    await this.todoService.update(todo, payload)

    return serialize(TodoTransformer.transform(todo))
  }

  async destroy({ params, bouncer, response }: HttpContext) {
    const todo = await Todo.findOrFail(params.id)
    await bouncer.with(TodoPolicy).authorize('delete', todo)

    await this.todoService.delete(todo)
    return response.noContent()
  }
}
