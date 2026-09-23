export const TODO_CATEGORIES = [
  { value: 'movie', label: 'Movie' },
  { value: 'book', label: 'Book' },
  { value: 'series', label: 'Series' },
  { value: 'video_game', label: 'Video Game' },
  { value: 'coding_project', label: 'Coding Project' },
  { value: 'special_date', label: 'Special Date' },
  { value: 'exam', label: 'Exam' },
  { value: 'other', label: 'Other' },
] as const

export type TodoCategory = (typeof TODO_CATEGORIES)[number]['value']

export function categoryLabel(value: string | null | undefined): string | null {
  return TODO_CATEGORIES.find((category) => category.value === value)?.label ?? null
}
