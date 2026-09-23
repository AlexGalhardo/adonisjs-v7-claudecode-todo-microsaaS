import { Dialog } from '@base-ui/react/dialog'
import { useEffect, useState } from 'react'
import Button from '~/components/button'
import TextField from '~/components/text_field'

type TwoFactorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  enabled: boolean
  onChange: (enabled: boolean) => void
}

type EnrollState = { secret: string; qrCode: string } | null

function csrfToken(): string {
  return decodeURIComponent(
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1] ?? ''
  )
}

async function jsonFetch(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken(),
      ...init.headers,
    },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(body.error ?? body.errors?.[0]?.message ?? 'Something went wrong.')
  }
  return body
}

export default function TwoFactorDialog({
  open,
  onOpenChange,
  enabled,
  onChange,
}: TwoFactorDialogProps) {
  const [loading, setLoading] = useState(false)
  const [enroll, setEnroll] = useState<EnrollState>(null)
  const [code, setCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || enabled) return
    setLoading(true)
    jsonFetch('/settings/two-factor')
      .then((data) => setEnroll({ secret: data.secret, qrCode: data.qrCode }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [open, enabled])

  function reset() {
    setEnroll(null)
    setCode('')
    setRecoveryCodes(null)
    setError('')
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  async function confirm() {
    setLoading(true)
    setError('')
    try {
      const data = await jsonFetch('/settings/two-factor', {
        method: 'POST',
        body: JSON.stringify({ code }),
      })
      setRecoveryCodes(data.recoveryCodes)
      onChange(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function disable() {
    setLoading(true)
    setError('')
    try {
      await jsonFetch('/settings/two-factor', { method: 'DELETE' })
      onChange(false)
      handleOpenChange(false)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/30" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-3 bg-gray-1 p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-gray-12">
            Two-factor authentication
          </Dialog.Title>

          {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}

          {enabled ? (
            <div className="mt-4 flex flex-col gap-4">
              <p className="text-sm text-gray-7">
                Two-factor authentication is enabled on your account.
              </p>
              <div className="flex justify-end gap-3">
                <Dialog.Close render={<Button type="button" variant="secondary" />}>
                  Close
                </Dialog.Close>
                <Button onClick={disable} disabled={loading}>
                  Disable
                </Button>
              </div>
            </div>
          ) : recoveryCodes ? (
            <div className="mt-4 flex flex-col gap-4">
              <p className="text-sm text-gray-7">
                Save these recovery codes somewhere safe. Each one can be used once if you lose
                access to your authenticator app. They won&apos;t be shown again.
              </p>
              <ul className="grid grid-cols-2 gap-2 rounded-md border border-gray-3 p-4 font-mono text-sm text-gray-12">
                {recoveryCodes.map((recoveryCode) => (
                  <li key={recoveryCode}>{recoveryCode}</li>
                ))}
              </ul>
              <Button className="w-full" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              <p className="text-sm text-gray-7">
                Scan this QR code with your authenticator app (Google Authenticator, 1Password,
                etc.), then enter the 6-digit code it shows to confirm.
              </p>

              {enroll?.qrCode && (
                <img
                  src={enroll.qrCode}
                  alt="Two-factor QR code"
                  className="h-40 w-40 self-center"
                />
              )}
              {enroll?.secret && (
                <p className="break-all text-center font-mono text-xs text-gray-6">
                  {enroll.secret}
                </p>
              )}

              <TextField
                label="Confirmation code"
                type="text"
                id="two-factor-code"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />

              <div className="flex justify-end gap-3">
                <Dialog.Close render={<Button type="button" variant="secondary" />}>
                  Cancel
                </Dialog.Close>
                <Button onClick={confirm} disabled={loading || !enroll}>
                  Enable
                </Button>
              </div>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
