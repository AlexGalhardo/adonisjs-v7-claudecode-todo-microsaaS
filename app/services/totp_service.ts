import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const STEP_SECONDS = 30
const DIGITS = 6

function base32Encode(buffer: Buffer): string {
  let bits = 0
  let value = 0
  let output = ''

  for (const byte of buffer) {
    value = (value << 8) | byte
    bits += 8

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }

  return output
}

function base32Decode(secret: string): Buffer {
  const clean = secret.toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = 0
  let value = 0
  const bytes: number[] = []

  for (const char of clean) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(char)
    bits += 5

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return Buffer.from(bytes)
}

function hotp(secretBytes: Buffer, counter: number): string {
  const counterBuffer = Buffer.alloc(8)
  counterBuffer.writeBigUInt64BE(BigInt(counter))

  const hmac = createHmac('sha1', secretBytes).update(counterBuffer).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)

  return (binary % 10 ** DIGITS).toString().padStart(DIGITS, '0')
}

/**
 * RFC 6238 TOTP, implemented on node:crypto — there is no official AdonisJS
 * 2FA package, and this is small enough not to need a third-party library.
 */
export default class TotpService {
  generateSecret(): string {
    return base32Encode(randomBytes(20))
  }

  /**
   * otpauth:// URI for the authenticator app to scan (as a QR code) or enter
   * manually.
   */
  keyUri(secret: string, accountName: string, issuer = 'Todo'): string {
    const label = encodeURIComponent(`${issuer}:${accountName}`)
    const params = new URLSearchParams({
      secret,
      issuer,
      algorithm: 'SHA1',
      digits: String(DIGITS),
      period: String(STEP_SECONDS),
    })
    return `otpauth://totp/${label}?${params.toString()}`
  }

  /**
   * Verifies a 6-digit code, allowing one step of clock drift on either side.
   */
  verify(secret: string, token: string, window = 1): boolean {
    if (!/^\d{6}$/.test(token)) return false

    const secretBytes = base32Decode(secret)
    const counter = Math.floor(Date.now() / 1000 / STEP_SECONDS)

    for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
      const candidate = hotp(secretBytes, counter + errorWindow)
      if (timingSafeEqual(Buffer.from(candidate), Buffer.from(token))) {
        return true
      }
    }

    return false
  }
}
