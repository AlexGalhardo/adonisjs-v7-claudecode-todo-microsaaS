# Contributing

This started as a personal learning project (see the README for context), but pull requests,
issues, and suggestions are welcome.

## Getting set up

Pick one of the setup scripts in [`setups/`](setups/) for your OS/database combo — they
validate prerequisites, create `.env`, install dependencies, run migrations, seed the
database, and start the dev server for you. See the README's "Development setup" section for
the full list.

## Before opening a PR

Run the full local check the same way `pre-push` and CI do:

```bash
npm run lint       # biome check
npm run typecheck  # tsc --noEmit (backend + frontend)
npm run test        # unit + functional + browser (E2E) suites
npm run build         # production build
```

All four must pass. `npm install` sets up Husky git hooks (`pre-commit` lints staged files,
`pre-push` runs the full check above, `commit-msg` validates commit messages) so most of this
is enforced automatically — don't bypass hooks with `--no-verify`.

## Conventions

- **Commit messages**: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`,
  `fix:`, `docs:`, `chore:`, etc.) — enforced by the `commit-msg` hook.
- **Language**: all user-facing text, routes, and URLs are in English, regardless of the
  language used in internal docs (`CLAUDE.md`, `docs/`, commit history) — see `CLAUDE.md` for
  the full rule set.
- **Architecture**: this project follows AdonisJS's conventions strictly (MVC, the framework's
  own folder structure, Lucid as the only ORM) — no parallel architecture invented on top. See
  [`docs/architecture.md`](docs/architecture.md) for the reasoning.
- **Formatting/linting**: [BiomeJS](https://biomejs.dev/) — run `npm run format` before
  committing if your editor doesn't do it automatically.

## Reporting bugs / requesting features

Open a GitHub issue with steps to reproduce (for bugs) or the use case (for features). If it
touches payments, never include real Stripe keys or customer data in the issue.

## License

By contributing, you agree your contributions will be licensed under the project's
[MIT License](LICENSE).
