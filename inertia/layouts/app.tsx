import { Link } from '@adonisjs/inertia/react'
import { Menu } from '@base-ui/react/menu'
import { router } from '@inertiajs/react'
import type { ReactNode } from 'react'
import { ChevronDownIcon, UserIcon } from '~/components/icons'
import ThemeToggle from '~/components/theme_toggle'

/**
 * Chrome for the authenticated app (dashboard, profile, profile/api,
 * contact): just the app title on the far left and a user-icon dropdown
 * (Profile, API, theme toggle, Logout) on the far right — no other nav
 * links, since everything routes through that one menu.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-2 text-gray-10">
      <header className="border-b border-gray-3">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link route="dashboard" className="font-semibold tracking-tight text-gray-12">
            Todo
          </Link>

          <Menu.Root>
            <Menu.Trigger
              aria-label="User menu"
              className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 outline-none hover:bg-gray-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-3 text-gray-10">
                <UserIcon width={16} height={16} />
              </span>
              <ChevronDownIcon width={16} height={16} className="text-gray-8" />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner side="bottom" align="end" sideOffset={8}>
                <Menu.Popup className="min-w-44 rounded-md border border-gray-3 bg-gray-1 p-1 shadow-lg outline-none">
                  <Menu.Item
                    render={<Link href="/profile" />}
                    className="block cursor-pointer rounded px-3 py-2 text-sm text-gray-10 outline-none data-[highlighted]:bg-gray-3 data-[highlighted]:text-gray-12"
                  >
                    Profile
                  </Menu.Item>
                  <Menu.Item
                    render={<Link href="/profile/api" />}
                    className="block cursor-pointer rounded px-3 py-2 text-sm text-gray-10 outline-none data-[highlighted]:bg-gray-3 data-[highlighted]:text-gray-12"
                  >
                    API
                  </Menu.Item>
                  <ThemeToggle />
                  <Menu.Item
                    onClick={() => router.post('/logout')}
                    className="block cursor-pointer rounded px-3 py-2 text-sm text-gray-10 outline-none data-[highlighted]:bg-gray-3 data-[highlighted]:text-gray-12"
                  >
                    Logout
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6">{children}</main>
    </div>
  )
}
