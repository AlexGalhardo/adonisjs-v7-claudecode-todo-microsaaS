import { Link } from '@adonisjs/inertia/react'
import { Menu } from '@base-ui/react/menu'
import { router, usePage } from '@inertiajs/react'
import type { ReactNode } from 'react'
import {
  ChevronDownIcon,
  CodeIcon,
  FileTextIcon,
  LogOutIcon,
  MailIcon,
  ShieldIcon,
  UserIcon,
} from '~/components/icons'
import ThemeToggle from '~/components/theme_toggle'

const menuItemClassName =
  'flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm text-gray-10 outline-none data-[highlighted]:bg-gray-3 data-[highlighted]:text-gray-12'

/**
 * Chrome for the authenticated app (dashboard, profile, profile/api,
 * contact): just the app title on the far left and a user dropdown (name,
 * Profile, API, Contact, Terms, Privacy, theme toggle, Logout) on the far
 * right — no other nav links, since everything routes through that one menu.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { user } = usePage().props

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
              className="flex items-center gap-2 rounded-full py-1 pr-3 pl-1 outline-none hover:bg-gray-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-3 text-gray-10">
                <UserIcon width={16} height={16} />
              </span>
              {user?.fullName && (
                <span className="text-sm font-medium text-gray-12">{user.fullName}</span>
              )}
              <ChevronDownIcon width={16} height={16} className="text-gray-8" />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner side="bottom" align="end" sideOffset={8}>
                <Menu.Popup className="min-w-52 rounded-md border border-gray-3 bg-gray-1 p-1 shadow-lg outline-none">
                  <Menu.Item render={<Link href="/profile" />} className={menuItemClassName}>
                    <UserIcon width={16} height={16} />
                    Profile
                  </Menu.Item>
                  <Menu.Item render={<Link href="/profile/api" />} className={menuItemClassName}>
                    <CodeIcon width={16} height={16} />
                    API
                  </Menu.Item>
                  <Menu.Item render={<Link href="/contact" />} className={menuItemClassName}>
                    <MailIcon width={16} height={16} />
                    Contact
                  </Menu.Item>
                  <Menu.Item render={<Link href="/terms" />} className={menuItemClassName}>
                    <FileTextIcon width={16} height={16} />
                    Terms of Use
                  </Menu.Item>
                  <Menu.Item render={<Link href="/privacy" />} className={menuItemClassName}>
                    <ShieldIcon width={16} height={16} />
                    Privacy Policy
                  </Menu.Item>
                  <ThemeToggle />
                  <hr className="my-1 border-gray-3" />
                  <Menu.Item onClick={() => router.post('/logout')} className={menuItemClassName}>
                    <LogOutIcon width={16} height={16} />
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
