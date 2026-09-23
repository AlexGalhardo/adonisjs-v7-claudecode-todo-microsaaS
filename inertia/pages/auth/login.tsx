import { Form, Link } from '@adonisjs/inertia/react'
import Button from '~/components/button'
import PasswordField from '~/components/password_field'
import SocialAuthLinks from '~/components/social_auth_links'
import TextField from '~/components/text_field'

export default function Login() {
  return (
    <div>
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

            <div>
              <PasswordField
                label="Password"
                name="password"
                id="password"
                autoComplete="current-password"
                minLength={8}
                maxLength={32}
                error={errors.password}
              />
              <Link
                route="password_resets.create"
                className="mt-1 inline-block text-sm text-gray-6 hover:text-gray-12"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>

            <Link
              route="magic_links.create"
              className="text-center text-sm text-gray-6 hover:text-gray-12"
            >
              Or log in with a link, no password needed
            </Link>
          </>
        )}
      </Form>

      <div className="mt-6">
        <SocialAuthLinks />
      </div>
    </div>
  )
}
