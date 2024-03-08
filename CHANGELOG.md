# [3.2.0](https://github.com/contentful/node-apps-toolkit/compare/v3.1.0...v3.2.0) (2024-03-08)


### Features

* github migration [EXT-5011] ([#553](https://github.com/contentful/node-apps-toolkit/issues/553)) ([c473ad7](https://github.com/contentful/node-apps-toolkit/commit/c473ad7f08de91cee30e81535104b1fd8b48c529))


### Reverts

* Revert "chore(deps-dev): bump typescript from 5.3.3 to 5.4.2 (#555)" (#557) ([7d5388a](https://github.com/contentful/node-apps-toolkit/commit/7d5388a19df69b84a6f32459ebe7b518ea65c427)), closes [#555](https://github.com/contentful/node-apps-toolkit/issues/555) [#557](https://github.com/contentful/node-apps-toolkit/issues/557)

# [3.1.0](https://github.com/contentful/node-apps-toolkit/compare/v3.0.1...v3.1.0) (2024-03-06)


### Features

* github migration [EXT-5011] ([#552](https://github.com/contentful/node-apps-toolkit/issues/552)) ([f38dbc1](https://github.com/contentful/node-apps-toolkit/commit/f38dbc12d3eb737bc69fc9712a622cf26639b3ae))

## [3.0.1](https://github.com/contentful/node-apps-toolkit/compare/v3.0.0...v3.0.1) (2024-02-27)


### Bug Fixes

* use node 20.8.1 for semantic-release [] ([#544](https://github.com/contentful/node-apps-toolkit/issues/544)) ([02f2cf6](https://github.com/contentful/node-apps-toolkit/commit/02f2cf6ebc4af724e56372147ece3f39bcf1dafe))

# [3.0.0](https://github.com/contentful/node-apps-toolkit/compare/v2.8.2...v3.0.0) (2024-01-29)


* BREAKING CHANGE: update typings for Functions (#500) ([fcf4535](https://github.com/contentful/node-apps-toolkit/commit/fcf45356680ab54db0f0ec37e6ccb2711a0514e1)), closes [#500](https://github.com/contentful/node-apps-toolkit/issues/500)


### BREAKING CHANGES

* update typings

* fix: lint

* revert: semantic release package to make the build pass

## [2.8.2](https://github.com/contentful/node-apps-toolkit/compare/v2.8.1...v2.8.2) (2024-01-25)


### Bug Fixes

* revert upgrade of semantic-release [] ([5b73f5c](https://github.com/contentful/node-apps-toolkit/commit/5b73f5c8d1c5ef055818466d73eff6db01345429))

## [2.8.1](https://github.com/contentful/node-apps-toolkit/compare/v2.8.0...v2.8.1) (2023-12-19)


### Bug Fixes

* upgrade to latest contentful-management.js ([#461](https://github.com/contentful/node-apps-toolkit/issues/461)) ([4e25691](https://github.com/contentful/node-apps-toolkit/commit/4e25691aa8156ee72f45806fc7cff2b24f9826e5))

# [2.8.0](https://github.com/contentful/node-apps-toolkit/compare/v2.7.2...v2.8.0) (2023-10-26)


### Bug Fixes

* explicit support for node 18 ([#386](https://github.com/contentful/node-apps-toolkit/issues/386)) ([b861f8a](https://github.com/contentful/node-apps-toolkit/commit/b861f8ae09a05d2257ec67a1e1c087abd6e3ce27))
* trigger new build ([951153d](https://github.com/contentful/node-apps-toolkit/commit/951153d7ae9fe2f307db8df2c1c8a1d3cdf3a0f2))


### Features

* make graphQLOutputType optional ([#402](https://github.com/contentful/node-apps-toolkit/issues/402)) ([b45ec75](https://github.com/contentful/node-apps-toolkit/commit/b45ec753e660add3ee26dd1e56b2849fe1d336bb))

## [2.7.2](https://github.com/contentful/node-apps-toolkit/compare/v2.7.1...v2.7.2) (2023-09-27)


### Bug Fixes

* set node engine >=18 ([#368](https://github.com/contentful/node-apps-toolkit/issues/368)) ([1c36b0d](https://github.com/contentful/node-apps-toolkit/commit/1c36b0dde4afb21df38565ea1f3706528547fffa))

## [2.7.1](https://github.com/contentful/node-apps-toolkit/compare/v2.7.0...v2.7.1) (2023-09-26)


### Bug Fixes

* npm update after node upgrade ([#366](https://github.com/contentful/node-apps-toolkit/issues/366)) ([9269a3e](https://github.com/contentful/node-apps-toolkit/commit/9269a3e40bb68accc45f64bb0c84a77ce8735ec5))
* set repository url to allow CONTRIBUTING.md link to work from npm page ([#354](https://github.com/contentful/node-apps-toolkit/issues/354)) ([a0b7dcc](https://github.com/contentful/node-apps-toolkit/commit/a0b7dcc7b1f0de31c8d84bba2b991559219a7190))

# [2.7.0](https://github.com/contentful/node-apps-toolkit/compare/v2.6.2...v2.7.0) (2023-09-26)


### Features

* export a barrel type to combine all delivery function events ([#365](https://github.com/contentful/node-apps-toolkit/issues/365)) ([1248f73](https://github.com/contentful/node-apps-toolkit/commit/1248f73ee83e9a161ae8919bcaa7019713ad083e))

## [2.6.2](https://github.com/contentful/node-apps-toolkit/compare/v2.6.1...v2.6.2) (2023-09-26)


### Bug Fixes

* clean up types by avoiding enums [MONET-1476] ([#362](https://github.com/contentful/node-apps-toolkit/issues/362)) ([866424e](https://github.com/contentful/node-apps-toolkit/commit/866424ec74659d134f961ec02c1a9c9886337d0b))

## [2.6.1](https://github.com/contentful/node-apps-toolkit/compare/v2.6.0...v2.6.1) (2023-09-21)


### Bug Fixes

* adds uploadHost to appActionCallContext type ([#353](https://github.com/contentful/node-apps-toolkit/issues/353)) ([a918331](https://github.com/contentful/node-apps-toolkit/commit/a918331fdfd8157c98d5c38ff96366919c885683))

# [2.6.0](https://github.com/contentful/node-apps-toolkit/compare/v2.5.2...v2.6.0) (2023-09-21)


### Features

* update AppActionCallContext type to reflect cmaHost ([#351](https://github.com/contentful/node-apps-toolkit/issues/351)) ([1c6a623](https://github.com/contentful/node-apps-toolkit/commit/1c6a6237591339690e608ffcc0a8aa0aa7772ed7))

## [2.5.2](https://github.com/contentful/node-apps-toolkit/compare/v2.5.1...v2.5.2) (2023-09-05)


### Bug Fixes

* export as value and not type ([#338](https://github.com/contentful/node-apps-toolkit/issues/338)) ([eed29ee](https://github.com/contentful/node-apps-toolkit/commit/eed29ee4b7779ce6f8aaff820d2be0db47909e4e))

## [2.5.1](https://github.com/contentful/node-apps-toolkit/compare/v2.5.0...v2.5.1) (2023-09-04)


### Bug Fixes

* export delivery function types ([#337](https://github.com/contentful/node-apps-toolkit/issues/337)) ([bc40693](https://github.com/contentful/node-apps-toolkit/commit/bc406939492303df8fb818f8f48e791df3b8f90f))

# [2.5.0](https://github.com/contentful/node-apps-toolkit/compare/v2.4.0...v2.5.0) (2023-08-29)


### Features

* add CRN to request signature ([#324](https://github.com/contentful/node-apps-toolkit/issues/324)) ([01e9d09](https://github.com/contentful/node-apps-toolkit/commit/01e9d095703491bcb8ad60de41b6a1f3e7bddf3a))

# [2.4.0](https://github.com/contentful/node-apps-toolkit/compare/v2.3.0...v2.4.0) (2023-08-28)


### Features

* update delivery function handler interface ([#327](https://github.com/contentful/node-apps-toolkit/issues/327)) ([c31c30b](https://github.com/contentful/node-apps-toolkit/commit/c31c30b90681b022a0f88dde1b5bfa6b64250e82))

# [2.3.0](https://github.com/contentful/node-apps-toolkit/compare/v2.2.0...v2.3.0) (2023-08-18)


### Features

* add types for deliveryFunction implementation ([#316](https://github.com/contentful/node-apps-toolkit/issues/316)) ([b807a25](https://github.com/contentful/node-apps-toolkit/commit/b807a251d649725ca67d8554c7ac2c9d20ef6c84))

# [2.2.0](https://github.com/contentful/node-apps-toolkit/compare/v2.1.0...v2.2.0) (2023-05-26)


### Features

* add new action call context ([#240](https://github.com/contentful/node-apps-toolkit/issues/240)) ([2fa69ea](https://github.com/contentful/node-apps-toolkit/commit/2fa69ea4949194085c1bade22dee4eb4d969060c))

# [2.1.0](https://github.com/contentful/node-apps-toolkit/compare/v2.0.4...v2.1.0) (2023-02-13)


### Features

* set host from opt [] ([#139](https://github.com/contentful/node-apps-toolkit/issues/139)) ([4353c2b](https://github.com/contentful/node-apps-toolkit/commit/4353c2b66777e7d5f33da563a78f24f1ac3849c7))

## [2.0.4](https://github.com/contentful/node-apps-toolkit/compare/v2.0.3...v2.0.4) (2023-01-23)


### Bug Fixes

* enforce compatible node versions (v14.15+) ([#132](https://github.com/contentful/node-apps-toolkit/issues/132)) ([566a17e](https://github.com/contentful/node-apps-toolkit/commit/566a17e668df669dc955e739fcaa251abfec127a))
* update jsonwebtoken ([#133](https://github.com/contentful/node-apps-toolkit/issues/133)) ([fc24220](https://github.com/contentful/node-apps-toolkit/commit/fc24220b60fa382c85a6bb62fb5de62e4de75a17))

## [2.0.4-next.1](https://github.com/contentful/node-apps-toolkit/compare/v2.0.3...v2.0.4-next.1) (2023-01-23)


### Bug Fixes

* enforce compatible node versions (v14.15+) ([#132](https://github.com/contentful/node-apps-toolkit/issues/132)) ([566a17e](https://github.com/contentful/node-apps-toolkit/commit/566a17e668df669dc955e739fcaa251abfec127a))
* update jsonwebtoken ([#133](https://github.com/contentful/node-apps-toolkit/issues/133)) ([fc24220](https://github.com/contentful/node-apps-toolkit/commit/fc24220b60fa382c85a6bb62fb5de62e4de75a17))

## [2.0.3](https://github.com/contentful/node-apps-toolkit/compare/v2.0.2...v2.0.3) (2022-06-10)


### Bug Fixes

* [] do not export const enums for headers ([#51](https://github.com/contentful/node-apps-toolkit/issues/51)) ([6858557](https://github.com/contentful/node-apps-toolkit/commit/685855743a4bbf00b94067267efb7290ea96f308))

## [2.0.2](https://github.com/contentful/node-apps-toolkit/compare/v2.0.1...v2.0.2) (2022-03-25)


### Bug Fixes

* include spaceId as part of cacheKey ([#43](https://github.com/contentful/node-apps-toolkit/issues/43)) ([92fc4c5](https://github.com/contentful/node-apps-toolkit/commit/92fc4c515e247ae054791922b69f20008b10976e))

## [2.0.1](https://github.com/contentful/node-apps-toolkit/compare/v2.0.0...v2.0.1) (2022-03-11)


### Bug Fixes

* [EXT-3586] add default cache ([#41](https://github.com/contentful/node-apps-toolkit/issues/41)) ([420cdfb](https://github.com/contentful/node-apps-toolkit/commit/420cdfbcd886d454a9298a793877f95eaf60bec7))
