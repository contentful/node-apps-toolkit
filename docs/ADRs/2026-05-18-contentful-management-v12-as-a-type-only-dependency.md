# Keep `contentful-management` as a type-only dependency (and follow its Node floor)

- **Date:** 2026-05-18
- **Commit:** `0da1c84` — `feat: upgrade contentful-management to v12 (#823)`, released as 4.0.0 (`088983a`)

## Status

Accepted.

## Context

The toolkit's public type surface describes things the CMA defines: app-event payloads
(`CommentProps`, `TaskProps`, `ScheduledActionProps`, `WorkflowProps`, `ReleaseProps`, …),
`AppActionCategoryType`, and the `PlainClientAPI` handed to app-action handlers in
`AppActionCallContext`. Re-declaring those shapes locally would guarantee drift against the
API they mirror.

`contentful-management` v12 raised its own minimum to Node 20 (issue #822), which forced a
decision: absorb the floor, or vendor the types to stay on Node 18.

## Decision

Depend on `contentful-management` ^12 for **types only**, and match its Node requirement.

- Every import of it in `src/` is an `import type` — `src/requests/typings/appAction.ts`,
  `event-payloads.ts` and `function.ts`. No value is ever constructed. As the commit
  message records: *"The toolkit already uses the plain client API exclusively (type-only
  imports), so no source changes are needed."*
- `engines.node` moved to `>=20`, released as a major with a `BREAKING CHANGE:` footer.
  Node 18 is no longer supported.
- Consumers instantiate their own CMA client; the toolkit only mints the token it needs
  (see `getManagementToken`).

## Consequences

**Enables:** payload types stay authoritative and update with a dependency bump rather than
a hand-written patch, and consumers pay no bundle cost for a CMA client they may not use.

**Trade-off:** a major version of `contentful-management` can become a major version of this
package even when no code changes — as happened here, where a Node floor propagated
straight through to a 4.0.0 release. It also means the dependency must remain in
`dependencies` (not `devDependencies`), because the published `.d.ts` files reference it.

**Follow-up:** CI's `lint-and-test` matrix runs Node 20, 22 and 24 — the supported range,
with no Node 18 entry left behind. A runtime import of `contentful-management` would
silently undo this decision and is called out as a guardrail in `AGENTS.md`.
