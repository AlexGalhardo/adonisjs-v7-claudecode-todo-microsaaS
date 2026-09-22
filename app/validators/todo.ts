import vine from '@vinejs/vine'

export const createTodoValidator = vine.create({
  title: vine.string().trim().minLength(1).maxLength(255),
  description: vine.string().trim().maxLength(2000).nullable().optional(),
})

export const updateTodoValidator = vine.create({
  title: vine.string().trim().minLength(1).maxLength(255).optional(),
  description: vine.string().trim().maxLength(2000).nullable().optional(),
  completed: vine.boolean().optional(),
})
