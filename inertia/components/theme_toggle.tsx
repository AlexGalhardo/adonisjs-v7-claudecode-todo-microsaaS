import { useState } from 'react'
import { Menu } from '@base-ui/react/menu'
import { getTheme, toggleTheme, type Theme } from '~/lib/theme'
import { SunIcon, MoonIcon } from '~/components/icons'

export default function ThemeToggle() {
  // Lazy initializer instead of an effect: the real value already lives in
  // the DOM by the time this renders (set by the blocking script in
  // inertia_layout.edge before React ever mounts), so there's no async
  // system to synchronize with — just read it once for the initial render.
  const [theme, setThemeState] = useState<Theme>(getTheme)

  return (
    <Menu.Item
      closeOnClick={false}
      onClick={() => setThemeState(toggleTheme())}
      className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm text-gray-10 outline-none data-[highlighted]:bg-gray-3 data-[highlighted]:text-gray-12"
    >
      {theme === 'dark' ? <MoonIcon width={16} height={16} /> : <SunIcon width={16} height={16} />}
      Toggle {theme === 'dark' ? 'light' : 'dark'} theme
    </Menu.Item>
  )
}
