import { Dialog } from '@base-ui/react/dialog'
import { router } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import Button from '~/components/button'

const COOLDOWN_SECONDS = 10

export default function DeleteAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  // Give this component a fresh `key` (see profile/index.tsx) every time it's
  // opened, so the countdown restarts via this initial state instead of
  // resetting it from an effect.
  const [secondsLeft, setSecondsLeft] = useState(COOLDOWN_SECONDS)

  useEffect(() => {
    if (secondsLeft === 0) return
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  function confirmDelete() {
    router.delete('/profile')
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/30" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-3 bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-gray-12">
            Delete your account?
          </Dialog.Title>
          <p className="mt-2 text-sm text-gray-7">
            Your account will be scheduled for deletion. You can log back in within{' '}
            <strong>30 days</strong> to cancel it — after that, it&apos;s permanently deleted and
            cannot be recovered.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close render={<Button type="button" variant="secondary" />}>
              Cancel
            </Dialog.Close>
            <Button
              type="button"
              disabled={secondsLeft > 0}
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-4 disabled:text-gray-7"
            >
              {secondsLeft > 0 ? `Confirm delete (${secondsLeft})` : 'Confirm delete'}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
