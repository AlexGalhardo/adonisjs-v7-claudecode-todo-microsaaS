import vine from '@vinejs/vine'

export const TODO_CATEGORIES = [
  'movie',
  'book',
  'series',
  'video_game',
  'coding_project',
  'special_date',
  'exam',
] as const

const title = () => vine.string().trim().minLength(4).maxLength(24)
const category = () => vine.enum(TODO_CATEGORIES).nullable().optional()
const dueDate = () => vine.date().nullable().optional()

/**
 * Description is optional (toggled on/off from the UI via a select), but once
 * present it must be 4–128 characters — enforced here rather than on the
 * `nullable()`/`optional()` variant so an accidentally-submitted 1-3 char
 * value never sneaks through as "no description".
 */
const description = () => vine.string().trim().minLength(4).maxLength(128).nullable().optional()

export const createTodoValidator = vine.create({
  title: title(),
  description: description(),
  category: category(),
  dueDate: dueDate(),
})

export const updateTodoValidator = vine.create({
  title: title().optional(),
  description: description(),
  category: category(),
  dueDate: dueDate(),
  completed: vine.boolean().optional(),
})
