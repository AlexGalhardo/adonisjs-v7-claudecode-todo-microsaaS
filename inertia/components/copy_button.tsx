import ClipboardJS from 'clipboard'
import { toast } from 'sonner'
import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Wraps clipboard.js around its children — click anywhere in this button to
 * copy `text`, with a toast confirming it. Used for API tokens, base URLs,
 * and code examples on the /profile/api page.
 */
export default function CopyButton({
  text,
  className,
  children,
}: {
  text: string
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const clipboard = new ClipboardJS(ref.current, { text: () => text })
    clipboard.on('success', () => toast.success('Copied to clipboard'))
    clipboard.on('error', () => toast.error('Could not copy — copy it manually'))
    return () => clipboard.destroy()
  }, [text])

  return (
    <button ref={ref} type="button" className={className}>
      {children}
    </button>
  )
}
