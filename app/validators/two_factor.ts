import vine from '@vinejs/vine'

export const confirmTwoFactorValidator = vine.create({
  code: vine.string().trim(),
})

export const twoFactorChallengeValidator = vine.create({
  code: vine.string().trim(),
})
