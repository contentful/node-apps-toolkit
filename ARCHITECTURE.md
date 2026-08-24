# Architecture — @contentful/node-apps-toolkit

## Overview

`@contentful/node-apps-toolkit` is a small, dependency-light Node.js library with two
responsibilities:

1. **Key exchange** — turn an app's RSA private key into a short-lived Contentful
   Management API (CMA) token scoped to one app installation.
2. **Request signatures** — produce and verify the `x-contentful-*` signature headers that
   Contentful attaches to outbound requests (app events, app actions, function
   invocations), so an app backend can prove a request really came from Contentful.

Everything else in the package is either a type surface for Contentful's function and
app-event payloads, or internal plumbing (an HTTP client and a `debug` logger).

There is no server, no state, and no persistence. The only network call the library makes
is the CMA token exchange.

## System Context

```
  App key pair (RSA)                      Contentful
        │                                     │
        ▼                                     │
  getManagementToken() ──── POST /spaces/:s/environments/:e/
        │                    app_installations/:i/access_tokens
        │                                     │
        ▼                                     │
    CMA token ────────────► contentful-management client (consumer's)


  Contentful ──── signed HTTP request ────► App backend
   (signs with        x-contentful-signature       │
    shared secret)    x-contentful-signed-headers  ▼
                      x-contentful-timestamp   verifyRequest(secret, req, ttl)
                      x-contentful-{crn,space-id,environment-id,app-id|user-id}
```

- **Upstream:** `api.contentful.com` (overridable via the `host` option or the `BASE_URL`
  environment variable) is the only service contacted.
- **Downstream consumers:** Contentful app backends, Contentful Functions, and
  third-party integrations. `contentful-management` v12 types are re-used for payload
  shapes but the client itself is never instantiated here.
- **Trust boundary:** the app's private key and the app's signing secret are both held by
  the consumer. This library never stores them.

## Internal Structure

| Path | Responsibility |
| --- | --- |
| `src/index.ts` | Public barrel: `getManagementToken` + everything from `./requests`. |
| `src/keys/get-management-token.ts` | JWT minting, CMA token exchange, in-process token cache. |
| `src/requests/sign-request.ts` | Canonical-request serialization + HMAC-SHA256 signature. |
| `src/requests/verify-request.ts` | Header extraction, TTL check, re-sign + constant-time compare. |
| `src/requests/timing-safe-string-equal.ts` | `crypto.timingSafeEqual` over UTF-8 bytes. |
| `src/requests/utils.ts` | Header normalization/sorting, URI encoding, context-header mapping. |
| `src/requests/exceptions.ts` | `ExpiredRequestException`. |
| `src/requests/typings/validators.ts` | `runtypes` validators for all untrusted input. |
| `src/requests/typings/request.ts` | `ContentfulHeader`, `ContentfulContextHeader`, signed-request types. |
| `src/requests/typings/function.ts` | `FunctionTypeEnum` and the request/response types per function type. |
| `src/requests/typings/event-payloads.ts` | `AppEventPayloadMap` — per-entity, per-action event payload types. |
| `src/requests/typings/appAction.ts` | `AppActionCallContext`, per-category request bodies. |
| `src/requests/typings/resources.ts` | `resources.search` / `resources.lookup` request and response types. |
| `src/utils/http.ts` | `got` instance (`prefixUrl`, 3 retries) + `createValidateStatusCode`. |
| `src/utils/logger.ts` | `debug` logger namespaced under `@contentful/node-apps-toolkit`. |
| `test/integration/` | Live CMA tests; `test/make-private-keys.sh` generates the key pair. |

Each of the five directories with an `index.ts` is also a published subpath entry point
(`.`, `./keys`, `./requests`, `./requests/typings`, `./utils`).

## Data Flow

### Minting a management token

`getManagementToken(privateKey, opts)`:

1. Reject anything that is not a string private key (`ReferenceError`).
2. Default `reuseToken` to `true`.
3. Build the cache key from `appInstallationId + spaceId + environmentId +
   privateKey.slice(32, 132)` — a private-key fingerprint, so rotating the key
   invalidates the entry without the full key ever being used as a map key.
4. On a cache hit, return immediately.
5. Otherwise `generateOneTimeToken`: sign an empty payload with `RS256`, `issuer =
   appInstallationId`, `expiresIn: '10m'`, and `keyid` when a `keyId` was supplied.
6. `POST spaces/:spaceId/environments/:environmentId/app_installations/:appInstallationId/access_tokens`
   with `Authorization: Bearer <one-time token>`; anything other than `201` throws an
   `HTTPError`.
7. Decode the returned CMA token, compute `ttl = exp - now - 10s` (a deliberate safety
   margin so a cached token is never handed out on the edge of expiry) and store it in a
   process-local `LRUCache` capped at 10 entries.

The cache is module-level and lazily created, so it is shared by every call in the
process. `reuseToken: false` skips both read and write.

### Signing a request

`signRequest(secret, canonicalRequest, timestamp?, context?)`:

1. Validate secret (exactly 64 chars), canonical request (method in a fixed set, path
   starting with `/`), and timestamp (a millisecond epoch after 2020-01-01).
