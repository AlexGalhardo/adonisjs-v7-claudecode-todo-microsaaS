import { Form } from '@adonisjs/inertia/react'
import Button from '~/components/button'
import TextField from '~/components/text_field'

export default function MagicLink() {
  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center py-24">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-12">Log in with a link</h1>
      <p className="mb-8 text-gray-6">
        Enter your email and we&apos;ll send you a link to log in — no password needed.
      </p>

      <Form route="magic_links.store" className="flex flex-col gap-5">
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
              Send login link
            </Button>
          </>
        )}
      </Form>
    </div>
  )
}
