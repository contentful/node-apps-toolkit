# Architectural Decision Records

Decisions that shape how `@contentful/node-apps-toolkit` is built, published and secured.
Each record is anchored to the commit that implemented it, so the reasoning can be read
alongside the diff.

Add a new record as `YYYY-MM-DD-short-title.md` using the same
`Status` / `Context` / `Decision` / `Consequences` structure, and list it below.

| Date | Status | Title |
| --- | --- | --- |
| 2026-08-24 | Accepted | [Separate generated API docs from tracked decision records](./2026-08-24-separate-generated-docs-from-decision-records.md) |
| 2026-05-18 | Accepted | [Keep `contentful-management` as a type-only dependency (and follow its Node floor)](./2026-05-18-contentful-management-v12-as-a-type-only-dependency.md) |
| 2026-03-24 | Accepted | [Compare request signatures in constant time](./2026-03-24-constant-time-signature-comparison.md) |
| 2025-11-26 | Accepted | [Ignore dependency lifecycle scripts on install](./2025-11-26-ignore-dependency-lifecycle-scripts.md) |
| 2025-10-06 | Accepted | [Explicit logger namespaces instead of `__dirname`, and Vitest as the test runner](./2025-10-06-explicit-logger-namespaces-and-vitest.md) |
| 2025-01-07 | Accepted | [Dual ESM/CJS build with tsup and explicit subpath exports](./2025-01-07-dual-esm-cjs-build-with-tsup.md) |

> Note: typedoc writes generated API output to `docs/api/`, which is gitignored and rebuilt
> from source by the Pages workflow on every push to `main`. `docs/ADRs/` is hand-written and
> tracked. The two are kept in separate directories deliberately — see
> [Separate generated API docs from tracked decision records](./2026-08-24-separate-generated-docs-from-decision-records.md).
