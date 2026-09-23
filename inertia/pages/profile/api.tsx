import { Form } from '@adonisjs/inertia/react'
import { router } from '@inertiajs/react'
import { ApiReferenceReact } from '@scalar/api-reference-react'
import { useMemo, useState } from 'react'
import Button from '~/components/button'
import CopyButton from '~/components/copy_button'
import TextField from '~/components/text_field'
import { buildOpenApiSpec } from '~/lib/openapi_spec'
import '@scalar/api-reference-react/style.css'

type ApiToken = {
  id: string
  name: string | null
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string | null
}

function formatDate(value: string | null) {
  if (!value) return 'never'
  return new Date(value).toLocaleString()
}

export default function ProfileApi({
  tokens,
  newToken,
}: {
  tokens: ApiToken[]
  newToken?: string
}) {
  const [tokenName, setTokenName] = useState('')
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const spec = useMemo(() => buildOpenApiSpec(baseUrl), [baseUrl])

  function revokeToken(id: string) {
    router.delete(`/profile/api/tokens/${id}`)
  }

  const curlExample = `curl ${baseUrl}/api/todos \\
  -H "Authorization: Bearer YOUR_TOKEN"`

  const fetchExample = `const response = await fetch('${baseUrl}/api/todos', {
  headers: { Authorization: 'Bearer YOUR_TOKEN' },
})
const { data } = await response.json()`

  return (
    <div className="flex flex-col gap-10 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-12">API</h1>
        <p className="text-gray-7">
          Generate personal access tokens to call the REST API below on your own behalf.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-12">Your tokens</h2>

        {newToken && (
          <div className="flex flex-col gap-2 rounded-md border border-matrix bg-matrix/10 p-4">
            <p className="text-sm font-medium text-gray-12">
              Copy this token now — it won&apos;t be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded bg-gray-1 px-3 py-2 text-sm text-gray-12">
                {newToken}
              </code>
              <CopyButton
                text={newToken}
                className="inline-flex h-10 items-center justify-center rounded-md border border-matrix px-4 text-sm font-medium text-matrix hover:bg-matrix hover:text-black"
              >
                Copy
              </CopyButton>
            </div>
          </div>
        )}

        {tokens.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-4 py-8 text-center text-gray-6">
            No tokens yet.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-gray-3 rounded-md border border-gray-3">
            {tokens.map((token) => (
              <li key={token.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-12">
                    {token.name ?? 'Unnamed token'}
                  </p>
                  <p className="text-xs text-gray-6">
                    Created {formatDate(token.createdAt)} · Last used {formatDate(token.lastUsedAt)}{' '}
                    · Expires {formatDate(token.expiresAt)}
                  </p>
                </div>
                <Button variant="secondary" onClick={() => revokeToken(token.id)}>
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        )}

        <Form
          route="profile_api.store"
          className="flex items-end gap-3"
          onSuccess={() => setTokenName('')}
        >
          {({ errors, processing }) => (
            <>
              <div className="flex-1">
                <TextField
                  label="New token name"
                  name="name"
                  id="tokenName"
                  placeholder="e.g. CLI, CI pipeline"
                  value={tokenName}
                  onChange={(event) => setTokenName(event.target.value)}
                  error={errors.name}
                />
              </div>
              <Button type="submit" disabled={processing}>
                Generate token
              </Button>
            </>
          )}
        </Form>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-12">Quick examples</h2>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-12">cURL</span>
            <CopyButton text={curlExample} className="text-xs text-gray-6 hover:text-gray-12">
              Copy
            </CopyButton>
          </div>
          <pre className="overflow-x-auto rounded-md border border-gray-3 bg-gray-1 p-4 text-xs text-gray-12">
            {curlExample}
          </pre>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-12">JavaScript (fetch)</span>
            <CopyButton text={fetchExample} className="text-xs text-gray-6 hover:text-gray-12">
              Copy
            </CopyButton>
          </div>
          <pre className="overflow-x-auto rounded-md border border-gray-3 bg-gray-1 p-4 text-xs text-gray-12">
            {fetchExample}
          </pre>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-12">Full reference</h2>
        <div className="overflow-hidden rounded-md border border-gray-3">
          <ApiReferenceReact
            configuration={{
              spec: { content: spec },
              hideClientButton: true,
              darkMode: false,
              hideDarkModeToggle: true,
              telemetry: false,
            }}
          />
        </div>
      </section>
    </div>
  )
}
