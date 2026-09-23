import { Form } from '@adonisjs/inertia/react'
import { router, usePage } from '@inertiajs/react'
import { useState } from 'react'
import Button from '~/components/button'
import DeleteAccountDialog from '~/components/delete_account_dialog'
import PasswordField from '~/components/password_field'
import TextField from '~/components/text_field'
import TwoFactorDialog from '~/components/two_factor_dialog'

const PLAN_LABELS: Record<string, string> = {
  monthly: 'Monthly ($2.99/mo)',
  annual: 'Annual ($29.90/yr)',
}

type ProfileProps = {
  twoFactorEnabled: boolean
  stripeConfigured: boolean
}

export default function Profile({ twoFactorEnabled, stripeConfigured }: ProfileProps) {
  const { user } = usePage().props
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  // Bumped on every open so DeleteAccountDialog remounts with a fresh
  // countdown, even when re-opening after cancelling.
  const [deleteDialogKey, setDeleteDialogKey] = useState(0)

  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false)
  const [twoFactorDialogKey, setTwoFactorDialogKey] = useState(0)
  const [twoFactorEnabledState, setTwoFactorEnabledState] = useState(twoFactorEnabled)

  const [managingPortal, setManagingPortal] = useState(false)

  function openBillingPortal() {
    setManagingPortal(true)
    router.post('/billing/portal', {}, { onFinish: () => setManagingPortal(false) })
  }

  function openTwoFactorDialog() {
    setTwoFactorDialogOpen(true)
    setTwoFactorDialogKey((key) => key + 1)
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-7">
            Two-factor authentication is {twoFactorEnabledState ? 'enabled' : 'disabled'}.
          </p>
          <Button variant="secondary" onClick={openTwoFactorDialog}>
            Manage
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-12">Billing</h2>
        {!stripeConfigured ? (
          <p className="text-sm text-gray-7">Payments aren't configured yet.</p>
        ) : user?.hasActiveSubscription ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-12">
                  {user.subscriptionPlan ? PLAN_LABELS[user.subscriptionPlan] : 'Active plan'}
                </p>
                <p className="text-sm text-gray-7">
                  Status: {user.subscriptionStatus}
                  {user.currentPeriodEnd &&
                    ` — renews ${new Date(user.currentPeriodEnd).toLocaleDateString()}`}
                </p>
              </div>
              <Button variant="secondary" onClick={openBillingPortal} disabled={managingPortal}>
                {managingPortal ? 'Opening…' : 'Manage subscription'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-7">You're on the free plan (10 todos max).</p>
            <Button variant="secondary" onClick={() => router.visit('/checkout')}>
              Upgrade
            </Button>
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

      <TwoFactorDialog
        key={twoFactorDialogKey}
        open={twoFactorDialogOpen}
        onOpenChange={setTwoFactorDialogOpen}
        enabled={twoFactorEnabledState}
        onChange={setTwoFactorEnabledState}
      />
    </div>
  )
}
