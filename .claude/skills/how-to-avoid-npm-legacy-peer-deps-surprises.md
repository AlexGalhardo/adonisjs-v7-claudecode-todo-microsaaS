# How to avoid npm peer-dependency surprises in this project

`@adonisjs/ally@6.3.0` declares `peerOptional @adonisjs/inertia@^4.2.0`. This project uses
`@adonisjs/inertia@^5.0.1` (needed for everything else — Ally only touches it for sharing
OAuth errors to Inertia pages, which works fine against v5 in practice; the peer range is
just stale upstream). Without a fix, **plain `npm install` fails**:

```
npm error ERESOLVE could not resolve
npm error peerOptional @adonisjs/inertia@"^4.2.0" from @adonisjs/ally@6.3.0
```

## The fix: a root `.npmrc`, not a flag on every command

```
# .npmrc
legacy-peer-deps=true
```

This makes `npm install` (bare, no flags) work everywhere — local dev, CI, Docker builds,
the `setups/*.sh` scripts — without anyone needing to remember `--legacy-peer-deps`.

## Why not just always pass `--legacy-peer-deps`?

Because it's easy to forget in exactly one place (a setup script, a CI step, a
Dockerfile stage) and get a confusing failure there instead. This bit the `setups/`
scripts in this project the first time they were actually run — `npm install` inside the
script failed with the ERESOLVE error above, because the script called plain `npm
install`, matching what a real user would type. The `.npmrc` fix makes the failure
impossible instead of relying on every call site remembering a flag.

## Docker builds need `.npmrc` copied explicitly

`node ace build` does **not** copy dotfiles like `.npmrc` into its `build/` output (only
specific meta files are copied — check what's actually in `build/` after running it rather
than assuming). A `production-deps` Docker stage that does
`COPY --from=build /app/build/package.json ./` and then `npm ci` will hit the same
ERESOLVE error unless `.npmrc` is copied into that stage separately, straight from the
original build context:

```dockerfile
COPY --from=build /app/build/package.json /app/build/package-lock.json ./
COPY .npmrc ./
RUN npm ci --omit=dev
```

(`npm ci` alone, without `.npmrc`, may still succeed if the lockfile already encodes a
resolvable tree — verified in this project — but don't rely on that implicitly; copying
`.npmrc` is cheap and removes the ambiguity entirely.)
