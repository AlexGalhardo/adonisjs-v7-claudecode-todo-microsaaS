# How to avoid breaking @inject() when Biome reorganizes imports

`biome check --write .` (and its `assist.organizeImports`/`lint/style/useImportType` rule)
will happily rewrite a constructor-injected service's import into a type-only one:

```ts
// Before
import TodoService from '#services/todo_service'

// After Biome "helpfully" fixes it
import type TodoService from '#services/todo_service'
```

That looks harmless — `TodoService` is only ever used as a type annotation in the file — but
it breaks the app at runtime. AdonisJS's IoC container resolves `@inject()` constructor
parameters via `emitDecoratorMetadata` (`design:paramtypes`), which needs the real, live
binding the import creates. `import type` is erased entirely at compile time, so TypeScript
emits `design:paramtypes: [Object]` instead of `[TodoService]`, and every request through
that controller/service crashes with:

```
Cannot inject "[Function: Object]" in "[class SomeController]"
```

This actually happened once in this project: migrating from ESLint to BiomeJS, a blanket
`biome check --write .` auto-converted the constructor-param import in every single
`@inject()`-decorated controller (9 files) to `import type`, and the entire test suite
started failing with 500s — nothing in the diff *looked* wrong (imports still resolved and
typechecked fine; the break is TS-metadata-only, invisible until you actually hit the route
at runtime).

**Fix already in place:** `biome.json` sets `linter.rules.style.useImportType: "off"`
project-wide, since `@inject()` constructor DI is used throughout `app/controllers` and
`app/services`. Don't re-enable that rule without auditing every `@inject()`-decorated class
first — and if you ever see `Cannot inject "[Function: Object]"`, check whether the
constructor param's class got imported with `import type` somewhere.
