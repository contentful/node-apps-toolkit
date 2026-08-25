# Ignore dependency lifecycle scripts on install

- **Date:** 2025-11-26
- **Commit:** `2aaa80d` — `chore: [] ignore npm scripts (#784)`

## Status

Accepted.

## Context

`npm install` runs `preinstall`, `install` and `postinstall` scripts for every package in
the tree by default. For a repository that holds RSA private keys during test runs, has a
Vault-backed publishing pipeline, and builds a public package, that is arbitrary code
execution from the transitive dependency graph on every install — the supply-chain attack
path that hits CI and developer machines alike.

## Decision

Set `ignore-scripts=true` in `.npmrc`, repository-wide.

The repository's own scripts are unaffected: they are invoked explicitly (`npm run build`,
`npm test`, `npm run lint`) rather than through an install lifecycle hook. The one
exception, `prepare: husky install`, is a root-package script and can be run by hand when
setting up hooks.

## Consequences

**Enables:** no third-party install-time code runs in CI or locally, so a compromised
transitive dependency cannot execute during `npm ci`.

**Trade-off:** dependencies that genuinely need a `postinstall` step — native modules that
compile or download a binary — will not work without intervention. None of the current
dependencies do; adding one that does requires either a prebuilt alternative or an explicit
per-package exemption.

**Follow-up:** Git hooks are not installed automatically as a consequence. Contributors run
`npx husky install` once after cloning, and CI relies on the `lint-commits` and
`lint-and-test` CircleCI jobs rather than on local hooks.
