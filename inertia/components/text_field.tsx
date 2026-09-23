import type { ComponentProps } from 'react'

type TextFieldProps = ComponentProps<'input'> & {
  label: string
  error?: string
}

export default function TextField({ label, error, id, className, ...props }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-12">
        {label}
      </label>
      <input
        id={id}
        data-invalid={error ? 'true' : undefined}
        className={`h-10 w-full rounded-md border border-gray-4 px-4 text-sm text-gray-12
          outline-none placeholder:text-gray-6 focus:border-gray-8
          data-[invalid=true]:border-red-500 ${className ?? ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm font-medium text-red-500">{error}</p>}
    </div>
  )
}
