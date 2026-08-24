# Architectural Decision Records

Decisions that shape how `@contentful/node-apps-toolkit` is built, published and secured.
Each record is anchored to the commit that implemented it, so the reasoning can be read
alongside the diff.

Add a new record as `YYYY-MM-DD-short-title.md` using the same
`Status` / `Context` / `Decision` / `Consequences` structure, and list it below.

| Date | Status | Title |
| --- | --- | --- |
| 2026-05-18 | Accepted | [Keep `contentful-management` as a type-only dependency (and follow its Node floor)](./2026-05-18-contentful-management-v12-as-a-type-only-dependency.md) |
| 2026-03-24 | Accepted | [Compare request signatures in constant time](./2026-03-24-constant-time-signature-comparison.md) |
| 2025-11-26 | Accepted | [Ignore dependency lifecycle scripts on install](./2025-11-26-ignore-dependency-lifecycle-scripts.md) |
| 2025-10-06 | Accepted | [Explicit logger namespaces instead of `__dirname`, and Vitest as the test runner](./2025-10-06-explicit-logger-namespaces-and-vitest.md) |
| 2025-01-07 | Accepted | [Dual ESM/CJS build with tsup and explicit subpath exports](./2025-01-07-dual-esm-cjs-build-with-tsup.md) |

> Note: `docs/` also holds generated typedoc API output, which the release job rebuilds and
> commits. `docs/ADRs/` is hand-written and outside typedoc's scope (`.typedocrc.json`
> writes to `docs/` but does not touch this directory).