2. Normalize: `getNormalizedEncodedURI` encodes the path and escapes the query string
   separately; headers are lowercased and trimmed.
3. Map the optional context (`crn`, `spaceId`, `envId`, and either `appId` or `userId`)
   onto `x-contentful-*` context headers.
4. Add `x-contentful-timestamp` and `x-contentful-signed-headers` to the signed set, sort
   all header keys, and join them as `key:value;key:value`.
5. HMAC-SHA256 over `method\npath\nheaders\nbody`, hex digest.

### Verifying a request

`verifyRequest(secret, canonicalRequest, ttl = 30)`:

1. Validate the canonical request and secret.
2. Read `x-contentful-signature` (must be exactly 64 chars), `x-contentful-signed-headers`
   and `x-contentful-timestamp` — a malformed set throws rather than returning `false`.
3. Unless `ttl === 0`, throw `ExpiredRequestException` when `now - timestamp >= ttl * 1000`.
4. Narrow the request's headers to exactly the advertised signed headers, re-sign with the
   incoming timestamp, and compare the two signatures in constant time.

Result: `false` means "signature mismatch"; a thrown error means "the request was not
well-formed or was too old". Callers are expected to map those to `403` and `422`.

## Domain Concepts

- **Canonical request** — the `{ method, path, headers?, body? }` projection of an HTTP
  request that both sides agree to hash. Any divergence in how it is built produces a
  mismatch, so its construction is intentionally rigid.
- **Signed headers** — the explicit list of header names covered by the signature.
  Verification narrows to this list so unsigned headers added by proxies cannot break it.
- **Context headers** — identity of the caller (`crn`, space, environment, and either an
  app or a user). They are added to the signed set, so they cannot be forged independently
  of the signature.
- **One-time token** — the 10-minute RS256 JWT that authenticates the token exchange. It
  is never returned to callers.
- **Function type** — `FunctionTypeEnum` discriminates every payload Contentful can send
  to a function (GraphQL mapping/query, app-event filter/handler/transformation, app-action
  call, resources search/lookup).

## Key Dependencies

| Dependency | Why |
| --- | --- |
| `jsonwebtoken` | RS256 signing and decoding of the one-time token. Wrapped in a CJS/ESM interop shim (`'default' in jwtImpl ? …`). |
| `got` ^11 | HTTP client for the token exchange, with 3 retries. Pinned to v11 because v12+ is ESM-only. |
| `lru-cache` | Bounded, TTL-aware token cache. |
| `runtypes` | Runtime validation of untrusted input at the public boundary. |
| `debug` | Opt-in diagnostics; silent unless `DEBUG` is set. |
| `contentful-management` ^12 | **Types only** — `PlainClientAPI`, event payload props, `AppActionCategoryType`. |
| `crypto` (node) | HMAC-SHA256 and `timingSafeEqual`. |

## Configuration

| Setting | Where | Effect |
| --- | --- | --- |
| `host` option | `getManagementToken(privateKey, { host })` | Overrides the CMA base URL for that call. |
| `BASE_URL` | environment | Default `prefixUrl` for the HTTP client; falls back to `https://api.contentful.com`. `vitest.setup.ts` rewrites Vite's `/` default back to the real host. |
| `keyId` option | `getManagementToken` | Emits a `kid` header, required when an app has multiple registered key pairs. |
| `reuseToken` option | `getManagementToken` | Defaults to `true`; `false` bypasses the cache entirely. |
| `DEBUG` | environment | e.g. `DEBUG='@contentful/node-apps-toolkit*'` to see logger output. |
| `.env` (from `.env.tpl`) | integration tests only | App/space/environment/organization IDs and a PAT. |

## Operational Knowledge

- **The token cache is per process and capped at 10 entries.** A backend serving many
  installations will thrash it; such consumers should cache tokens themselves and pass
  `reuseToken: false`.
- **`verifyRequest` throws as well as returning `false`.** Handling only the boolean means
  a malformed or stale request becomes an unhandled exception. Both branches need handling.
- **The default TTL is 30 seconds.** Clock skew between Contentful and the app backend is
  the most common cause of spurious `ExpiredRequestException`s; check NTP before
  suspecting the signature.
- **Signature mismatches are almost always body or path normalization.** The body must be
  the exact raw string that was signed — a re-serialized JSON body will not match. Frameworks
  that parse the body before the handler runs need a raw-body capture.
- **Node 18 is not supported** since v4.0.0 (`engines.node >= 20`), which followed
  `contentful-management` v12's own floor.
- **Both the CJS and ESM outputs must be exercised** when touching `src/keys` — the
  `jsonwebtoken` interop shim exists because that package resolves differently in each
  module system.
- **Typedoc output in `docs/` is generated and committed by the release job.** Local
  `npm run build:docs` diffs are expected noise; don't commit them separately from a release.
- **Polaris SAST is not enabled** on this repo (`sast-disabled` tag in
  `catalog-info.yaml`), and the Backstage service tier is still `unknown`. Both are known
  gaps rather than intentional choices.
