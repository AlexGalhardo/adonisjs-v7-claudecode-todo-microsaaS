import Todo from '#models/todo'
import TodoPolicy from '#policies/todo_policy'
import TodoService from '#services/todo_service'
import TodoTransformer from '#transformers/todo_transformer'
import { createTodoValidator, updateTodoValidator } from '#validators/todo'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class TodosController {
  constructor(protected todoService: TodoService) {}

  async index({ inertia, auth }: HttpContext) {
    const todos = await this.todoService.list(auth.user!)
    return inertia.render('dashboard', {
      todos: TodoTransformer.transform(todos),
    })
  }

  async store({ request, response, auth, session }: HttpContext) {
    const payload = await request.validateUsing(createTodoValidator)
    await this.todoService.create(auth.user!, payload)

    session.flash('success', 'Todo created.')
    response.redirect().back()
  }

  async update({ request, response, params, bouncer, session }: HttpContext) {
    const todo = await Todo.findOrFail(params.id)
    await bouncer.with(TodoPolicy).authorize('update', todo)

    const payload = await request.validateUsing(updateTodoValidator)
    await this.todoService.update(todo, payload)

    session.flash('success', 'Todo updated.')
    response.redirect().back()
  }

  async destroy({ response, params, bouncer, session }: HttpContext) {
    const todo = await Todo.findOrFail(params.id)
    await bouncer.with(TodoPolicy).authorize('delete', todo)

    await this.todoService.delete(todo)

    session.flash('success', 'Todo deleted.')
    response.redirect().back()
  }
}
