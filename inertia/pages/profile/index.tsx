import { useState } from 'react'
import { router } from '@inertiajs/react'
import { usePage } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import Button from '~/components/button'
import TextField from '~/components/text_field'
import PasswordField from '~/components/password_field'
import DeleteAccountDialog from '~/components/delete_account_dialog'

export default function Profile({ twoFactorEnabled }: { twoFactorEnabled: boolean }) {
  const { user } = usePage().props
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  // Bumped on every open so DeleteAccountDialog remounts with a fresh
  // countdown, even when re-opening after cancelling.
  const [deleteDialogKey, setDeleteDialogKey] = useState(0)

  function disableTwoFactor() {
    router.delete('/settings/two-factor')
  }

  function openDeleteDialog() {
    setDeleteDialogOpen(true)
    setDeleteDialogKey((key) => key + 1)
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-10 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-12">Profile</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-12">Account</h2>
        <Form route="profile.update_name" className="flex flex-col gap-5">
          {({ errors, processing }) => (
            <>
              <TextField
                label="Full name"
                type="text"
                name="fullName"
                id="fullName"
                defaultValue={user?.fullName ?? ''}
                minLength={4}
                maxLength={24}
                error={errors.fullName}
              />
              <TextField label="Email" type="email" value={user?.email ?? ''} readOnly disabled />
              <Button type="submit" disabled={processing} className="self-start">
                Save name
              </Button>
            </>
          )}
        </Form>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-12">Password</h2>
        <Form route="profile.update_password" className="flex flex-col gap-5">
          {({ errors, processing }) => (
            <>
              <PasswordField
                label="Current password"
                name="currentPassword"
                id="currentPassword"
                autoComplete="current-password"
                error={errors.currentPassword}
              />
              <PasswordField
                label="New password"
                name="password"
                id="newPassword"
                autoComplete="new-password"
                minLength={8}
                maxLength={32}
                error={errors.password}
              />
              <PasswordField
                label="Confirm new password"
                name="passwordConfirmation"
                id="passwordConfirmation"
                autoComplete="new-password"
                minLength={8}
                maxLength={32}
                error={errors.passwordConfirmation}
              />
              <Button type="submit" disabled={processing} className="self-start">
                Update password
              </Button>
            </>
          )}
        </Form>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-12">Two-factor authentication</h2>
        {twoFactorEnabled ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-7">Two-factor authentication is enabled.</p>
            <Button variant="secondary" onClick={disableTwoFactor}>
              Disable
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-7">Two-factor authentication is disabled.</p>
            <Link route="two_factor_settings.create">
              <Button variant="secondary">Enable</Button>
            </Link>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-md border border-red-200 p-4">
        <h2 className="text-lg font-semibold text-gray-12">Delete account</h2>
        <p className="text-sm text-gray-7">
          Permanently delete your account and all your data. You&apos;ll have 30 days to change your
          mind by logging back in.
        </p>
        <Button
          variant="secondary"
          onClick={openDeleteDialog}
          className="self-start border-red-300 text-red-600 hover:bg-red-50"
        >
          Delete account
        </Button>
      </section>

      <DeleteAccountDialog
        key={deleteDialogKey}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  )
}
