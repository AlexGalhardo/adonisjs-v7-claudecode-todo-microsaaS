# How to add an email-based, one-time-token flow

Reference: password reset and magic link both use this exact pattern (see
`app/controllers/password_resets_controller.ts` and `app/controllers/magic_links_controller.ts`).
Reach for it any time a flow needs "email a link, click it once, it expires."

## 1. Reuse the shared `auth_tokens` table, don't add a new one

`database/migrations/*_create_auth_tokens_table.ts` already has `user_id`, `type`
(discriminator column, extend the enum for a new flow), `token_hash`, `expires_at`,
`used_at`. Adding a new flow means adding a new `type` value, not a new migration.

## 2. `AuthTokenService` handles the token lifecycle

```ts
const token = await authTokenService.create(user, 'your_new_type', ttlMinutes)
// -> plain token string, only its SHA-256 hash is persisted

const record = await authTokenService.verify(plainToken, 'your_new_type')
// -> null if missing/expired/already used, otherwise the AuthToken (with .user preloaded)

await authTokenService.consume(record) // marks used_at, prevents replay
```

Never store the plain token — only its hash. SHA-256 (fast hash) is correct here, not the
password hasher (bcrypt/scrypt) — these are high-entropy random tokens looked up by exact
match, not user-supplied secrets needing brute-force resistance per guess.

## 3. Mail class

`node ace make:mail your_flow_notification` → extend `BaseMail`, take the target user and
a pre-built URL in the constructor, reuse `app/mails/email_layout.ts` for the HTML body
(don't build a new template unless the email actually needs more than a heading + message
+ button).

## 4. Controller shape

- `store` (request the email): validate email, `User.findBy('email', ...)`, and **always
  respond with the same success message whether or not the user exists** — this is what
  prevents account enumeration. Only send the actual email when a user was found.
- A GET (or the callback route) that verifies + consumes the token and acts (log the user
  in, show a form, etc.). Decide up front whether verification and consumption happen in
  the same request (magic link — one click does everything) or across two requests
  (password reset — GET shows a form, POST verifies+consumes) — the token stays valid
  between them either way since `verify()` doesn't consume.

## 5. Rate limit the request endpoint

Add a named throttle in `start/limiter.ts` (3 requests / 15 minutes per IP is what both
existing flows use) and `.use(theThrottle)` on the route — this endpoint accepts an
arbitrary email and sends mail, so it's a spam vector without one.

## 6. Testing

Use `mail.fake()` (see `docs/testing.md`) — never depends on a real SMTP server. Pull the
token out of the faked mail's URL property (make it `public` on the Mail class
constructor param specifically so tests can read it back). Cover: happy path, unknown
email still responds successfully, invalid/expired token rejected, token can't be reused.
