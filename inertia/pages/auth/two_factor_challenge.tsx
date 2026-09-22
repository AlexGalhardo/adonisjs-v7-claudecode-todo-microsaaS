import { Form } from '@adonisjs/inertia/react'
import Button from '~/components/button'
import TextField from '~/components/text_field'

export default function TwoFactorChallenge() {
  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center py-24">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-12">Two-factor code</h1>
      <p className="mb-8 text-gray-6">
        Enter the 6-digit code from your authenticator app, or one of your recovery codes.
      </p>

      <Form route="two_factor_challenges.store" className="flex flex-col gap-5">
        {({ errors }) => (
          <>
            <TextField
              label="Code"
              type="text"
              name="code"
              id="code"
              autoComplete="one-time-code"
              autoFocus
              error={errors.code}
            />

            <Button type="submit" className="w-full">
              Verify
            </Button>
          </>
        )}
      </Form>
    </div>
  )
}
