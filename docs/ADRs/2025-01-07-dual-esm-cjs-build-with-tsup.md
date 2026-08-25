# Dual ESM/CJS build with tsup and explicit subpath exports

- **Date:** 2025-01-07
- **Commit:** `161ca98` — `feat: support esm modules [EXT-5853] (#736)`

## Status

Accepted.

## Context

The toolkit shipped a CommonJS-only build. Consumers moving to ESM — Contentful Functions,
app backends on modern bundlers, and anything with `"type": "module"` — could not
`import` it cleanly, and `require`-only output forced them into interop workarounds.

Publishing an ESM-only build was not an option: the package is public and a large share of
existing consumers are CommonJS. Two runtime dependencies also constrained the choice.
`got` is ESM-only from v12, so v11 had to stay pinned. `jsonwebtoken` resolves its default
export differently under CJS and ESM, which had previously been papered over with a
dynamic `require`.

## Decision

Build both formats from a single TypeScript source with **tsup**, and describe the result
with an explicit `exports` map.

- `tsup.config.js` declares one entry per public module (`src/index.ts`, `src/keys/index.ts`,
  `src/requests/index.ts`, `src/requests/typings/index.ts`, `src/utils/index.ts`),
  `format: ['cjs', 'esm']`, `dts: true`, `splitting: false`, `preserveModules: true`, and
  an `outExtension` that emits `.cjs` and `.mjs` side by side in `lib/`.
- `package.json#exports` maps each subpath to its `types`, `import` (`.mjs`) and `require`
  (`.cjs`) target. `main` stays `lib/index.cjs` for older resolvers.
- `jsonwebtoken` is normalised once at the top of `src/keys/get-management-token.ts`
  (`const jwt = 'default' in jwtImpl ? jwtImpl.default : jwtImpl`) instead of at each call
  site.

## Consequences

**Enables:** ESM and CJS consumers use the same package with no interop shims, and deep
imports (`@contentful/node-apps-toolkit/requests`) resolve to a real entry point rather
than reaching into `lib/`.

**Trade-off:** the build output, the `exports` map, and the module `index.ts` files must be
kept in sync by hand. Nothing fails at build time when they drift — the breakage only shows
up in a consumer's resolver. Two follow-ups fixed exactly this class of bug: `55c329e`
(2025-01-28, `fix: allow sub module imports [EXT-6147] (#756)`) added the missing subpath
entries, and `0da1c84` (2026-05-18) corrected a malformed
`./lib/requests//typingsindex.mjs` path in the `./requests/typings` export.

**Follow-up:** `9f94d0e` (2025-01-15, `fix: include index.d.cts for stricter tsconfigs
[EXT-6121] (#748)`) added the `cp ./lib/index.d.ts ./lib/index.d.cts` step to `npm run
build`, because `moduleResolution: node16`/`nodenext` consumers require a `.d.cts` next to
the `.cjs` output. Any new entry point needs the same three-way edit — tsup entry,
`exports` entry, module barrel.
