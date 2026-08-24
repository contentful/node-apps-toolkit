# Explicit logger namespaces instead of `__dirname`, and Vitest as the test runner

- **Date:** 2025-10-06
- **Commit:** `753c274` — `feat: remove __dirname, __filename [EXT-6803] (#779)`

## Status

Accepted.

## Context

`createLogger` derived its `debug` namespace from `__filename`, and other modules relied on
`__dirname` to locate fixtures. Both identifiers exist only in CommonJS. After the dual
ESM/CJS build landed (see
[`2025-01-07-dual-esm-cjs-build-with-tsup.md`](./2025-01-07-dual-esm-cjs-build-with-tsup.md)),
the ESM output relied on tsup's `shims: true` to inject them — which worked locally but
failed in some hosting environments where the shim did not apply, notably bundled
serverless targets.

The test suite had the same problem from the other side: Mocha plus a CJS-only
configuration could not exercise the ESM build at all, so the very failure mode being
fixed was invisible to CI.

## Decision

Remove every dependency on `__dirname`/`__filename` from library code and migrate the test
suite to **Vitest**.

- `createLogger` now takes `{ namespace }` or `{ filename }` explicitly. Call sites pass a
  literal, e.g. `createLogger({ namespace: 'get-management-token.js' })` and
  `createLogger({ namespace: 'utils/http' })`. The `{ filename }` form is retained for
  backwards compatibility and simply strips the extension.
- `vitest.config.ts` runs `environment: 'node'` with `globals: true` over both
  `src/**/*.spec.ts` and `test/**/*.test.ts`, loading `dotenv/config` and
  `vitest.setup.ts` as setup files.
- `vitest.setup.ts` rewrites `BASE_URL` back to `https://api.contentful.com` when Vite has
  defaulted it to `/`, so the HTTP client's `prefixUrl` is valid under the test runner.

## Consequences

**Enables:** the published ESM output no longer depends on build-time shims for CJS
globals, and one runner covers unit and integration tests with the same module resolution
the package actually ships.

**Trade-off:** logger namespaces are now string literals that can drift from the file they
sit in — nothing enforces the correspondence. In exchange they are stable across bundling,
which the derived version was not.

**Follow-up:** `mocha` and `sinon` remain in `devDependencies` although Vitest is the
runner; they are leftovers, not a second supported path. `npm run test:unit` and
`npm run test:integration` both invoke `vitest run`.
