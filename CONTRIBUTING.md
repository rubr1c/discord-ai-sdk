# Contributing to discord-ai-sdk

Thanks for contributing! This project is a TypeScript SDK that bridges [Vercel AI SDK](https://sdk.vercel.ai) with [discord.js v14](https://discord.js.org/). Please follow the guidelines below to keep things clean and consistent.

---

## Getting started

- Default branch: `master`
- Package manager: [pnpm](https://pnpm.io)
- Build: [tsup](https://tsup.egoist.dev/)
- Tests: [Vitest](https://vitest.dev/)
- Docs: [TypeDoc](https://typedoc.org/)

Install dependencies:

```sh
pnpm install
```

Useful scripts:

```sh
pnpm lint        # check lint
pnpm lint:fix    # auto-fix lint issues
pnpm format      # format with Prettier
pnpm typecheck   # run TypeScript type check
pnpm build       # build with tsup
pnpm test        # run tests
```

---

## Branching & Pull Requests

- Open an issue for significant changes before starting work.
- Branch naming:
  - `feat/<short-description>`
  - `fix/<short-description>`
  - `docs/<short-description>`
  - `chore/<short-description>`

- Keep PRs focused and small. Link issues in the PR description.

---

## Coding style

- ESLint + Prettier enforce style — run them before committing.
- Use **named exports only**. Avoid default exports.
- No top-level side effects; keep modules pure.
- Public APIs must be explicit and stable. Avoid exposing internals.
- Handle errors with typed Errors and actionable messages.
- Respect Discord API limits: defer if >2s, backoff on 429s, check permissions.

---

## TypeScript

- Strong typing is required. No `any`.
- Public APIs: explicit input and return types.
- Use `interface` for public contracts, `type` for unions/utilities.
- Prefer immutable patterns (`readonly`, avoid mutation).
- Add JSDoc for all public exports.

---

## Tests

- Use Vitest. Place tests under `tests/`, mirroring `src/`.
- No real Discord/network calls — always mock.
- Test edge cases (rate limits, permission errors, invalid inputs).
- Run tests locally before PRs.

---

## Documentation

- Add/update JSDoc for all public APIs.
- Update `README.md`, `docs/`, and `examples/` if you add or change public APIs.

---

## Commits

- Follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat(auth): add token refresh helper`
  - `fix(client): handle 429 retry-after`
  - `docs(readme): update usage example`

---

## PR checklist

- [ ] Lint + Prettier pass
- [ ] Type-check passes
- [ ] Tests added/updated and passing
- [ ] Build succeeds
- [ ] Docs/examples updated if API changed
- [ ] PR description links issues and explains changes
