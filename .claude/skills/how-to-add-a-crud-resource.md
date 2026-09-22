# How to add a CRUD resource (AdonisJS v7 + Inertia + VineJS + Bouncer)

Reference flow used to build the `Todo` resource. Follow this order for any new
user-owned resource in this codebase.

## 1. Migration

```bash
node ace make:migration <table_name>
```

Write the schema by hand (FK to `users` with `onDelete('CASCADE')` for user-owned
resources). Then run:

```bash
node ace migration:run
```

This **auto-generates** a `<Name>Schema` class in `database/schema.ts` (a generated,
do-not-edit file scanned from the live DB). Never hand-write Lucid columns — the schema
class is derived from the migration.

## 2. Model

```ts
// app/models/<name>.ts
import User from '#models/user'
import { <Name>Schema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class <Name> extends <Name>Schema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
```

Add the inverse relation on `User` (`@hasMany`) if useful. The circular import between
the two model files is normal Lucid convention — relation decorators use lazy closures.

## 3. Validators (VineJS)

`app/validators/<name>.ts` — separate `create<Name>Validator` / `update<Name>Validator`
(update fields optional).

## 4. Service

`app/services/<name>_service.ts` — plain class, one method per operation
(`list(user)`, `create(user, payload)`, `update(model, payload)`, `delete(model)`).
**Explicitly set boolean/default columns in `.create()`** — SQLite inserts don't return
generated defaults, so the in-memory instance would otherwise read them as `undefined`.

## 5. Policy (Bouncer)

```bash
node ace make:policy <name>
```

Implement `view`/`update`/`delete` checking ownership (`resource.userId === user.id`).

## 6. Controllers (web + API)

Both controllers take the service via constructor injection — **this requires the
`@inject()` class decorator** (`import { inject } from '@adonisjs/core'`), not just a
typed constructor parameter. Without it, the container throws
`Cannot construct "[class X]" ... Did you forget to use @inject() decorator?`.

- Web controller: thin, calls `bouncer.with(<Name>Policy).authorize(...)`, redirects back
  with `session.flash('success'/'error', ...)`.
- API controller: same authorization, responds via `ctx.serialize(<Name>Transformer.transform(x))`
  (note: pass the **already-transformed** Item/Collection to `serialize()`, not the raw
  model plus a transformer class — that's a different, container-resolver-only overload).

## 7. Transformer

`app/transformers/<name>_transformer.ts` extends `BaseTransformer<Model>`, `toObject()`
picks the public fields. This is reused for both Inertia props (`Transformer.transform(x)`
passed directly as a page prop) and API JSON responses.

## 8. Routes

```ts
router.get('<name>s', [controllers.<Name>s, 'index'])
// ...
```

Route names are auto-derived as `<controller_basename>.<method>` (no `.as()` needed) —
**but this ignores directory nesting**, so a web controller and an API controller with the
same basename (e.g. `todos_controller.ts` in both `app/controllers/` and
`app/controllers/api/`) collide on the same route name. Give API routes explicit
`.as('api.<name>.<action>')` names.

## 9. Regenerate codegen after adding routes/policies/controllers

```bash
node ace codegen
```

Needed for `#generated/policies`, named-route types, and Tuyau's registry to pick up new
entries. `make:*` generator commands usually trigger this automatically; running it
manually is only needed after hand-editing `start/routes.ts` or `adonisrc.ts`.

## 10. Inertia page + components

Type page props from `@generated/data`'s `Data.<Name>` (auto-derived from the
transformer's `toObject()` return type) — do not redeclare the shape by hand.

## 11. Tests

- `tests/unit/<name>_service.spec.ts` — service methods against a real (transactional)
  test DB via `UserFactory`/`<Name>Factory`.
- `tests/functional/<name>s_web.spec.ts` and `<name>s_api.spec.ts` — see
  `how-to-test-authenticated-routes.md` for the CSRF/redirect/Accept-header gotchas.
- One `tests/browser/*.spec.ts` E2E flow covering the resource end-to-end.
