import { BaseTransformer } from '@adonisjs/core/transformers'
import type Todo from '#models/todo'

export default class TodoTransformer extends BaseTransformer<Todo> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'title',
      'description',
      'completed',
      'createdAt',
      'updatedAt',
    ])
  }
}
