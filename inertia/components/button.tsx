import { type ComponentProps } from 'react'

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

const variants = {
  primary: 'bg-gray-12 text-white hover:bg-gray-10',
  secondary: 'border border-gray-4 text-gray-12 hover:bg-gray-1',
  ghost: 'text-gray-8 hover:text-gray-12',
}

export default function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-sm
        font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50
        ${variants[variant]} ${className ?? ''}`}
      {...props}
    />
  )
}
