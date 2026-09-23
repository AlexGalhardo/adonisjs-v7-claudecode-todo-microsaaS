import { Form, Link } from '@adonisjs/inertia/react'
import { useState } from 'react'
import Button from '~/components/button'
import { CheckIcon, XIcon } from '~/components/icons'
import PasswordField from '~/components/password_field'
import SocialAuthLinks from '~/components/social_auth_links'
import TextField from '~/components/text_field'

/** "alex galhardo" -> "Alex Galhardo" — capitalizes the start of each word as it's typed. */
function capitalizeWords(value: string): string {
  return value.replace(/(^|\s)\S/g, (char) => char.toUpperCase())
}

const PASSWORD_RULES: { label: string; test: (value: string) => boolean }[] = [
  { label: 'Between 8 and 32 characters', test: (v) => v.length >= 8 && v.length <= 32 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'One number', test: (v) => /\d/.test(v) },
  { label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-2 flex flex-col gap-1">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password)
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 text-xs ${passed ? 'text-matrix' : 'text-gray-6'}`}
          >
            {passed ? <CheckIcon width={14} height={14} /> : <XIcon width={14} height={14} />}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')

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

            <div>
              <PasswordField
                label="Password"
                name="password"
                id="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={32}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={errors.password}
              />
              <PasswordChecklist password={password} />
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-black transition-colors hover:bg-green-600 hover:text-white"
            >
              Sign up
            </Button>
          </>
        )}
      </Form>

      <div className="mt-6">
        <SocialAuthLinks label="Create Account" />
      </div>

      <p className="mt-6 text-center text-sm text-gray-6">
        Already have an account?{' '}
        <Link route="session.create" className="font-medium text-gray-12 hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}
