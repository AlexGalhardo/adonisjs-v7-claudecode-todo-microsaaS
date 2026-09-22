import { Form } from '@adonisjs/inertia/react'
import Button from '~/components/button'
import TextField from '~/components/text_field'

export default function ResetPassword({ token }: { token: string }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center py-24">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-12">Reset password</h1>
      <p className="mb-8 text-gray-6">Choose a new password for your account.</p>

      <Form route="password_resets.update" className="flex flex-col gap-5">
        {({ errors }) => (
          <>
            <input type="hidden" name="token" value={token} />

            <TextField
              label="New password"
              type="password"
              name="password"
              id="password"
              autoComplete="new-password"
              error={errors.password}
            />

            <TextField
              label="Confirm new password"
              type="password"
              name="passwordConfirmation"
              id="passwordConfirmation"
              autoComplete="new-password"
              error={errors.passwordConfirmation}
            />

            <Button type="submit" className="w-full">
              Reset password
            </Button>
          </>
        )}
      </Form>
    </div>
  )
}
