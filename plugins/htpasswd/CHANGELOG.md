# Change Log

## 10.4.0

### Minor Changes

- 49ca26d: feat: allow other password hashing algorithms

  copied from v6 plugins by @greshilov https://github.com/verdaccio/verdaccio/pull/2072

  > To avoid a breaking change, the default algorithm is `crypt`.

  ### Context

  The current implementation of the `htpasswd` module supports multiple hash formats on verify, but only `crypt` on sign in.
  `crypt` is an insecure old format, so to improve the security of the new `verdaccio` release we introduce the support of multiple hash algorithms on sign in step.

  ### New hashing algorithms

  The new possible hash algorithms to use are `bcrypt`, `md5`, `sha1`. You can read more about them [here](https://httpd.apache.org/docs/2.4/misc/password_encryptions.html).

  Two new properties are added to `auth` section in the configuration file:

  - `algorithm` to choose the way you want to hash passwords.
  - `rounds` is used to determine `bcrypt` complexity. So one can improve security according to increasing computational power.

  Example of the new `auth` config file section:

  ```yaml
  auth:
  htpasswd:
    file: ./htpasswd
    max_users: 1000
    # Hash algorithm, possible options are: "bcrypt", "md5", "sha1", "crypt".
    algorithm: bcrypt
    # Rounds number for "bcrypt", will be ignored for other algorithms.
    rounds: 10
  ```

## 10.3.1

### Patch Changes

- Updated dependencies [b5cfaf6]
  - @verdaccio/file-locking@10.3.0

## 10.3.0

### Minor Changes

- 56c65d9: Refactor htpasswd plugin to use the bcryptjs 'compare' api call instead of 'comparSync'. Add a new configuration value named 'slow_verify_ms' to the htpasswd plugin that when exceeded during password verification will log a warning message.

## 10.2.0

### Minor Changes

- 803c518: chore: update core dependencies

### Patch Changes

- Updated dependencies [803c518]
  - @verdaccio/file-locking@10.2.0

## 10.1.0

### Minor Changes

- 4e9a3d0: feat: remove core-js from bundle

  By using babel.js core-js injects some requires that are not necessarily dependencies and fails on pnpm and yarn 2 due are strict. No need to add this feature so is removed.

  - https://babeljs.io/docs/en/babel-preset-env#usebuiltins

### Patch Changes

- Updated dependencies [4e9a3d0]
  - @verdaccio/file-locking@10.1.0

## 10.0.1

### Patch Changes

- 6134415: fix: update dependencies
- Updated dependencies [6134415]
  - @verdaccio/file-locking@10.0.1

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [10.0.0](https://github.com/verdaccio/monorepo/compare/v9.7.5...v10.0.0) (2021-03-29)

**Note:** Version bump only for package verdaccio-htpasswd

## [9.7.2](https://github.com/verdaccio/monorepo/compare/v9.7.1...v9.7.2) (2020-07-20)

**Note:** Version bump only for package verdaccio-htpasswd

## [9.7.1](https://github.com/verdaccio/monorepo/compare/v9.7.0...v9.7.1) (2020-07-10)

### Bug Fixes

- update dependencies ([#375](https://github.com/verdaccio/monorepo/issues/375)) ([1e7aeec](https://github.com/verdaccio/monorepo/commit/1e7aeec31b056979285e272793a95b8c75d57c77))

# [9.7.0](https://github.com/verdaccio/monorepo/compare/v9.6.1...v9.7.0) (2020-06-24)

**Note:** Version bump only for package verdaccio-htpasswd

## [9.6.1](https://github.com/verdaccio/monorepo/compare/v9.6.0...v9.6.1) (2020-06-07)

**Note:** Version bump only for package verdaccio-htpasswd

# [9.5.0](https://github.com/verdaccio/monorepo/compare/v9.4.1...v9.5.0) (2020-05-02)

**Note:** Version bump only for package verdaccio-htpasswd

## [9.4.1](https://github.com/verdaccio/monorepo/compare/v9.4.0...v9.4.1) (2020-04-30)

### Bug Fixes

- **verdaccio-htpasswd:** generate non-constant legacy 2 byte salt ([#357](https://github.com/verdaccio/monorepo/issues/357)) ([d522595](https://github.com/verdaccio/monorepo/commit/d522595122b7deaac8e3bc568f73658041811aaf))

# [9.4.0](https://github.com/verdaccio/monorepo/compare/v9.3.4...v9.4.0) (2020-03-21)

**Note:** Version bump only for package verdaccio-htpasswd

## [9.3.2](https://github.com/verdaccio/monorepo/compare/v9.3.1...v9.3.2) (2020-03-08)

### Bug Fixes

- update dependencies ([#332](https://github.com/verdaccio/monorepo/issues/332)) ([b6165ae](https://github.com/verdaccio/monorepo/commit/b6165aea9b7e4012477081eae68bfa7159c58f56))

## [9.3.1](https://github.com/verdaccio/monorepo/compare/v9.3.0...v9.3.1) (2020-02-23)

**Note:** Version bump only for package verdaccio-htpasswd

# [9.3.0](https://github.com/verdaccio/monorepo/compare/v9.2.0...v9.3.0) (2020-01-29)

**Note:** Version bump only for package verdaccio-htpasswd

# [9.0.0](https://github.com/verdaccio/monorepo/compare/v8.5.3...v9.0.0) (2020-01-07)

### chore

- update dependencies ([68add74](https://github.com/verdaccio/monorepo/commit/68add743159867f678ddb9168d2bc8391844de47))

### Features

- **eslint-config:** enable eslint curly ([#308](https://github.com/verdaccio/monorepo/issues/308)) ([91acb12](https://github.com/verdaccio/monorepo/commit/91acb121847018e737c21b367fcaab8baa918347))

### BREAKING CHANGES

- @verdaccio/eslint-config requires ESLint >=6.8.0 and Prettier >=1.19.1 to fix compatibility with overrides.extends config

## [8.5.2](https://github.com/verdaccio/monorepo/compare/v8.5.1...v8.5.2) (2019-12-25)

**Note:** Version bump only for package verdaccio-htpasswd

## [8.5.1](https://github.com/verdaccio/monorepo/compare/v8.5.0...v8.5.1) (2019-12-24)

**Note:** Version bump only for package verdaccio-htpasswd

# [8.5.0](https://github.com/verdaccio/monorepo/compare/v8.4.2...v8.5.0) (2019-12-22)

**Note:** Version bump only for package verdaccio-htpasswd

## [8.4.2](https://github.com/verdaccio/monorepo/compare/v8.4.1...v8.4.2) (2019-11-23)

**Note:** Version bump only for package verdaccio-htpasswd

## [8.4.1](https://github.com/verdaccio/monorepo/compare/v8.4.0...v8.4.1) (2019-11-22)

**Note:** Version bump only for package verdaccio-htpasswd

# [8.4.0](https://github.com/verdaccio/monorepo/compare/v8.3.0...v8.4.0) (2019-11-22)

**Note:** Version bump only for package verdaccio-htpasswd

# [8.3.0](https://github.com/verdaccio/monorepo/compare/v8.2.0...v8.3.0) (2019-10-27)

**Note:** Version bump only for package verdaccio-htpasswd

# [8.2.0](https://github.com/verdaccio/monorepo/compare/v8.2.0-next.0...v8.2.0) (2019-10-23)

**Note:** Version bump only for package verdaccio-htpasswd

# [8.2.0-next.0](https://github.com/verdaccio/monorepo/compare/v8.1.4...v8.2.0-next.0) (2019-10-08)

### Bug Fixes

- fixed lint errors ([5e677f7](https://github.com/verdaccio/monorepo/commit/5e677f7))

## [8.1.2](https://github.com/verdaccio/monorepo/compare/v8.1.1...v8.1.2) (2019-09-29)

**Note:** Version bump only for package verdaccio-htpasswd

## [8.1.1](https://github.com/verdaccio/monorepo/compare/v8.1.0...v8.1.1) (2019-09-26)

**Note:** Version bump only for package verdaccio-htpasswd

# [8.1.0](https://github.com/verdaccio/monorepo/compare/v8.0.1-next.1...v8.1.0) (2019-09-07)

**Note:** Version bump only for package verdaccio-htpasswd

## [8.0.1-next.1](https://github.com/verdaccio/monorepo/compare/v8.0.1-next.0...v8.0.1-next.1) (2019-08-29)

**Note:** Version bump only for package verdaccio-htpasswd

## [8.0.1-next.0](https://github.com/verdaccio/monorepo/compare/v8.0.0...v8.0.1-next.0) (2019-08-29)

**Note:** Version bump only for package verdaccio-htpasswd

# [8.0.0](https://github.com/verdaccio/monorepo/compare/v8.0.0-next.4...v8.0.0) (2019-08-22)

**Note:** Version bump only for package verdaccio-htpasswd

# [8.0.0-next.4](https://github.com/verdaccio/monorepo/compare/v8.0.0-next.3...v8.0.0-next.4) (2019-08-18)

**Note:** Version bump only for package verdaccio-htpasswd

# [8.0.0-next.2](https://github.com/verdaccio/monorepo/compare/v8.0.0-next.1...v8.0.0-next.2) (2019-08-03)

**Note:** Version bump only for package verdaccio-htpasswd

# [8.0.0-next.1](https://github.com/verdaccio/monorepo/compare/v8.0.0-next.0...v8.0.0-next.1) (2019-08-01)

**Note:** Version bump only for package verdaccio-htpasswd

# [8.0.0-next.0](https://github.com/verdaccio/monorepo/compare/v2.0.0...v8.0.0-next.0) (2019-08-01)

**Note:** Version bump only for package verdaccio-htpasswd

# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [2.0.0](https://github.com/verdaccio/verdaccio-htpasswd/compare/v2.0.0-beta.1...v2.0.0) (2019-04-14)

### Features

- drop node v6 suport ([d1d52e8](https://github.com/verdaccio/verdaccio-htpasswd/commit/d1d52e8))

<a name="2.0.0-beta.1"></a>

# [2.0.0-beta.1](https://github.com/verdaccio/verdaccio-htpasswd/compare/v2.0.0-beta.0...v2.0.0-beta.1) (2019-02-24)

### Bug Fixes

- package.json to reduce vulnerabilities ([259bdaf](https://github.com/verdaccio/verdaccio-htpasswd/commit/259bdaf))
- update [@verdaccio](https://github.com/verdaccio)/file-locking@1.0.0 ([ec0bbfd](https://github.com/verdaccio/verdaccio-htpasswd/commit/ec0bbfd))

<a name="2.0.0-beta.0"></a>

# [2.0.0-beta.0](https://github.com/verdaccio/verdaccio-htpasswd/compare/v1.0.1...v2.0.0-beta.0) (2019-02-03)

### Features

- migrate to typescript ([79f6937](https://github.com/verdaccio/verdaccio-htpasswd/commit/79f6937))
- remove Node6 from CircleCI ([d3a05ab](https://github.com/verdaccio/verdaccio-htpasswd/commit/d3a05ab))
- use verdaccio babel preset ([3a63f88](https://github.com/verdaccio/verdaccio-htpasswd/commit/3a63f88))

<a name="1.0.1"></a>

## [1.0.1](https://github.com/verdaccio/verdaccio-htpasswd/compare/v1.0.0...v1.0.1) (2018-09-30)

### Bug Fixes

- password hash & increase coverage ([6420c26](https://github.com/verdaccio/verdaccio-htpasswd/commit/6420c26))

<a name="1.0.0"></a>

# [1.0.0](https://github.com/verdaccio/verdaccio-htpasswd/compare/v0.2.2...v1.0.0) (2018-09-30)

### Bug Fixes

- adds error message for user registration ([0bab945](https://github.com/verdaccio/verdaccio-htpasswd/commit/0bab945))

### Features

- **change-passwd:** implement change password [#32](https://github.com/verdaccio/verdaccio-htpasswd/issues/32) ([830b143](https://github.com/verdaccio/verdaccio-htpasswd/commit/830b143))
