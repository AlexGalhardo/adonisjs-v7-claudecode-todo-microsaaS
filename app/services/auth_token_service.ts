import type User from '#models/user'
import AuthToken from '#models/auth_token'
import { randomBytes, createHash } from 'node:crypto'
import { DateTime } from 'luxon'

type TokenType = 'password_reset' | 'magic_link'

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export default class AuthTokenService {
  /**
   * Creates a token for the given user/type and returns the *plain* value to
   * embed in the email link — only its SHA-256 hash is persisted, matching
   * how the framework's own access tokens are stored.
   */
  async create(user: User, type: TokenType, ttlMinutes: number) {
    const plainToken = randomBytes(32).toString('base64url')

    await AuthToken.create({
      userId: user.id,
      type,
      tokenHash: hash(plainToken),
      expiresAt: DateTime.now().plus({ minutes: ttlMinutes }),
    })

    return plainToken
  }

  /**
   * Resolves a plain token to its owning user, without consuming it. Returns
   * null when the token is missing, expired, or already used.
   */
  async verify(plainToken: string, type: TokenType) {
    const record = await AuthToken.query()
      .where('tokenHash', hash(plainToken))
      .where('type', type)
      .preload('user')
      .first()

    if (!record || record.usedAt || record.expiresAt < DateTime.now()) {
      return null
    }

    return record
  }

  async consume(record: AuthToken) {
    record.usedAt = DateTime.now()
    await record.save()
  }
}
