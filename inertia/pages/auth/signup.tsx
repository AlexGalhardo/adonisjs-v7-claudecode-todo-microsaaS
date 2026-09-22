import { Form } from '@adonisjs/inertia/react'
import Button from '~/components/button'
import TextField from '~/components/text_field'

export default function Signup() {
  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center py-24">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-12">Signup</h1>
      <p className="mb-8 text-gray-6">Enter your details below to create your account</p>

      <Form route="new_account.store" className="flex flex-col gap-5">
        {({ errors }) => (
          <>
            <TextField
              label="Full name"
              type="text"
              name="fullName"
              id="fullName"
              error={errors.fullName}
            />

            <TextField
              label="Email"
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              error={errors.email}
            />

            <TextField
              label="Password"
              type="password"
              name="password"
              id="password"
              autoComplete="new-password"
              error={errors.password}
            />

            <TextField
              label="Confirm password"
              type="password"
              name="passwordConfirmation"
              id="passwordConfirmation"
              autoComplete="new-password"
              error={errors.passwordConfirmation}
            />

            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </>
        )}
      </Form>
    </div>
  )
}
