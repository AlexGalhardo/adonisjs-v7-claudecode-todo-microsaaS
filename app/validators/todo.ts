import vine from '@vinejs/vine'

export const TODO_CATEGORIES = [
  'movie',
  'book',
  'series',
  'video_game',
  'coding_project',
  'special_date',
  'exam',
  'other',
] as const

/**
 * Title and description are always stored UPPERCASE — the frontend mirrors
 * this as the user types, but it's enforced here too since the API can be
 * hit directly (see docs/api.md).
 */
const upperTrimmed = (value: unknown) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value

const title = () => vine.string().parse(upperTrimmed).minLength(4).maxLength(24)
const category = () => vine.enum(TODO_CATEGORIES).nullable().optional()
const requiredCategory = () => vine.enum(TODO_CATEGORIES)
const dueDate = () => vine.date().nullable().optional()

/**
 * Description is optional (toggled on/off from the UI via a select), but once
 * present it must be 4–128 characters — enforced here rather than on the
 * `nullable()`/`optional()` variant so an accidentally-submitted 1-3 char
 * value never sneaks through as "no description".
 */
const description = () =>
  vine.string().parse(upperTrimmed).minLength(4).maxLength(128).nullable().optional()

export const createTodoValidator = vine.create({
  title: title(),
  description: description(),
  category: requiredCategory(),
  dueDate: dueDate(),
})

export const updateTodoValidator = vine.create({
  title: title().optional(),
  description: description(),
  category: category(),
  dueDate: dueDate(),
  completed: vine.boolean().optional(),
})
