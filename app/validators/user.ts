import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * At least one lowercase letter, one uppercase letter, one digit, and one
 * character that isn't a letter/digit — enforced only at signup, not login
 * (an existing password shouldn't suddenly fail this on an unrelated field
 * change, and a weak legacy password should still be able to log in).
 */
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/

/**
 * Validator to use when performing self-signup.
 */
export const signupValidator = vine.create({
  fullName: vine.string().minLength(4).maxLength(24).nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password().regex(STRONG_PASSWORD),
})

/**
 * Validator to use when logging in an existing user
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})
