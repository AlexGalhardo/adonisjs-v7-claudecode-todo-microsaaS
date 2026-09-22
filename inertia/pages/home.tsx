import { Link } from '@adonisjs/inertia/react'

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-gray-12">
        A simple, focused way to track what you need to do
      </h1>
      <p className="max-w-xl text-lg text-gray-7">
        Crie sua conta para começar a organizar suas tarefas.
      </p>
      <Link
        route="new_account.create"
        className="inline-flex h-10 items-center justify-center rounded-md bg-gray-12 px-5 text-sm font-medium text-white hover:bg-gray-10"
      >
        Começar agora
      </Link>
    </div>
  )
}
