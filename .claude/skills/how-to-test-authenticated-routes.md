# How to test authenticated routes with Japa's API client

Setup: `tests/bootstrap.ts` wires `apiClient()`, `authApiClient()`, `shieldApiClient()`,
`sessionApiClient()`, `inertiaApiClient()`. These add `.loginAs()`, `.withGuard()`,
`.withCsrfToken()`, `.withInertia()` and the matching response assertions.

## Authenticating a request

```ts
// Session guard (web routes) — CSRF required for POST/PUT/PATCH/DELETE
await client.post('/todos').loginAs(user).withCsrfToken().form({ title: 'x' })

// Token guard (API routes) — no CSRF, guard must be named explicitly
await client.post('/api/todos').withGuard('api').loginAs(user).json({ title: 'x' })
```

`.loginAs(user)` alone uses the **default** guard (`web`). For any other guard, use
`.withGuard('<name>').loginAs(user)`.

## Gotcha 1: the client follows redirects by default

`response.assertStatus(302)` after a mutating request will show the **final** followed
page's status (e.g. 200), not the redirect itself. Two ways to test correctly:

- Chain `.redirects(0)` to inspect the raw redirect (`assertStatus(302)` +
  `response.header('location')`).
- Use `response.assertRedirectsTo('/path')` **without** `.redirects(0)` — this helper
  reads the client's followed-redirect history, so it needs redirects to actually be
  followed.

Don't mix the two: `assertRedirectsTo` on a `.redirects(0)` response always fails (empty
history).

## Gotcha 2: `exceptRoutes` in `config/shield.ts` only does exact matches

`shieldConfig.csrf.exceptRoutes` compares against `ctx.route.pattern` with `.includes()` —
**no glob support**. `exceptRoutes: ['/api/*']` matches nothing. Use the predicate form:

```ts
exceptRoutes: (ctx) => ctx.request.url().startsWith('/api/'),
```

## Gotcha 3: VineJS/Bouncer exceptions pick HTML-vs-JSON from the `Accept` header

Both `E_VALIDATION_ERROR` and `E_AUTHORIZATION_FAILURE` implement their own
`handle(error, ctx)` that checks `ctx.request.accepts(['html', 'json', ...])`. For a
mutating (`POST`/`PUT`/`PATCH`/`DELETE`) request that "accepts html" (the default when no
explicit `Accept` header is sent — including from `.json()` request-body calls, which set
`Content-Type` but not `Accept`), the exception redirects back with a flashed error
instead of returning a raw status code. That's correct/desired behavior for the Inertia
web app, but wrong for a pure REST API. Fix at the app level, not per-test: in
`app/exceptions/handler.ts`, force JSON for the API namespace before delegating:

```ts
async handle(error: unknown, ctx: HttpContext) {
  if (ctx.request.url().startsWith('/api/')) {
    ctx.request.request.headers.accept = 'application/json'
  }
  return super.handle(error, ctx)
}
```

## Gotcha 4: reading flashed validation/error data in tests

- VineJS validation errors flash under `inputErrorsBag` (field → messages), not `errors`.
  Check with `assert.property(response.flashMessage('inputErrorsBag'), 'fieldName')`.
- Bouncer authorization failures flash the message under `error` (same key the app's own
  Inertia layout reads for its toast) — `response.assertFlashMessage('error')`.
- The session plugin's `assertHasValidationError('field')` helper checks flash key
  `'errors'`, which nothing in this app actually populates — don't rely on it here.

## Gotcha 5: session data does NOT carry over between separate `client.*()` calls

Each `client.get(...)`/`client.post(...)` call gets its own fresh `SessionClient` — plain
non-auth session writes from one response (e.g. `session.put('pending_2fa_secret', ...)`
during a GET) are **not** visible to a later `client.post(...)` in the same test, even
reusing `.loginAs(user)` on both. This breaks any flow where a controller reads back
session state written by a previous request (2FA enrollment's pending secret, the login →
2FA-challenge handoff, etc.) — the second request silently sees an empty session and takes
whatever "missing" branch the controller has, not the one you meant to exercise.

Fix: explicitly re-seed the session data on the next request with `.withSession({...})`,
using values read from the first response (`response.inertiaProps`, `response.body()`,
etc.) rather than assuming continuity:

```ts
const enrollPage = await client.get('/settings/two-factor').loginAs(user).withInertia()
const secret = enrollPage.inertiaProps.secret as string

await client
  .post('/settings/two-factor')
  .loginAs(user)
  .withCsrfToken()
  .withSession({ pending_2fa_secret: secret }) // <- re-seed, don't assume it's still there
  .form({ code: totpCodeFor(secret) })
```
