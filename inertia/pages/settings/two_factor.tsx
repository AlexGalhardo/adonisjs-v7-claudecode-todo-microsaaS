import { Form, Link } from '@adonisjs/inertia/react'
import { router } from '@inertiajs/react'
import Button from '~/components/button'
import TextField from '~/components/text_field'

type Props = {
  enabled: boolean
  secret?: string
  qrCode?: string
  recoveryCodes?: string[]
}

export default function TwoFactorSettings({ enabled, secret, qrCode, recoveryCodes }: Props) {
  function disable() {
    router.delete('/settings/two-factor')
  }

  if (recoveryCodes) {
    return (
      <div className="mx-auto flex max-w-sm flex-col justify-center py-24">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-12">
          Two-factor authentication enabled
        </h1>
        <p className="mb-6 text-gray-6">
          Save these recovery codes somewhere safe. Each one can be used once to log in if you lose
          access to your authenticator app. They won&apos;t be shown again.
        </p>

        <ul className="mb-6 grid grid-cols-2 gap-2 rounded-md border border-gray-3 p-4 font-mono text-sm">
          {recoveryCodes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>

        <Link route="dashboard" className="text-center">
          <Button className="w-full">Done</Button>
        </Link>
      </div>
    )
  }

  if (enabled) {
    return (
      <div className="mx-auto flex max-w-sm flex-col justify-center py-24">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-12">
          Two-factor authentication
        </h1>
        <p className="mb-6 text-gray-6">Two-factor authentication is enabled on your account.</p>
        <Button variant="secondary" onClick={disable}>
          Disable two-factor authentication
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center py-24">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-12">
        Enable two-factor authentication
      </h1>
      <p className="mb-6 text-gray-6">
        Scan this QR code with your authenticator app (Google Authenticator, 1Password, etc.), then
        enter the 6-digit code it shows to confirm.
      </p>

      {qrCode && (
        <img src={qrCode} alt="Two-factor QR code" className="mb-4 h-48 w-48 self-center" />
      )}

      <p className="mb-6 break-all text-center font-mono text-sm text-gray-6">{secret}</p>

      <Form route="two_factor_settings.store" className="flex flex-col gap-5">
        {({ errors }) => (
          <>
            <TextField
              label="Confirmation code"
              type="text"
              name="code"
              id="code"
              autoComplete="one-time-code"
              error={errors.code}
            />

            <Button type="submit" className="w-full">
              Enable
            </Button>
          </>
        )}
      </Form>
    </div>
  )
}
