import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { PaymentTransactionSchema } from '#database/schema'
import User from '#models/user'

export default class PaymentTransaction extends PaymentTransactionSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
