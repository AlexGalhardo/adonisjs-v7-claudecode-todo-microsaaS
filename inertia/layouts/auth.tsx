import { Link } from '@adonisjs/inertia/react'
import type { ReactNode } from 'react'

/**
 * Bare chrome shared by login/signup/forgot-password/reset-password/
 * magic-link/2FA-challenge (forced dark) and contact/error pages
 * (`forceDark={false}`, follows the normal theme toggle instead): no navbar,
 * just a centered title linking back to the landing page. The `dark` class
 * scopes the dark CSS-variable overrides (see inertia/css/app.css) to this
 * subtree only, independent of whatever the rest of the app is set to.
 */
export default function AuthLayout({
  children,
  forceDark = true,
  maxWidth = 'max-w-sm',
}: {
  children: ReactNode
  forceDark?: boolean
  maxWidth?: string
}) {
  return (
    <div
      className={`${forceDark ? 'dark' : ''} flex min-h-screen flex-col items-center bg-gray-1 px-6 py-16 text-gray-10`}
    >
      <Link route="home" className="mb-10 text-lg font-semibold tracking-tight text-gray-12">
        Todo
      </Link>
      <div className={`w-full ${maxWidth}`}>{children}</div>
    </div>
  )
}
