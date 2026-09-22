import { useState } from 'react'
import { Form } from '@adonisjs/inertia/react'
import Button from '~/components/button'
import TextField from '~/components/text_field'
import PasswordField from '~/components/password_field'
import SocialAuthLinks from '~/components/social_auth_links'

/** "alex galhardo" -> "Alex Galhardo" — capitalizes the start of each word as it's typed. */
function capitalizeWords(value: string): string {
  return value.replace(/(^|\s)\S/g, (char) => char.toUpperCase())
}

export default function Signup() {
  const [fullName, setFullName] = useState('')

  return (
    <div>
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
              value={fullName}
              onChange={(event) => setFullName(capitalizeWords(event.target.value))}
              minLength={4}
              maxLength={24}
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

            <PasswordField
              label="Password"
              name="password"
              id="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={32}
              error={errors.password}
            />

            <PasswordField
              label="Confirm password"
              name="passwordConfirmation"
              id="passwordConfirmation"
              autoComplete="new-password"
              minLength={8}
              maxLength={32}
              error={errors.passwordConfirmation}
            />

            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </>
        )}
      </Form>

      <div className="mt-6">
        <SocialAuthLinks label="Create Account" />
      </div>
    </div>
  )
}
