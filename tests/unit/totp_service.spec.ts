import { test } from '@japa/runner'
import { createHmac } from 'node:crypto'
import TotpService from '#services/totp_service'

/**
 * Independently computes a 6-digit HOTP code (RFC 4226) for the given raw
 * secret bytes and counter, without reusing TotpService's implementation —
 * used to cross-check TotpService against a fresh implementation of the same
 * published algorithm, rather than testing it against itself.
 */
function referenceHotp(secretBytes: Buffer, counter: number): string {
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

function base32Encode(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = 0
  let value = 0
  let output = ''
  for (const byte of buffer) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) output += alphabet[(value << (5 - bits)) & 31]
  return output
}

test.group('Totp service', () => {
  test('generateSecret returns a base32 string', ({ assert }) => {
    const totp = new TotpService()
    const secret = totp.generateSecret()

    assert.match(secret, /^[A-Z2-7]+$/)
    assert.isAbove(secret.length, 20)
  })

  test('keyUri embeds the secret, account and issuer', ({ assert }) => {
    const totp = new TotpService()
    const uri = totp.keyUri('ABCDEFGH', 'user@example.com', 'Todo')

    assert.include(uri, 'otpauth://totp/')
    assert.include(uri, 'secret=ABCDEFGH')
    assert.include(uri, encodeURIComponent('Todo:user@example.com'))
  })

  test('verify accepts a code computed independently for the current time step', ({ assert }) => {
    const totp = new TotpService()
    const secretBytes = Buffer.from('12345678901234567890')
    const secret = base32Encode(secretBytes)

    const counter = Math.floor(Date.now() / 1000 / 30)
    const validCode = referenceHotp(secretBytes, counter)

    assert.isTrue(totp.verify(secret, validCode))
  })

  test('verify rejects an incorrect code', ({ assert }) => {
    const totp = new TotpService()
    const secret = totp.generateSecret()

    assert.isFalse(totp.verify(secret, '000000'))
  })

  test('verify rejects malformed input', ({ assert }) => {
    const totp = new TotpService()
    const secret = totp.generateSecret()

    assert.isFalse(totp.verify(secret, 'abcdef'))
    assert.isFalse(totp.verify(secret, '123'))
  })
})
