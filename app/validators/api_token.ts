import vine from '@vinejs/vine'

export const createTokenValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(60),
})
