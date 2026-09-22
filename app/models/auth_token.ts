import User from '#models/user'
import { AuthTokenSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class AuthToken extends AuthTokenSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
