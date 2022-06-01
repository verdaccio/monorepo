# Change Log

## 10.4.2

### Patch Changes

- 2d428b3: fix: user_agent property as boolean

## 10.4.1

### Patch Changes

- aaf0da4: fix: self_path correct property

## 10.4.0

### Minor Changes

- 00e4afd: feat: update configuration types

## 10.3.0

### Minor Changes

- 803c518: chore: update core dependencies

## 10.2.2

### Patch Changes

- 9ca52a7: fix: move userRateLimit to config body

## 10.2.1

### Patch Changes

- 254a282: fix: user_agent can be also string

## 10.2.0

### Minor Changes

- 96b62c8: feat: add rate limit and convert user agent type to boolean

## 10.1.0

### Minor Changes

- 4e9a3d0: feat: remove core-js from bundle

  By using babel.js core-js injects some requires that are not necessarily dependencies and fails on pnpm and yarn 2 due are strict. No need to add this feature so is removed.

  - https://babeljs.io/docs/en/babel-preset-env#usebuiltins

## 10.0.1

### Patch Changes

- 6134415: fix: update dependencies

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [10.0.0](https://github.com/verdaccio/monorepo/compare/v9.7.5...v10.0.0) (2021-03-29)

**Note:** Version bump only for package @verdaccio/types

## [9.7.2](https://github.com/verdaccio/monorepo/compare/v9.7.1...v9.7.2) (2020-07-20)

### Bug Fixes

- incorrect AuthAccessCallback and AuthCallback ([#374](https://github.com/verdaccio/monorepo/issues/374)) ([97538f8](https://github.com/verdaccio/monorepo/commit/97538f886271ccdbea7862957f65c4a17c4cd831)), closes [/github.com/verdaccio/verdaccio/blob/master/src/lib/auth.ts#L264](https://github.com//github.com/verdaccio/verdaccio/blob/master/src/lib/auth.ts/issues/L264) [/github.com/verdaccio/verdaccio/blob/master/src/lib/auth.ts#L114](https://github.com//github.com/verdaccio/verdaccio/blob/master/src/lib/auth.ts/issues/L114)

# [9.7.0](https://github.com/verdaccio/monorepo/compare/v9.6.1...v9.7.0) (2020-06-24)

### Features

- types for https config ([#368](https://github.com/verdaccio/monorepo/issues/368)) ([aa4aa83](https://github.com/verdaccio/monorepo/commit/aa4aa83e8a2f6a29ebe7c0b43ccc560a37fe2da9))

# [9.5.0](https://github.com/verdaccio/monorepo/compare/v9.4.1...v9.5.0) (2020-05-02)

### Features

- **types:** custom favicon ([#356](https://github.com/verdaccio/monorepo/issues/356)) ([bd78861](https://github.com/verdaccio/monorepo/commit/bd78861f46cd5189808b6689d2018a7bac6755f7))

# [9.3.0](https://github.com/verdaccio/monorepo/compare/v9.2.0...v9.3.0) (2020-01-29)

### Features

- **types:** adding tag type for auth plugins ([#318](https://github.com/verdaccio/monorepo/issues/318)) ([7f07c94](https://github.com/verdaccio/monorepo/commit/7f07c94d9dba5ac45b35aef3bd1ffd3080fb35db))

# [9.0.0](https://github.com/verdaccio/monorepo/compare/v8.5.3...v9.0.0) (2020-01-07)

**Note:** Version bump only for package @verdaccio/types

## [8.5.2](https://github.com/verdaccio/monorepo/compare/v8.5.1...v8.5.2) (2019-12-25)

### Bug Fixes

- add types for storage handler ([#307](https://github.com/verdaccio/monorepo/issues/307)) ([c35746e](https://github.com/verdaccio/monorepo/commit/c35746ebba071900db172608dedff66a7d27c23d))

## [8.5.1](https://github.com/verdaccio/monorepo/compare/v8.5.0...v8.5.1) (2019-12-24)

### Bug Fixes

- add new types for local storage ([#306](https://github.com/verdaccio/monorepo/issues/306)) ([e715e24](https://github.com/verdaccio/monorepo/commit/e715e24ec7b7e7b3dca31a3321714ebccadf2a8d))

# [8.5.0](https://github.com/verdaccio/monorepo/compare/v8.4.2...v8.5.0) (2019-12-22)

### Bug Fixes

- **types:** add allow_unpublish generic ([#305](https://github.com/verdaccio/monorepo/issues/305)) ([aeaf64c](https://github.com/verdaccio/monorepo/commit/aeaf64c67cafb9ec16fa5a66aad9c4912f2a3710))

## [8.4.2](https://github.com/verdaccio/monorepo/compare/v8.4.1...v8.4.2) (2019-11-23)

**Note:** Version bump only for package @verdaccio/types

## [8.4.1](https://github.com/verdaccio/monorepo/compare/v8.4.0...v8.4.1) (2019-11-22)

**Note:** Version bump only for package @verdaccio/types

# [8.4.0](https://github.com/verdaccio/monorepo/compare/v8.3.0...v8.4.0) (2019-11-22)

### Bug Fixes

- adds sort_packages in WebConf Interface ([#227](https://github.com/verdaccio/monorepo/issues/227)) ([5b60ade](https://github.com/verdaccio/monorepo/commit/5b60adef5da49d7d1b62aa9f484b27c9fa319bdd))

# [8.3.0](https://github.com/verdaccio/monorepo/compare/v8.2.0...v8.3.0) (2019-10-27)

### Features

- improve auth callback TS types ([#225](https://github.com/verdaccio/monorepo/issues/225)) ([ee442a0](https://github.com/verdaccio/monorepo/commit/ee442a0))

# [8.1.0](https://github.com/verdaccio/monorepo/compare/v8.0.1-next.1...v8.1.0) (2019-09-07)

**Note:** Version bump only for package @verdaccio/types

## [8.0.1-next.1](https://github.com/verdaccio/monorepo/compare/v8.0.1-next.0...v8.0.1-next.1) (2019-08-29)

**Note:** Version bump only for package @verdaccio/types

## [8.0.1-next.0](https://github.com/verdaccio/monorepo/compare/v8.0.0...v8.0.1-next.0) (2019-08-29)

**Note:** Version bump only for package @verdaccio/types

# [8.0.0](https://github.com/verdaccio/monorepo/compare/v8.0.0-next.4...v8.0.0) (2019-08-22)

**Note:** Version bump only for package @verdaccio/types

# [8.0.0-next.4](https://github.com/verdaccio/monorepo/compare/v8.0.0-next.3...v8.0.0-next.4) (2019-08-18)

**Note:** Version bump only for package @verdaccio/types

# [8.0.0-next.2](https://github.com/verdaccio/monorepo/compare/v8.0.0-next.1...v8.0.0-next.2) (2019-08-03)

### Bug Fixes

- update types for tokens ([9734fa8](https://github.com/verdaccio/monorepo/commit/9734fa8))

# [8.0.0-next.1](https://github.com/verdaccio/monorepo/compare/v8.0.0-next.0...v8.0.0-next.1) (2019-08-01)

**Note:** Version bump only for package @verdaccio/types

# [8.0.0-next.0](https://github.com/verdaccio/monorepo/compare/v2.0.0...v8.0.0-next.0) (2019-08-01)

### Bug Fixes

- add \_autogenerated to UpLinkConf ([436bd91](https://github.com/verdaccio/monorepo/commit/436bd91))
- add config prop to IBasicAuth ([2481d6f](https://github.com/verdaccio/monorepo/commit/2481d6f))
- add missing adduser method ([22cdb4e](https://github.com/verdaccio/monorepo/commit/22cdb4e))
- add missing properties ([973c5e4](https://github.com/verdaccio/monorepo/commit/973c5e4))
- allow extend config ([0aea94f](https://github.com/verdaccio/monorepo/commit/0aea94f))
- allow sub types on allow auth methods ([7325f74](https://github.com/verdaccio/monorepo/commit/7325f74))
- deprecated methods are optional ([b77155a](https://github.com/verdaccio/monorepo/commit/b77155a))
- entry point [#14](https://github.com/verdaccio/monorepo/issues/14) ([7575e75](https://github.com/verdaccio/monorepo/commit/7575e75))
- export Author type ([bf7115b](https://github.com/verdaccio/monorepo/commit/bf7115b))
- fix/token i local package manager ([#61](https://github.com/verdaccio/monorepo/issues/61)) ([a7e0fc8](https://github.com/verdaccio/monorepo/commit/a7e0fc8))
- fixes for storage plugin types per code review ([#59](https://github.com/verdaccio/monorepo/issues/59)) ([04fccb8](https://github.com/verdaccio/monorepo/commit/04fccb8))
- getPackageStorage allowed to return undefined ([8a859d0](https://github.com/verdaccio/monorepo/commit/8a859d0))
- improvements config interface ([1dac321](https://github.com/verdaccio/monorepo/commit/1dac321))
- methods return Stream ([22e0672](https://github.com/verdaccio/monorepo/commit/22e0672))
- remove options from get package metadata ([2bfc048](https://github.com/verdaccio/monorepo/commit/2bfc048))
- remove wrong definition ([acba624](https://github.com/verdaccio/monorepo/commit/acba624))
- remove wrong imports ([c82f51c](https://github.com/verdaccio/monorepo/commit/c82f51c))
- restore missing type on RemoteUser ([b596896](https://github.com/verdaccio/monorepo/commit/b596896))
- storage types ([1285675](https://github.com/verdaccio/monorepo/commit/1285675))
- tokens are accesible also in local-storage ([08b342d](https://github.com/verdaccio/monorepo/commit/08b342d))
- update https ([c93c3fc](https://github.com/verdaccio/monorepo/commit/c93c3fc))
- update readTarball with right parameters ([8cbc7d1](https://github.com/verdaccio/monorepo/commit/8cbc7d1))
- update streams type ([7fa7be5](https://github.com/verdaccio/monorepo/commit/7fa7be5))
- update types for local data ([6706770](https://github.com/verdaccio/monorepo/commit/6706770))
- update utils types ([7c37133](https://github.com/verdaccio/monorepo/commit/7c37133))
- wrong signature for auth plugin ([e3e2508](https://github.com/verdaccio/monorepo/commit/e3e2508))

### Features

- add AuthPluginPackage type ([f0e1cea](https://github.com/verdaccio/monorepo/commit/f0e1cea))
- add callback to database methods ([d0d55e9](https://github.com/verdaccio/monorepo/commit/d0d55e9))
- add config file types ([188a3e5](https://github.com/verdaccio/monorepo/commit/188a3e5))
- add gravatar prop for web config ([b3ac873](https://github.com/verdaccio/monorepo/commit/b3ac873))
- add interface for middleware and storage plugin ([2b18e22](https://github.com/verdaccio/monorepo/commit/2b18e22))
- add IStorageManager for middleware plugin ([0ac1cc4](https://github.com/verdaccio/monorepo/commit/0ac1cc4))
- Add locking library on typings ([7f7ab67](https://github.com/verdaccio/monorepo/commit/7f7ab67))
- add RemoteUser type ([7d11892](https://github.com/verdaccio/monorepo/commit/7d11892))
- add search method BREAKING CHANGE: search method must be implemented to allow search functionality ([b6d94e6](https://github.com/verdaccio/monorepo/commit/b6d94e6))
- add secret gateway methods ([5300147](https://github.com/verdaccio/monorepo/commit/5300147))
- add Security configuration ([0cdc0dd](https://github.com/verdaccio/monorepo/commit/0cdc0dd))
- add types for auth plugin ([6378186](https://github.com/verdaccio/monorepo/commit/6378186))
- add types for PackageUsers ([ad5f917](https://github.com/verdaccio/monorepo/commit/ad5f917))
- add types for search class ([e23782d](https://github.com/verdaccio/monorepo/commit/e23782d))
- callback does not return ([fd78bfc](https://github.com/verdaccio/monorepo/commit/fd78bfc))
- merge changes from 5.x ([5f61009](https://github.com/verdaccio/monorepo/commit/5f61009))
- package access props are not optional ([61708e2](https://github.com/verdaccio/monorepo/commit/61708e2))
- remove flow [#70](https://github.com/verdaccio/monorepo/issues/70) ([2218b74](https://github.com/verdaccio/monorepo/commit/2218b74))
- remove sync method ([f60f81c](https://github.com/verdaccio/monorepo/commit/f60f81c))
- secret methods are async ([d5eacf5](https://github.com/verdaccio/monorepo/commit/d5eacf5))
- support for an IPluginStorageFilter ([#58](https://github.com/verdaccio/monorepo/issues/58)) ([eab219e](https://github.com/verdaccio/monorepo/commit/eab219e))
- token types ([#60](https://github.com/verdaccio/monorepo/issues/60)) @Eomm ([6e74da6](https://github.com/verdaccio/monorepo/commit/6e74da6))
- **auth:** add method to update password ([e257c3a](https://github.com/verdaccio/monorepo/commit/e257c3a))
- **storage:** path is not mandatory ([2c42931](https://github.com/verdaccio/monorepo/commit/2c42931))

### BREAKING CHANGES

- remove flow definitions
- storage needs to add new methods

- add: token types

- add: typescripts types
- **auth:** it will affect all auth plugins

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [7.0.0](https://github.com/verdaccio/flow-types/compare/v6.2.0...v7.0.0) (2019-07-25)

### Bug Fixes

- add \_autogenerated to UpLinkConf ([971e52e](https://github.com/verdaccio/flow-types/commit/971e52e))
- **IPluginAuth:** adduser, changePassword optional ([40d4e7a](https://github.com/verdaccio/flow-types/commit/40d4e7a)), closes [/github.com/verdaccio/verdaccio/blob/66f4197236d9d71af149314aae15102b336f45e1/src/lib/auth.ts#L67-L71](https://github.com/verdaccio/flow-types/issues/L67-L71) [/github.com/verdaccio/verdaccio/blob/66f4197236d9d71af149314aae15102b336f45e1/src/lib/auth.ts#L138-L166](https://github.com/verdaccio/flow-types/issues/L138-L166)
- **IPluginAuth:** remove `login_url` ([1663c07](https://github.com/verdaccio/flow-types/commit/1663c07)), closes [#69](https://github.com/verdaccio/flow-types/issues/69)

### Features

- merge changes from 5.x ([7d2d526](https://github.com/verdaccio/flow-types/commit/7d2d526))
- remove flow [#70](https://github.com/verdaccio/flow-types/issues/70) ([826d5fe](https://github.com/verdaccio/flow-types/commit/826d5fe))

### BREAKING CHANGES

- remove flow definitions

<a name="6.2.0"></a>

# [6.2.0](https://github.com/verdaccio/flow-types/compare/v6.1.0...v6.2.0) (2019-05-28)

### Features

- add types for Version ([900861d](https://github.com/verdaccio/flow-types/commit/900861d))

<a name="6.1.0"></a>

# [6.1.0](https://github.com/verdaccio/flow-types/compare/v6.0.2...v6.1.0) (2019-05-14)

### Bug Fixes

- revert token signature ([59a03e7](https://github.com/verdaccio/flow-types/commit/59a03e7))

### Features

- moved token api signature ([e51991c](https://github.com/verdaccio/flow-types/commit/e51991c))

<a name="6.0.2"></a>

## [6.0.2](https://github.com/verdaccio/flow-types/compare/v6.0.1...v6.0.2) (2019-05-06)

### Bug Fixes

- fix/token i local package manager ([#61](https://github.com/verdaccio/flow-types/issues/61)) ([14adfb2](https://github.com/verdaccio/flow-types/commit/14adfb2))

<a name="6.0.1"></a>

## [6.0.1](https://github.com/verdaccio/flow-types/compare/v6.0.0...v6.0.1) (2019-05-04)

### Bug Fixes

- tokens are accesible also in local-storage ([56551cf](https://github.com/verdaccio/flow-types/commit/56551cf))

<a name="6.0.0"></a>

# [6.0.0](https://github.com/verdaccio/flow-types/compare/v5.0.2...v6.0.0) (2019-04-30)

### Bug Fixes

- remove wrong imports ([a75476a](https://github.com/verdaccio/flow-types/commit/a75476a))

### Features

- token types ([#60](https://github.com/verdaccio/flow-types/issues/60)) @Eomm ([7b74982](https://github.com/verdaccio/flow-types/commit/7b74982))

### BREAKING CHANGES

- storage needs to add new methods

- add: token types

- add: typescripts types

<a name="5.0.2"></a>

## [5.0.2](https://github.com/verdaccio/flow-types/compare/v5.0.1...v5.0.2) (2019-04-22)

### Bug Fixes

- fixes for storage plugin types per code review ([#59](https://github.com/verdaccio/flow-types/issues/59)) ([c2ea90b](https://github.com/verdaccio/flow-types/commit/c2ea90b))

<a name="5.0.1"></a>

## [5.0.1](https://github.com/verdaccio/flow-types/compare/v5.0.0...v5.0.1) (2019-04-18)

<a name="5.0.0"></a>

# [5.0.0](https://github.com/verdaccio/flow-types/compare/v5.0.0-beta.4...v5.0.0) (2019-04-18)

### Features

- support for an IPluginStorageFilter ([#58](https://github.com/verdaccio/flow-types/issues/58)) ([e67559f](https://github.com/verdaccio/flow-types/commit/e67559f))

<a name="5.0.0-beta.4"></a>

# [5.0.0-beta.4](https://github.com/verdaccio/flow-types/compare/v5.0.0-beta.3...v5.0.0-beta.4) (2019-03-29)

### Features

- **storage:** path is not mandatory ([784f1bb](https://github.com/verdaccio/flow-types/commit/784f1bb))

<a name="5.0.0-beta.3"></a>

# [5.0.0-beta.3](https://github.com/verdaccio/flow-types/compare/v5.0.0-beta.2...v5.0.0-beta.3) (2019-03-09)

### Features

- add types for PackageUsers ([9bb3c26](https://github.com/verdaccio/flow-types/commit/9bb3c26))

<a name="5.0.0-beta.2"></a>

# [5.0.0-beta.2](https://github.com/verdaccio/flow-types/compare/v5.0.0-beta.1...v5.0.0-beta.2) (2019-02-03)

### Features

- allow_access and allow_publish are optional for auth plugin ([0d5a53c](https://github.com/verdaccio/flow-types/commit/0d5a53c))

<a name="5.0.0-beta.1"></a>

# [5.0.0-beta.1](https://github.com/verdaccio/flow-types/compare/v5.0.0-beta.0...v5.0.0-beta.1) (2019-02-01)

<a name="5.0.0-beta.0"></a>

# [5.0.0-beta.0](https://github.com/verdaccio/flow-types/compare/v4.3.0...v5.0.0-beta.0) (2019-01-27)

<a name="4.3.0"></a>

# [4.3.0](https://github.com/verdaccio/flow-types/compare/v4.2.0...v4.3.0) (2019-01-12)

### Features

- add gravatar prop for web config ([99ceae9](https://github.com/verdaccio/flow-types/commit/99ceae9))

<a name="4.2.0"></a>

# [4.2.0](https://github.com/verdaccio/flow-types/compare/v4.1.2...v4.2.0) (2019-01-12)

### Features

- add AuthPluginPackage type ([0e46b04](https://github.com/verdaccio/flow-types/commit/0e46b04))

<a name="4.1.2"></a>

## [4.1.2](https://github.com/verdaccio/flow-types/compare/v4.1.1...v4.1.2) (2018-11-11)

### Bug Fixes

- remove wrong definition ([9bc53fc](https://github.com/verdaccio/flow-types/commit/9bc53fc))

<a name="4.1.1"></a>

## [4.1.1](https://github.com/verdaccio/flow-types/compare/v4.1.0...v4.1.1) (2018-10-06)

### Bug Fixes

- deprecated methods are optional ([4c96e89](https://github.com/verdaccio/flow-types/commit/4c96e89))

<a name="4.1.0"></a>

# [4.1.0](https://github.com/verdaccio/flow-types/compare/v4.0.0...v4.1.0) (2018-10-06)

### Features

- package access props are not optional ([afabaf1](https://github.com/verdaccio/flow-types/commit/afabaf1))

<a name="4.0.0"></a>

# [4.0.0](https://github.com/verdaccio/flow-types/compare/v3.7.2...v4.0.0) (2018-09-30)

### Features

- **auth:** add method to update password ([21fc43f](https://github.com/verdaccio/flow-types/commit/21fc43f))

### BREAKING CHANGES

- **auth:** it will affect all auth plugins

<a name="3.7.2"></a>

## [3.7.2](https://github.com/verdaccio/flow-types/compare/v3.7.1...v3.7.2) (2018-09-27)

### Bug Fixes

- entry point [#14](https://github.com/verdaccio/flow-types/issues/14) ([f7b8982](https://github.com/verdaccio/flow-types/commit/f7b8982))
- export Author type ([7869dde](https://github.com/verdaccio/flow-types/commit/7869dde))

<a name="3.7.1"></a>

## [3.7.1](https://github.com/verdaccio/flow-types/compare/v3.7.0...v3.7.1) (2018-08-11)

### Bug Fixes

- restore missing type on RemoteUser ([88d809e](https://github.com/verdaccio/flow-types/commit/88d809e))

<a name="3.7.0"></a>

# [3.7.0](https://github.com/verdaccio/flow-types/compare/v3.6.0...v3.7.0) (2018-08-05)

### Features

- add Security configuration ([0d9aece](https://github.com/verdaccio/flow-types/commit/0d9aece))

<a name="3.6.0"></a>

# [3.6.0](https://github.com/verdaccio/flow-types/compare/v3.5.1...v3.6.0) (2018-07-30)

### Features

- changes max_users type to number ([1fa6e73](https://github.com/verdaccio/flow-types/commit/1fa6e73))

<a name="3.5.1"></a>

## [3.5.1](https://github.com/verdaccio/flow-types/compare/v3.5.0...v3.5.1) (2018-07-21)

### Bug Fixes

- login_url should be an optional property ([0fcfb9c](https://github.com/verdaccio/flow-types/commit/0fcfb9c))

<a name="3.5.0"></a>

# [3.5.0](https://github.com/verdaccio/flow-types/compare/v3.4.3...v3.5.0) (2018-07-21)

### Features

- add `login_url` to verdaccio\$IPluginAuth ([6e03209](https://github.com/verdaccio/flow-types/commit/6e03209)), closes [verdaccio/verdaccio#834](https://github.com/verdaccio/verdaccio/issues/834)

<a name="3.4.3"></a>

## [3.4.3](https://github.com/verdaccio/flow-types/compare/v3.4.2...v3.4.3) (2018-07-19)

### Bug Fixes

- allow extend config ([06e810f](https://github.com/verdaccio/flow-types/commit/06e810f))

<a name="3.4.2"></a>

## [3.4.2](https://github.com/verdaccio/flow-types/compare/v3.4.1...v3.4.2) (2018-07-17)

<a name="3.4.1"></a>

## [3.4.1](https://github.com/verdaccio/flow-types/compare/v3.4.0...v3.4.1) (2018-07-16)

### Bug Fixes

- allow sub types on allow auth methods ([fa8125b](https://github.com/verdaccio/flow-types/commit/fa8125b))

<a name="3.4.0"></a>

# [3.4.0](https://github.com/verdaccio/flow-types/compare/v3.3.3...v3.4.0) (2018-07-16)

### Features

- add RemoteUser type ([aa83839](https://github.com/verdaccio/flow-types/commit/aa83839))

<a name="3.3.3"></a>

## [3.3.3](https://github.com/verdaccio/flow-types/compare/v3.3.2...v3.3.3) (2018-07-16)

### Bug Fixes

- wrong signature for auth plugin ([11a0ce6](https://github.com/verdaccio/flow-types/commit/11a0ce6))

<a name="3.3.2"></a>

## [3.3.2](https://github.com/verdaccio/flow-types/compare/v3.3.1...v3.3.2) (2018-07-16)

### Bug Fixes

- add missing adduser method ([0b54fe7](https://github.com/verdaccio/flow-types/commit/0b54fe7))

<a name="3.3.1"></a>

## [3.3.1](https://github.com/verdaccio/flow-types/compare/v3.3.0...v3.3.1) (2018-07-15)

### Bug Fixes

- add config prop to IBasicAuth ([0714316](https://github.com/verdaccio/flow-types/commit/0714316))

<a name="3.3.0"></a>

# [3.3.0](https://github.com/verdaccio/flow-types/compare/v3.2.0...v3.3.0) (2018-07-15)

### Features

- add IStorageManager for middleware plugin ([d473b4c](https://github.com/verdaccio/flow-types/commit/d473b4c))

<a name="3.2.0"></a>

# [3.2.0](https://github.com/verdaccio/flow-types/compare/v3.1.0...v3.2.0) (2018-07-15)

### Features

- add interface for middleware and storage plugin ([0028085](https://github.com/verdaccio/flow-types/commit/0028085))

<a name="3.1.0"></a>

# [3.1.0](https://github.com/verdaccio/flow-types/compare/v3.0.1...v3.1.0) (2018-07-14)

### Features

- add types for auth plugin ([a9b7bc9](https://github.com/verdaccio/flow-types/commit/a9b7bc9))

<a name="3.0.1"></a>

## [3.0.1](https://github.com/verdaccio/flow-types/compare/v3.0.0...v3.0.1) (2018-07-02)

### Bug Fixes

- improvements config interface ([8ea6276](https://github.com/verdaccio/flow-types/commit/8ea6276))

<a name="3.0.0"></a>

# [3.0.0](https://github.com/verdaccio/flow-types/compare/v2.2.2...v3.0.0) (2018-06-08)

### Features

- add search method ([2cf3ce9](https://github.com/verdaccio/flow-types/commit/2cf3ce9))

### BREAKING CHANGES

- search method must be implemented to allow search functionality
