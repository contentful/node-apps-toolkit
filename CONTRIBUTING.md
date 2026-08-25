# Contributing to node-apps-toolkit

Please take a moment to review this document in order to make the contribution process easy
and effective for everyone involved.

This package is published publicly to npm as `@contentful/node-apps-toolkit`. Anything
exported from a module `index.ts` is a public contract — see [AGENTS.md](./AGENTS.md) for
the guardrails and [ARCHITECTURE.md](./ARCHITECTURE.md) for how the pieces fit together.

## Where to Look First

| If you are changing… | Start at |
| --- | --- |
| CMA token minting or caching | `src/keys/get-management-token.ts` |
| Request signing | `src/requests/sign-request.ts`, `src/requests/utils.ts` |
| Request verification | `src/requests/verify-request.ts`, `src/requests/timing-safe-string-equal.ts` |
| Input validation rules | `src/requests/typings/validators.ts` |
| Function / app-event / app-action types | `src/requests/typings/` |
| The published entry points | `tsup.config.js` **and** `package.json#exports` **and** the module's `index.ts` |
| CI or release behaviour | `.circleci/config.yml`, `.releaserc` |
| Why something is the way it is | `docs/ADRs/` |

## Prerequisites

- Node.js `>=20` (`engines.node`). CI runs the test matrix on 20, 22 and 24.
- npm (the repo uses `package-lock.json`; there is no pnpm/yarn setup).
- `openssl` on your `PATH` — used to generate the test key pair.

## Getting Started

```bash
npm ci
npm run build
```

Git hooks are managed by husky, but `.npmrc` sets `ignore-scripts=true`, so the `prepare`
script does not run on install. Install the hooks once, by hand:

```bash
npx husky install
```

## Development Workflow

1. Branch off `main`.
2. Make the change, with unit tests beside it as `src/**/*.spec.ts`.
3. Run `npm run lint` and `npm run test:unit`.
4. Commit using the [conventional commit format](https://conventionalcommits.org).
5. Open a PR against `main`. `@contentful/team-extensibility` is the code owner.

If you are adding or changing a **public export**, update the module's `index.ts`, and if it
is a new subpath, `tsup.config.js#entry` and `package.json#exports` as well. All three must
agree — a mismatch builds cleanly and breaks at the consumer's resolver.

## Commands

| Command | What it does |
| --- | --- |
| `npm run build` | tsup → `lib/` (CJS + ESM + `.d.ts`), then copies `index.d.ts` to `index.d.cts` |
| `npm run build:docs` | typedoc → `docs/api/` (generated, gitignored, rebuilt by CI) |
| `npm run build:all` | both of the above |
| `npm run start:docs` | serves the built docs locally |
| `npm run generate:key` | `test/make-private-keys.sh` → `keys/key.pem`, `keys/key.der.pub` |
| `npm run test:unit` | `vitest run src` |
| `npm run test:integration` | `vitest run test` |
| `npm test` | generates a key pair, then runs unit + integration tests |
| `npm run lint` | `eslint --ext .ts ./src` |
| `npm run lint:fix` | the same, with `--fix` |
| `npm run format` | `prettier --write ./{src,test}/**/*.ts` |

## Folder Structure

Library source and its unit tests live in `src/`. Integration tests live in `test/`.
Decision records live in `docs/ADRs/` and are tracked. Generated typedoc output goes to
`docs/api/`, which is gitignored — typedoc empties that directory on every run, so nothing
hand-written may be placed inside it.

## Testing

The runner is [Vitest](https://vitest.dev/) (`environment: 'node'`, `globals: true`).
`mocha` and `sinon` are still present in `devDependencies` as leftovers — new tests use
Vitest.

### Unit tests

```bash
npm run test:unit
```

### Integration tests

Integration tests generate a key pair, register it against a real app definition, and call
the real Contentful Management API.

```bash
npm run generate:key
npm run test:integration
```

> **:warning: Please note**
>
> All environment variables in [`.env.tpl`](./.env.tpl) must be provided (copy it to
> `.env`). Because these tests mutate a real app definition, point them at a test
> organization — never at production. The generated `keys/` directory is git-ignored and
> `.npmignore`d; never commit it.

## Code Style & Conventions

- **Formatting** is handled by `prettier`. The husky `pre-commit` hook runs `lint-staged`,
  which applies `lint:fix` and `format` to staged `*.ts` files — so you should not need to
  think about it, provided you ran `npx husky install`.
- **Linting** uses [ESLint](https://eslint.org/) with
  [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint). Most editors
  pick the config up automatically.
- **Validate untrusted input once, at the boundary**, using the `runtypes` validators.
  Internal helpers assume validated input.
- **Never log secrets, private keys or tokens.** The `debug` logger is off by default; keep
  key material out of it.
- **`contentful-management` is imported with `import type` only.** A runtime import would
  pull the whole CMA client into every consumer's bundle.

## Commit Convention

All commit messages must meet the [conventional commit format](https://conventionalcommits.org);
the `lint-commits` CI job enforces it. The type drives the release:

| Type | Release |
| --- | --- |
| `fix:` | patch |
| `feat:` | minor |
| any type with a `BREAKING CHANGE:` footer | major |
| `docs:`, `chore:`, `test:`, `refactor:` | none |

## Branch Strategy & Release Process

Releases are automated with semantic-release from `main`; `next` publishes prereleases.
The release commits `CHANGELOG.md`, the generated `docs`, `package.json` and
`package-lock.json` back to the branch and publishes to npm.

Do not run `npm publish` or `semantic-release` locally — the CircleCI `semantic-release` job
owns version numbers and tags, and takes its credentials from Vault.

## Pull Requests

Good pull requests — patches, improvements, new features — are a fantastic help. They
should remain focused in scope and avoid unrelated commits.

Please ask first if somebody else is already working on this, or if you are unsure the
feature is in scope. If a related issue does not already exist, please open one describing
the change you plan to make.

## CI/CD

CircleCI runs, on every push:

- `lint-and-test` on a Node 20 / 22 / 24 matrix,
- `lint-commits`,
- `build` (library + typedoc),

and then `semantic-release`, which requires all three. Secrets come from Vault
(`packages-read` for installs, `semantic-release` for publishing) — do not add them to
CircleCI project settings or to the repo.
