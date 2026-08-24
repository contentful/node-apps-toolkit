# Compare request signatures in constant time

- **Date:** 2026-03-24
- **Commit:** `d3503cb` — `fix: prevent timing attacks with ``===`` [ES-71] (#819)`

## Status

Accepted.

## Context

`verifyRequest` compared the incoming `x-contentful-signature` header against the
locally computed HMAC with `===`. String equality in V8 short-circuits at the first
differing byte, so the time taken to reject a signature leaks how many leading bytes were
correct. Against an endpoint an attacker can call repeatedly, that is enough to recover a
valid signature byte by byte without ever knowing the shared secret.

The naive fix — `crypto.timingSafeEqual` — throws a `RangeError` when the two buffers have
different lengths, and would also have changed behaviour for non-ASCII input if the
comparison were done over the wrong encoding.

## Decision

Introduce `timingSafeUtf8StringEqual` in `src/requests/timing-safe-string-equal.ts` and use
it as the only signature comparison in `verifyRequest`.

```ts
const aBuf = textEncoder.encode(a)
const bBuf = textEncoder.encode(b)
if (aBuf.length !== bBuf.length) {
  return false
}
return crypto.timingSafeEqual(aBuf, bBuf)
```

Encoding to UTF-8 bytes before comparing preserves exact `===` semantics — including hex
case sensitivity — while the length guard converts what would be a thrown `RangeError`
into a plain `false`.

Length is not treated as a secret here, and does not need to be: `SignatureValidator`
already constrains the header to exactly 64 characters, so a wrong-length signature is
rejected by validation before the comparison is reached. The commit added a regression test
asserting exactly that ordering.

## Consequences

**Enables:** signature verification no longer leaks a byte-position oracle, closing ES-71.

**Trade-off:** the comparison allocates two `Uint8Array`s per verification instead of
comparing strings in place. At 64 bytes this is immaterial next to the HMAC that precedes it.

**Follow-up:** `timingSafeUtf8StringEqual` is internal and deliberately not exported from
the package barrel. Any future secret-dependent comparison added to this library must use
it rather than `===`; that expectation is recorded in `AGENTS.md` under Guardrails.
