import type { Data } from '@generated/data'
import { usePage } from '@inertiajs/react'
import { type ReactElement, useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import AppLayout from '~/layouts/app'
import AuthLayout from '~/layouts/auth'

const FORCE_DARK_BARE_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/magic-link',
  '/two-factor/challenge',
]

const APP_PATHS = ['/dashboard', '/profile', '/profile/api']

function isForceDarkBarePath(url: string): boolean {
  return FORCE_DARK_BARE_PATHS.includes(url) || url.startsWith('/reset-password/')
}

function isAppPath(url: string): boolean {
  return APP_PATHS.includes(url)
}

/**
 * Picks the right chrome for the current route:
 * - `/` (landing) gets none at all — it owns the entire viewport itself.
 * - login/signup/forgot-password/reset-password/magic-link/2FA-challenge get
 *   the bare, always-dark AuthLayout.
 * - the authenticated app (dashboard/profile/profile/api) gets AppLayout.
 * - everything else (/contact, 404, 500, any other path) gets the bare
 *   layout following the normal theme toggle — the safe default for a page
 *   that might be hit by a signed-out visitor.
 */
export default function Layout({ children }: { children: ReactElement<Data.SharedProps> }) {
  const { url, flash } = usePage()

  useEffect(() => {
    toast.dismiss()
  }, [url])

  useEffect(() => {
    if (flash.error) {
      toast.error(flash.error)
    }
    if (flash.success) {
      toast.success(flash.success)
    }
  })

  const toaster = <Toaster position="top-center" richColors />

  if (url === '/') {
    return (
      <>
        {children}
        {toaster}
      </>
    )
  }

  if (isForceDarkBarePath(url)) {
    return (
      <>
        <AuthLayout>{children}</AuthLayout>
        {toaster}
      </>
    )
  }

  if (isAppPath(url)) {
    return (
      <>
        <AppLayout>{children}</AppLayout>
        {toaster}
      </>
    )
  }

  return (
    <>
      <AuthLayout forceDark={false} maxWidth="max-w-lg">
        {children}
      </AuthLayout>
      {toaster}
    </>
  )
}
