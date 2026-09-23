import type User from '#models/user'
import { DateTime } from 'luxon'

export const DELETION_GRACE_PERIOD_DAYS = 30

export type LoginDeletionStatus = 'ok' | 'cancelled' | 'expired'

export default class AccountDeletionService {
  async requestDeletion(user: User) {
    user.deletionRequestedAt = DateTime.now()
    await user.save()
  }

  /**
   * Called right before granting a session on every login path (password,
   * magic link, social, 2FA-completed) — logging in at all, by any of
   * those, is what cancels a pending deletion.
   *
   * - 'ok': no pending deletion, log in normally.
   * - 'cancelled': a pending deletion was cleared — caller should flash a
   *   "welcome back" message.
   * - 'expired': the 30-day window has passed. The row still exists (no
   *   scheduler purges it automatically — see `node ace users:purge-deleted`
   *   in docs/auth.md), but the account must be treated as deleted: deny
   *   the login.
   */
  async checkOnLogin(user: User): Promise<LoginDeletionStatus> {
    if (!user.deletionRequestedAt) return 'ok'

    const deadline = user.deletionRequestedAt.plus({ days: DELETION_GRACE_PERIOD_DAYS })
    if (DateTime.now() > deadline) return 'expired'

    user.deletionRequestedAt = null
    await user.save()
    return 'cancelled'
  }
}
