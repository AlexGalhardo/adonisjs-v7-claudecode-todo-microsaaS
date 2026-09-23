import { DateTime } from 'luxon'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { DELETION_GRACE_PERIOD_DAYS } from '#services/account_deletion_service'

/**
 * Permanently deletes accounts whose 30-day deletion grace period has
 * expired. Nothing in this app runs this automatically — schedule it
 * externally (cron, a platform scheduled job, etc.), see docs/auth.md.
 */
export default class UsersPurgeDeleted extends BaseCommand {
  static commandName = 'users:purge-deleted'
  static description = 'Permanently delete accounts past their 30-day deletion grace period'

  static options: CommandOptions = {}

  async run() {
    const { default: User } = await import('#models/user')

    const deadline = DateTime.now().minus({ days: DELETION_GRACE_PERIOD_DAYS })
    const users = await User.query()
      .whereNotNull('deletionRequestedAt')
      .where('deletionRequestedAt', '<=', deadline.toSQL()!)

    for (const user of users) {
      await user.delete()
      this.logger.info(`Purged user #${user.id} (${user.email})`)
    }

    this.logger.success(`Purged ${users.length} account(s) past the deletion grace period.`)
  }
}
