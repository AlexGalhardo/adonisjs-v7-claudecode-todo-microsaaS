import { randomBytes } from 'node:crypto'
import encryption from '@adonisjs/core/services/encryption'
import { DateTime } from 'luxon'
import type User from '#models/user'
import TotpService from '#services/totp_service'

const RECOVERY_CODES_COUNT = 8

export default class TwoFactorService {
  constructor(private totp: TotpService = new TotpService()) {}

  generatePendingSecret() {
    return this.totp.generateSecret()
  }

  keyUri(secret: string, user: User) {
    return this.totp.keyUri(secret, user.email)
  }

  private generateRecoveryCodes(): string[] {
    return Array.from({ length: RECOVERY_CODES_COUNT }, () =>
      randomBytes(5)
        .toString('hex')
        .match(/.{1,5}/g)!
        .join('-')
    )
  }

  /**
   * Verifies the confirmation code against the pending secret and, if valid,
   * persists 2FA as enabled — encrypting the secret and a fresh batch of
   * recovery codes. Returns the plain recovery codes (shown to the user once)
   * or null if the code didn't match.
   */
  async confirm(user: User, pendingSecret: string, code: string): Promise<string[] | null> {
    if (!this.totp.verify(pendingSecret, code)) {
      return null
    }

    const recoveryCodes = this.generateRecoveryCodes()

    user.twoFactorSecret = encryption.encrypt(pendingSecret)
    user.twoFactorRecoveryCodes = encryption.encrypt(recoveryCodes)
    user.twoFactorConfirmedAt = DateTime.now()
    await user.save()

    return recoveryCodes
  }

  async disable(user: User) {
    user.twoFactorSecret = null
    user.twoFactorRecoveryCodes = null
    user.twoFactorConfirmedAt = null
    await user.save()
  }

  /**
   * Verifies a login-time submission, which may be a 6-digit TOTP code or one
   * of the recovery codes. A matched recovery code is consumed (removed).
   */
  async verifyChallenge(user: User, submitted: string): Promise<boolean> {
    if (!user.twoFactorSecret) return false

    const secret = encryption.decrypt<string>(user.twoFactorSecret)
    if (secret && this.totp.verify(secret, submitted)) {
      return true
    }

    if (!user.twoFactorRecoveryCodes) return false

    const codes = encryption.decrypt<string[]>(user.twoFactorRecoveryCodes)
    if (!codes) return false

    const index = codes.indexOf(submitted)
    if (index === -1) return false

    codes.splice(index, 1)
    user.twoFactorRecoveryCodes = encryption.encrypt(codes)
    await user.save()

    return true
  }
}
