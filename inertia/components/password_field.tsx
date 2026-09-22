import { useState, type ComponentProps } from 'react'
import { EyeIcon, EyeOffIcon } from '~/components/icons'

type PasswordFieldProps = Omit<ComponentProps<'input'>, 'type'> & {
  label: string
  error?: string
}

/**
 * Same look as TextField, but for passwords: adds an eye button that toggles
 * between masked and plain text. Used by login and signup — both need the
 * same min/maxLength (8–32) passed in via `minLength`/`maxLength` props so
 * each page can state its own rule inline rather than hardcoding it here.
 */
export default function PasswordField({
  label,
  error,
  id,
  className,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-12">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          data-invalid={error ? 'true' : undefined}
          className={`h-10 w-full rounded-md border border-gray-4 px-4 pr-11 text-sm text-gray-12
            outline-none placeholder:text-gray-6 focus:border-gray-8
            data-[invalid=true]:border-red-500 ${className ?? ''}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-6 hover:text-gray-12"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <p className="mt-1 text-sm font-medium text-red-500">{error}</p>}
    </div>
  )
}
