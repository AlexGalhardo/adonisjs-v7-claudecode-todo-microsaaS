import { Form } from '@adonisjs/inertia/react'
import Button from '~/components/button'
import TextField from '~/components/text_field'

export default function Login() {
  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center py-24">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-12">Login</h1>
      <p className="mb-8 text-gray-6">Enter your details below to login to your account</p>

      <Form route="session.store" className="flex flex-col gap-5">
        {({ errors }) => (
          <>
            <TextField
              label="Email"
              type="email"
              name="email"
              id="email"
              autoComplete="username"
              error={errors.email}
            />

            <TextField
              label="Password"
              type="password"
              name="password"
              id="password"
              autoComplete="current-password"
              error={errors.password}
            />

            <Button type="submit" className="w-full">
              Login
            </Button>
          </>
        )}
      </Form>
    </div>
  )
}
