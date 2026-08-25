# Separate generated API docs from tracked decision records

**Date:** 2026-08-24
**Status:** Accepted

## Status

Accepted. `.typedocrc.json` writes to `docs/api/`, `docs/ADRs/` is the only tracked content
under `docs/`, and `docs` is no longer a `@semantic-release/git` asset.

## Context

`.typedocrc.json` has set `"out": "docs"` since the initial commit (`4fce76d`), and typedoc
defaults `cleanOutputDir` to `true` — it empties its output directory before every run. For as
long as `docs/` held nothing but generated HTML that was invisible and harmless.

Adding `docs/ADRs/` broke that assumption. `npm run build:docs` deleted the directory outright:

```
$ ls docs/ADRs | wc -l
6
$ npm run build:docs
[info] Documentation generated at ./docs
$ ls docs/ADRs
ls: docs/ADRs: No such file or directory
```

The release path made it worse than a local annoyance. `npm run publish` runs `build:all` →
`build:docs`, and `@semantic-release/git` listed `docs` among its committed assets since
`4999c7e` (*chore: ci fix and build docs in CI*, 2023-02-10). The first `feat:`/`fix:` release
after these records landed would have regenerated `docs/`, dropped the ADRs, and committed the
deletion — removing them from git with a `[skip ci]` release commit and no human in the loop.

Three constraints shaped the fix:

- Every location the AI-harness-readiness control accepts for decision records (`docs/ADRs/`,
  `docs/adr/`, `docs/decision-records/`, `docs/decisions/`) sits **inside** `docs/`. Moving the
  records out of typedoc's way and staying compliant are mutually exclusive, so relocating them
  was not an option.
- Setting `"cleanOutputDir": false` would leave orphaned HTML behind for every renamed or
  removed export, published and committed indefinitely, plus a hand-maintained cleanup list
  that drifts with typedoc's output layout.
- `.gitignore` already listed `docs` as generated and ignored, yet 22 generated files were
  tracked — last rewritten by `4e8778a` (*chore(release): 3.16.0*). The `docs` release asset was
  re-committing build output the repository had already declared disposable, while
  `pages-build-deployment.yml` rebuilt it from source on every push to `main` regardless.

## Decision

Give typedoc a directory it owns completely, and stop release-managing its output.

- `.typedocrc.json`: `"out": "docs"` → `"docs/api"`. `cleanOutputDir` stays at its default,
  scoped to a directory containing nothing hand-written.
- `.github/workflows/pages-build-deployment.yml`: `publish_dir: ./docs` → `./docs/api`, so the
  gh-pages root stays byte-for-byte what it was and **published API doc URLs do not change**.
  Typedoc emits its own `.nojekyll` into the new directory, so Pages still serves paths
  containing underscores.
- `.releaserc`: drop `docs` from the `@semantic-release/git` assets. Nothing under `docs/` is
  release-managed any more; the Pages workflow is the only producer of published API docs.
- Untrack the 22 stale generated files at the `docs/` root, resolving the contradiction with
  `.gitignore`.
- `.gitignore` keeps `docs/*` + `!docs/ADRs`, which now states the intent exactly: everything
  typedoc generates is ignored, the decision records are tracked.

## Consequences

**Enables:** hand-written documentation can live under `docs/` without a build step silently
deleting it, which is what the readiness control assumes. The ADRs are also no longer published
to the public docs site — they are internal engineering history, and `docs/api/` as the Pages
root excludes them by construction.

**Enables:** generated HTML stops appearing in release commits and in review diffs. Release
commits now touch `CHANGELOG.md`, `package.json` and `package-lock.json` only.

**Trade-off:** the committed copy of the API docs is gone, so `docs/api/` no longer exists in a
fresh clone until someone runs `npm run build:docs`. `start:docs` was repointed at `./docs/api`
in the same change, so `npm run build:docs && npm run start:docs` is now the local workflow.

**Trade-off:** the fix spans four files that have to move together. Changing `"out"` without
`publish_dir` would silently shift every published URL under `/api/`; changing `publish_dir`
without `"out"` would publish an empty directory.

**Follow-up:** the collision was found by Jared Jolton in review on
[#857](https://github.com/contentful/node-apps-toolkit/pull/857), not by CI. No check verifies
that `npm run build:docs` preserves tracked files, so the next tool given ownership of a
directory shared with hand-written content can reintroduce this. A CI step asserting
`docs/ADRs/` survives `build:docs` would close it.
