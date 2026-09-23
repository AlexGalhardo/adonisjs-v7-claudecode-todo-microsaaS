import { DateTime } from 'luxon'
import type User from '#models/user'

export const DELETION_GRACE_PERIOD_DAYS = 30

export type LoginDeletionStatus = 'ok' | 'pending' | 'expired'

export default class AccountDeletionService {
  async requestDeletion(user: User) {
    user.deletionRequestedAt = DateTime.now()
    await user.save()
  }

  /**
   * Read-only check — call this as soon as credentials for the *first*
   * factor are verified (password, magic-link token, OAuth), before
   * deciding where to redirect. Deliberately does NOT persist anything: for
   * a 2FA-enabled user this runs before the second factor is checked, and
   * only verifying a password must never be enough to cancel a pending
   * deletion — that write happens in `cancelPendingDeletion`, only once
   * authentication is fully complete.
   *
   * - 'ok': no pending deletion.
   * - 'pending': a deletion is pending but still inside the 30-day window —
   *   caller should call `cancelPendingDeletion` once login fully succeeds.
   * - 'expired': the 30-day window has passed. The row still exists (no
   *   scheduler purges it automatically — see `node ace users:purge-deleted`
   *   in docs/auth.md), but the account must be treated as deleted: deny
   *   the login outright, before any second factor.
   */
  checkOnLogin(user: User): LoginDeletionStatus {
    if (!user.deletionRequestedAt) return 'ok'

    const deadline = user.deletionRequestedAt.plus({ days: DELETION_GRACE_PERIOD_DAYS })
    if (DateTime.now() > deadline) return 'expired'

    return 'pending'
  }

  /**
   * Clears a pending deletion. Call this only once login has fully
   * succeeded — i.e. after any second factor has already been verified —
   * never on password/token verification alone.
   */
  async cancelPendingDeletion(user: User) {
    user.deletionRequestedAt = null
    await user.save()
  }
}
