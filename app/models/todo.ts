import { beforeSave, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { TodoSchema } from '#database/schema'
import User from '#models/user'

export default class Todo extends TodoSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  /**
   * Title/description are always stored UPPERCASE. The validator already
   * enforces this at the HTTP boundary, but this guarantees the invariant
   * for any other write path too (seeders, direct service calls, etc.).
   */
  @beforeSave()
  static uppercaseText(todo: Todo) {
    if (todo.$dirty.title) {
      todo.title = todo.title.toUpperCase()
    }
    if (todo.$dirty.description) {
      todo.description = todo.description?.toUpperCase() ?? null
    }
  }
}
