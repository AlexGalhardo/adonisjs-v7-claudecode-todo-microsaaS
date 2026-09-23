import vine from '@vinejs/vine'

export const contactValidator = vine.create({
  fullName: vine.string().minLength(1).maxLength(255),
  email: vine.string().email().maxLength(254),
  subject: vine.enum(['bug', 'suggestion', 'other'] as const),
  message: vine.string().minLength(32).maxLength(512),
})
