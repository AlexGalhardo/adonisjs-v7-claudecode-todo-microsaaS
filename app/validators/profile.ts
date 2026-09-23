import vine from '@vinejs/vine'

export const updateNameValidator = vine.create({
  fullName: vine.string().trim().minLength(4).maxLength(24),
})

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/

export const updatePasswordValidator = vine.create({
  currentPassword: vine.string(),
  password: vine
    .string()
    .minLength(8)
    .maxLength(32)
    .regex(STRONG_PASSWORD)
    .confirmed({ confirmationField: 'passwordConfirmation' }),
  passwordConfirmation: vine.string(),
})
