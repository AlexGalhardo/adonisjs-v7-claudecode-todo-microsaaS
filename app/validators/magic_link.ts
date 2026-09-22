import vine from '@vinejs/vine'

export const requestMagicLinkValidator = vine.create({
  email: vine.string().email().maxLength(254),
})
