import { Link } from '@adonisjs/inertia/react'
import MatrixRain from '~/components/matrix_rain'

export default function Home() {
  return (
    <div className="dark flex h-screen flex-col overflow-hidden bg-black text-gray-10">
      <MatrixRain />

      <div className="relative z-10 grid flex-1 grid-cols-1 items-center gap-8 px-6 py-8 md:grid-cols-2 md:px-16">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-12 md:text-5xl">
            A simple, focused way to track what you need to do
          </h1>
          <p className="max-w-md text-lg text-gray-7">
            Create your account and start organizing your tasks in seconds.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              route="new_account.create"
              className="inline-flex h-11 items-center justify-center rounded-md border border-matrix bg-transparent px-6 text-sm font-semibold text-matrix transition-colors hover:bg-matrix hover:text-black"
            >
              Signup
            </Link>
            <Link
              route="session.create"
              className="inline-flex h-11 items-center justify-center rounded-md border border-gray-10 bg-transparent px-6 text-sm font-semibold text-gray-12 transition-colors hover:bg-gray-12 hover:text-black"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="hidden items-center justify-center md:flex">
          <div className="flex aspect-video w-full max-w-lg items-center justify-center rounded-lg border border-dashed border-gray-4 text-gray-6">
            Demo preview coming soon
          </div>
        </div>
      </div>

      <footer className="relative z-10 flex flex-col gap-2 border-t border-gray-3 px-6 py-4 text-sm text-gray-6 md:flex-row md:items-center md:justify-between md:px-16">
        <span>All rights reserved.</span>
        <nav className="flex gap-6">
          <Link href="/contact" className="hover:text-gray-12">
            Contact
          </Link>
          <Link href="/terms" className="hover:text-gray-12">
            Terms Of Use
          </Link>
          <Link href="/privacy" className="hover:text-gray-12">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
