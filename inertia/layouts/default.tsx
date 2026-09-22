import { type Data } from '@generated/data'
import { toast, Toaster } from 'sonner'
import { usePage } from '@inertiajs/react'
import { type ReactElement, useEffect } from 'react'
import { Form, Link } from '@adonisjs/inertia/react'

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

  return (
    <>
      <header className="border-b border-gray-3">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link route="home" className="font-semibold tracking-tight text-gray-12">
            Todo
          </Link>

          <nav className="flex items-center gap-6">
            {children.props.user ? (
              <>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-3 text-xs font-semibold text-gray-12">
                  {children.props.user.initials}
                </span>
                <Link
                  route="two_factor_settings.create"
                  className="text-sm font-medium text-gray-8 hover:text-gray-12"
                >
                  Security
                </Link>
                <Form route="session.destroy">
                  <button
                    type="submit"
                    className="text-sm font-medium text-gray-8 hover:text-gray-12"
                  >
                    Logout
                  </button>
                </Form>
              </>
            ) : (
              <>
                <Link
                  route="new_account.create"
                  className="text-sm font-medium text-gray-8 hover:text-gray-12"
                >
                  Signup
                </Link>
                <Link
                  route="session.create"
                  className="text-sm font-medium text-gray-8 hover:text-gray-12"
                >
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto min-h-[calc(100vh-65px)] max-w-5xl px-6">{children}</main>
      <Toaster position="top-center" richColors />
    </>
  )
}
