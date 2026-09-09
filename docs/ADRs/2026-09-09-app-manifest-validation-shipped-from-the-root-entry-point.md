# Ship app manifest validation from the root entry point, as patterns plus predicates

- **Date:** 2026-09-09
- **Commit:** `feat(validation): add shared App Action and Function manifest validation`

## Status

Accepted.

## Context

The rules that decide whether an app manifest is valid — what an `allowNetworks` entry may
look like, how long an App Action `id` may be, which extensions a hosted code `path` may
end in, which event topics a Function may accept — were implemented twice: once in the CLI
that validates a manifest before upload, and once in the service that validates the same
manifest on receipt.

The two copies drifted, and the drift was customer-visible. A wildcard domain with more
than one subdomain label (e.g. `*.eu.example.com`) was rejected because one copy's wildcard
branch matched a single label where the other allowed any number. A
hosted code path's extension separator was an unescaped `.`, so a path with no separator
at all was accepted. Each fix had to be made, reviewed and released twice, and nothing
prevented the next divergence.

Two consumers need the same rules in two different shapes: one composes JSON Schema and
needs the raw `pattern` string and the numeric bounds as data; the other validates
imperatively and needs a callable predicate.

## Decision

Put the rules in this package, in `src/validation/`, and export each one as **both** a
pattern string (or constant) and a predicate.

- **Both shapes, one source.** `NETWORK_ADDRESS_PATTERN` is the string a schema embeds;
  `isValidNetworkAddress` is the predicate a script calls, and it compiles that same
  pattern. Neither consumer reimplements the rule, and neither has to adapt to the other's
  validation engine. Patterns stay engine-agnostic strings for exactly this reason — no
  validation library appears in this package's dependencies.
- **Exported from the root entry point**, not only the `./validation` subpath. A subpath
  export resolves only under `moduleResolution` `node16`/`nodenext`/`bundler`; a consumer
  on `node` (node10) resolution cannot see it at all, and gets `TS2307` with no runtime
  error to explain it. The subpath is still declared for consumers who prefer it.
- **`FUNCTION_EVENT_TYPES` is derived from `FunctionTypeEnum`**, via `Object.values`, rather
  than declared as a second list of the same nine topics. The enum already existed here and
  is the named-topic surface; the derived array is the same values as data, for building a
  schema `enum` or checking membership. A spec asserts the two agree, so adding a topic to
  the enum cannot leave the array behind.

## Consequences

**Enables:** a validation rule is fixed once and both consumers pick it up on a version
bump. Backend and CLI cannot disagree about whether a manifest is valid, so a manifest that
passes locally is not rejected on upload.

**Trade-off:** this is now a published contract. A rule that gets *stricter* rejects input
that used to be accepted, which is breaking for consumers even though no export changed
name — it needs a major release, and tightening a bound is not a `fix`. Every rule also
carries a boundary spec, because a regression here is silent until a customer hits it.

**Deliberately not done:** the predicates are not schema objects from a validation library.
Adding one would force it on every consumer of this package, including those that only mint
a token, and would still not serve the consumer whose schema engine differs.
