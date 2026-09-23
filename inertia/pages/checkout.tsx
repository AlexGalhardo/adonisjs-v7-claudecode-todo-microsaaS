import { router } from '@inertiajs/react'
import { useState } from 'react'
import Button from '~/components/button'
import { CheckIcon } from '~/components/icons'

type CheckoutProps = {
  stripeConfigured: boolean
  prices: { monthly: number; annual: number }
}

const FEATURES = ['Unlimited todos', 'Categories, due dates and filters', 'Priority support']

function formatUsd(amount: number) {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default function Checkout({ stripeConfigured, prices }: CheckoutProps) {
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'annual' | null>(null)

  function subscribe(plan: 'monthly' | 'annual') {
    setLoadingPlan(plan)
    router.post(`/checkout/${plan}`, {}, { onFinish: () => setLoadingPlan(null) })
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-12">Upgrade your plan</h1>
      <p className="max-w-md text-sm text-gray-7">
        The free plan is limited to 10 todos. Subscribe to create as many as you need.
      </p>

      {!stripeConfigured && (
        <p className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Payments aren't configured yet — subscribing is disabled for now.
        </p>
      )}

      <div className="mt-8 grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-6 rounded-lg border border-gray-3 p-6 text-left">
          <div>
            <h2 className="text-lg font-semibold text-gray-12">Monthly</h2>
            <p className="mt-1">
              <span className="text-3xl font-semibold text-gray-12">
                {formatUsd(prices.monthly)}
              </span>
              <span className="text-sm text-gray-6"> / month</span>
            </p>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-gray-7">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <CheckIcon width={16} height={16} className="shrink-0 text-gray-12" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            onClick={() => subscribe('monthly')}
            disabled={!stripeConfigured || loadingPlan !== null}
          >
            {loadingPlan === 'monthly' ? 'Redirecting…' : 'Subscribe monthly'}
          </Button>
        </div>

        <div className="flex flex-col gap-6 rounded-lg border-2 border-gray-12 p-6 text-left">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-12">Annual</h2>
              <span className="rounded-full bg-gray-12 px-2 py-0.5 text-xs font-medium text-white dark:text-black">
                Save ~17%
              </span>
            </div>
            <p className="mt-1">
              <span className="text-3xl font-semibold text-gray-12">
                {formatUsd(prices.annual)}
              </span>
              <span className="text-sm text-gray-6"> / year</span>
            </p>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-gray-7">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <CheckIcon width={16} height={16} className="shrink-0 text-gray-12" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            onClick={() => subscribe('annual')}
            disabled={!stripeConfigured || loadingPlan !== null}
          >
            {loadingPlan === 'annual' ? 'Redirecting…' : 'Subscribe annually'}
          </Button>
        </div>
      </div>
    </div>
  )
}
