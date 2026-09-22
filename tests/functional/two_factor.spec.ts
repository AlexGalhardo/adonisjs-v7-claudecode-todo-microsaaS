import { test } from '@japa/runner'
import { createHmac } from 'node:crypto'
import { UserFactory } from '#database/factories/user_factory'

test.group('Two-factor authentication', () => {
  test('a user can enroll, then must pass a challenge on next login', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()

    const enrollPage = await client.get('/settings/two-factor').loginAs(user).withInertia()
    enrollPage.assertStatus(200)
    const secret = enrollPage.inertiaProps.secret as string
    assert.isString(secret)

    const confirmResponse = await client
      .post('/settings/two-factor')
      .loginAs(user)
      .withCsrfToken()
      .withSession({ pending_2fa_secret: secret })
      .withInertia()
      .form({ code: generateCode(secret) })

    confirmResponse.assertStatus(200)
    assert.equal(confirmResponse.inertiaProps.enabled, true)
    assert.isArray(confirmResponse.inertiaProps.recoveryCodes)
    assert.lengthOf(confirmResponse.inertiaProps.recoveryCodes as unknown[], 8)

    await user.refresh()
    assert.isNotNull(user.twoFactorConfirmedAt)

    // Logging in now requires the 2FA challenge instead of going straight through
    const loginResponse = await client
      .post('/login')
      .withCsrfToken()
      .redirects(0)
      .form({ email: user.email, password: 'Password123!' })

    loginResponse.assertStatus(302)
    assert.equal(loginResponse.header('location'), '/two-factor/challenge')
    assert.equal(loginResponse.session('two_factor_user_id'), user.id)
  })

  test('an invalid confirmation code is rejected', async ({ client }) => {
    const user = await UserFactory.create()

    const enrollPage = await client.get('/settings/two-factor').loginAs(user).withInertia()
    const secret = enrollPage.inertiaProps.secret as string

    const confirmResponse = await client
      .post('/settings/two-factor')
      .loginAs(user)
      .withCsrfToken()
      .withSession({ pending_2fa_secret: secret })
      .redirects(0)
      .form({ code: '000000' })

    confirmResponse.assertStatus(302)
    confirmResponse.assertFlashMessage('error')
  })

  test('a recovery code can be used once to complete the challenge', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const enrollPage = await client.get('/settings/two-factor').loginAs(user).withInertia()
    const secret = enrollPage.inertiaProps.secret as string

    const confirmResponse = await client
      .post('/settings/two-factor')
      .loginAs(user)
      .withCsrfToken()
      .withSession({ pending_2fa_secret: secret })
      .withInertia()
      .form({ code: generateCode(secret) })
    const recoveryCode = (confirmResponse.inertiaProps.recoveryCodes as string[])[0]

    const challengeResponse = await client
      .post('/two-factor/challenge')
      .withCsrfToken()
      .withSession({ two_factor_user_id: user.id })
      .redirects(0)
      .form({ code: recoveryCode })

    challengeResponse.assertStatus(302)
    assert.equal(challengeResponse.header('location'), '/dashboard')

    // The same recovery code cannot be reused once consumed.
    const secondAttempt = await client
      .post('/two-factor/challenge')
      .withCsrfToken()
      .withSession({ two_factor_user_id: user.id })
      .redirects(0)
      .form({ code: recoveryCode })

    secondAttempt.assertStatus(302)
    secondAttempt.assertFlashMessage('error')
  })

  test('disabling clears the confirmed state', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const enrollPage = await client.get('/settings/two-factor').loginAs(user).withInertia()
    const secret = enrollPage.inertiaProps.secret as string

    await client
      .post('/settings/two-factor')
      .loginAs(user)
      .withCsrfToken()
      .withSession({ pending_2fa_secret: secret })
      .form({ code: generateCode(secret) })

    await client.delete('/settings/two-factor').loginAs(user).withCsrfToken()

    await user.refresh()
    assert.isNull(user.twoFactorConfirmedAt)
  })
})

/**
 * Computes the current 6-digit TOTP code for a secret, standing in for what
 * an authenticator app would display — re-implements RFC 6238 independently
 * from TotpService (which only verifies, never generates) as a cross-check.
 */
function generateCode(secret: string): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = 0
  let value = 0
  const bytes: number[] = []
  for (const char of secret.toUpperCase()) {
    const idx = alphabet.indexOf(char)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  const secretBytes = Buffer.from(bytes)

  const counter = Math.floor(Date.now() / 1000 / 30)
  const counterBuffer = Buffer.alloc(8)
  counterBuffer.writeUInt32BE(Math.floor(counter / 2 ** 32), 0)
  counterBuffer.writeUInt32BE(counter % 2 ** 32, 4)

  const hmac = createHmac('sha1', secretBytes).update(counterBuffer).digest()
  const offset = hmac.at(-1)! & 0xf
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)

  return String(binary % 1_000_000).padStart(6, '0')
}
