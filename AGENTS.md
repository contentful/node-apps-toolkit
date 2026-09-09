# AGENTS.md — @contentful/node-apps-toolkit

Server-side helpers for building Contentful Apps in Node.js: minting CMA tokens from an
app key pair, and signing / verifying request signatures. This is a **public npm package**
consumed by Contentful apps, app backends, and third-party integrators — every change to
`src/` is a change to a published API surface.

## Quick Reference

| Task | Command / Location |
| --- | --- |
| Install | `npm ci` |
| Build the library | `npm run build` (tsup → `lib/`, dual CJS + ESM) |
| Build API docs | `npm run build:docs` (typedoc → `docs/api/`, gitignored) |
| Build both | `npm run build:all` |
| Unit tests | `npm run test:unit` (`vitest run src`) |
| Integration tests | `npm run test:integration` (`vitest run test`, needs `.env`) |
| Full test run | `npm test` (generates a key pair first) |
| Generate a test key pair | `npm run generate:key` → `keys/key.pem`, `keys/key.der.pub` |
| Lint | `npm run lint` (`eslint --ext .ts ./src`) |
| Format | `npm run format` (prettier) |
| Serve built docs locally | `npm run start:docs` |
| Public entry point | `src/index.ts` |
| Token minting | `src/keys/get-management-token.ts` |
| Request signing / verification | `src/requests/sign-request.ts`, `src/requests/verify-request.ts` |
| Public type surface | `src/requests/typings/` |
| Manifest validation rules | `src/validation/` |
| Build config | `tsup.config.js`, subpath map in `package.json#exports` |
| Release config | `.releaserc`, `.circleci/config.yml` |
| Decision records | `docs/ADRs/` |

## Guardrails

- **This package is published publicly.** Anything exported from `src/index.ts`,
  `src/keys/index.ts`, `src/requests/index.ts`, `src/requests/typings/index.ts`,
  `src/utils/index.ts` or `src/validation/index.ts` is a public contract. Removing or
  renaming an export is a breaking change and must be released as one
  (`BREAKING CHANGE:` footer).
- **A validation rule in `src/validation/` is a published contract in both directions.**
  Loosening a rule is a `fix`; making one *stricter* rejects manifests that used to be
  accepted and is breaking, even though no export changed name. These rules are consumed by
  both the app CLI and the service that validates the same manifest on upload — the whole
  point is that the two agree, so a change here must land in lockstep with a version bump in
  every consumer, never in one alone. Each rule is exported twice on purpose: as a `*_PATTERN`
  string for consumers that compose JSON Schema, and as an `isValid*` predicate for consumers
  that validate imperatively. Keep both in step, and keep the patterns engine-agnostic
  strings — no validation library belongs in this package's dependencies. See
  [`docs/ADRs/2026-09-09-app-manifest-validation-shipped-from-the-root-entry-point.md`](./docs/ADRs/2026-09-09-app-manifest-validation-shipped-from-the-root-entry-point.md).
- **Do not weaken the crypto paths.** `verifyRequest` compares signatures with
  `timingSafeUtf8StringEqual` (`crypto.timingSafeEqual`), never `===`. See
  [`docs/ADRs/2026-03-24-constant-time-signature-comparison.md`](./docs/ADRs/2026-03-24-constant-time-signature-comparison.md).
- **Do not change the canonical-request serialization.** The string hashed by
  `signRequest` (`method\npath\nkey:value;key:value\nbody`), the header sort order, the
  header normalization (lowercase + trim), and the URI encoding in
  `getNormalizedEncodedURI` are all part of a cross-service protocol. A change here
  silently invalidates signatures produced by every other implementation.
- **Never log secrets, private keys, or tokens.** `src/utils/logger.ts` is a `debug`
  logger that is off by default; keep it that way and keep key material out of it.
  `createValidateStatusCode` logs response bodies on unexpected status codes — do not
  extend that to successful token responses.
- **Every new subpath entry point needs three edits in lockstep:** an entry in
  `tsup.config.js#entry`, an `exports` entry in `package.json` (both `import` → `.mjs`
  and `require` → `.cjs`, plus `types`), and a re-export from the module's `index.ts`.
  A mismatch here is invisible at build time and breaks consumers at install time.
- **Validate at the boundary, not inside.** Untrusted input is checked once by the
  `runtypes` validators in `src/requests/typings/validators.ts` (`CanonicalRequestValidator`,
  `SecretValidator`, `TimestampValidator`, `RequestMetadataValidator`); internal helpers
  assume validated input.
- **`contentful-management` is a type-only dependency.** It is imported with
  `import type` only. Do not introduce a runtime import of it — that would pull the whole
  CMA client into every consumer's bundle.

## Safety & Permissions

- Integration tests hit the real Contentful Management API. They require the variables in
  `.env.tpl` (`APP_ID`, `SPACE_ID`, `ENVIRONMENT_ID`, `ORGANIZATION_ID`,
  `PERSONAL_ACCESS_TOKEN`) and they **register a key pair on a real app definition**. Do
  not point them at production organizations.
- `npm run generate:key` writes RSA key material into `keys/`. That directory is
  git-ignored and `.npmignore`d — never commit or publish it.
- `ignore-scripts=true` in `.npmrc` is deliberate: dependency lifecycle scripts do not
  run on install. See
  [`docs/ADRs/2025-11-26-ignore-dependency-lifecycle-scripts.md`](./docs/ADRs/2025-11-26-ignore-dependency-lifecycle-scripts.md).
- CI secrets come from Vault (`packages-read` for installs, `semantic-release` for
  publishing). Do not add secrets to CircleCI project settings or to the repo.
- Publishing is automated. Do not run `npm publish` or `npx semantic-release` locally;
  the `semantic-release` CircleCI job on `main` owns version numbers and tags.

## Build & Quality

- **Language / runtime:** TypeScript, `engines.node >= 20`, tsup `target: node18` output.
- **Build:** tsup produces `lib/**` with `.cjs` + `.mjs` per entry point plus `.d.ts`;
  `npm run build` additionally copies `lib/index.d.ts` to `lib/index.d.cts` so strict
  `moduleResolution` consumers resolve CJS types. `files: ["lib/**/*"]` is the only thing
  published.
- **Tests:** Vitest, `environment: 'node'`, `globals: true`. Unit specs live beside the
  code as `src/**/*.spec.ts`; integration tests are `test/**/*.test.ts`. `dotenv/config`
  and `vitest.setup.ts` are loaded as setup files.
- **CI (CircleCI):** `lint-and-test` runs on a Node 20 / 22 / 24 matrix, `lint-commits`
  and `build` (library + typedoc) run in parallel, and `semantic-release` requires all
  three.
- **Commits:** Conventional Commits, enforced in CI. `feat` → minor, `fix` → patch,
  `BREAKING CHANGE:` → major. `docs`/`chore` do not release.
- **Release:** semantic-release from `main` (and prereleases from `next`), publishing to
  npm and committing `CHANGELOG.md`, `package.json`, `package-lock.json` back. Generated
  typedoc output is **not** committed — `docs/api/` is gitignored and the Pages workflow
  rebuilds it on every push to `main`. `docs/ADRs/` is hand-written and tracked; typedoc must
  never be pointed at it. See
  [`docs/ADRs/2026-08-24-separate-generated-docs-from-decision-records.md`](./docs/ADRs/2026-08-24-separate-generated-docs-from-decision-records.md).
