import { Form } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { useState } from 'react'
import Button from '~/components/button'
import TextField from '~/components/text_field'

const MESSAGE_MIN = 32
const MESSAGE_MAX = 512

export default function Contact() {
  const { user } = usePage().props
  const [message, setMessage] = useState('')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-12">Contact</h1>
        <p className="text-gray-7">Have a question, a bug to report, or feedback? Tell us.</p>
      </div>

      <Form route="contact.store" className="flex flex-col gap-5">
        {({ errors }) => (
          <>
            <TextField
              label="Full name"
              type="text"
              name="fullName"
              id="fullName"
              defaultValue={user?.fullName ?? ''}
              readOnly={!!user}
              className={user ? 'bg-gray-1 text-gray-7' : ''}
              error={errors.fullName}
            />

            <TextField
              label="Email"
              type="email"
              name="email"
              id="email"
              defaultValue={user?.email ?? ''}
              readOnly={!!user}
              className={user ? 'bg-gray-1 text-gray-7' : ''}
              error={errors.email}
            />

            <div>
              <label htmlFor="subject" className="mb-1 block text-sm font-medium text-gray-12">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                defaultValue="bug"
                className="h-10 w-full rounded-md border border-gray-4 bg-white px-4 text-sm text-black outline-none focus:border-gray-8"
              >
                <option value="bug">Bug / technical issue</option>
                <option value="suggestion">Suggestion or question</option>
                <option value="other">Other</option>
              </select>
              {errors.subject && (
                <p className="mt-1 text-sm font-medium text-red-500">{errors.subject}</p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-12">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={7}
                minLength={MESSAGE_MIN}
                maxLength={MESSAGE_MAX}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="w-full rounded-md border border-gray-4 px-4 py-2 text-sm text-gray-12 outline-none focus:border-gray-8"
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.message ? (
                  <p className="text-sm font-medium text-red-500">{errors.message}</p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-gray-6">
                  {message.length}/{MESSAGE_MAX} characters
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full border border-matrix bg-transparent text-matrix hover:bg-matrix hover:text-black"
            >
              Send message
            </Button>
          </>
        )}
      </Form>
    </div>
  )
}
