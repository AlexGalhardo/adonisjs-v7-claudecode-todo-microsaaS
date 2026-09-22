import { Form } from '@adonisjs/inertia/react'
import Button from '~/components/button'
import TextField from '~/components/text_field'

export default function ForgotPassword() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-gray-12">Forgot password</h1>
      <p className="mb-8 text-gray-6">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      <Form route="password_resets.store" className="flex flex-col gap-5">
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

            <Button type="submit" className="w-full">
              Send reset link
            </Button>
          </>
        )}
      </Form>
    </div>
  )
}
