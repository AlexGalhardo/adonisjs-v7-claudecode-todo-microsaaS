export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

/**
 * Matches the inline blocking script in resources/views/inertia_layout.edge,
 * which applies this same preference to <html> before React hydrates (avoids
 * a flash of the wrong theme). Keep the two in sync if this logic changes.
 */
export function getTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme)
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}
