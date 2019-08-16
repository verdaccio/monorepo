# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [8.0.0-next.3](https://github.com/verdaccio/monorepo/compare/v8.0.0-next.2...v8.0.0-next.3) (2019-08-16)


### Bug Fixes

* restore closure ([32b9d7e](https://github.com/verdaccio/monorepo/commit/32b9d7e))
* **build:** error on types for fs callback ([cc35acb](https://github.com/verdaccio/monorepo/commit/cc35acb))
* Add DATE and VERSION in search result ([e352b75](https://github.com/verdaccio/monorepo/commit/e352b75))
* avoid open write stream if resource exist [#1191](https://github.com/verdaccio/monorepo/issues/1191) ([f041d3f](https://github.com/verdaccio/monorepo/commit/f041d3f))
* bug fixing integration ([6c75ac8](https://github.com/verdaccio/monorepo/commit/6c75ac8))
* build before publish ([cd6c7ff](https://github.com/verdaccio/monorepo/commit/cd6c7ff))
* changed how key is generated for datastore.save to prevent duplicate entries. Key is now the name of the package ([#8](https://github.com/verdaccio/monorepo/issues/8)) ([4418fcb](https://github.com/verdaccio/monorepo/commit/4418fcb))
* check whether path exist before return result ([a4d2af1](https://github.com/verdaccio/monorepo/commit/a4d2af1))
* CI build ([4d586fb](https://github.com/verdaccio/monorepo/commit/4d586fb))
* flow issues ([f42a284](https://github.com/verdaccio/monorepo/commit/f42a284))
* ignore flow on this one, we need it ([c8e0b2b](https://github.com/verdaccio/monorepo/commit/c8e0b2b))
* local storage requires package.json file for read, save and create all the time ([33c847b](https://github.com/verdaccio/monorepo/commit/33c847b))
* migration from main repository merge [#306](https://github.com/verdaccio/monorepo/issues/306) ([8fbe86e](https://github.com/verdaccio/monorepo/commit/8fbe86e))
* missing callback ([abfc422](https://github.com/verdaccio/monorepo/commit/abfc422))
* missing error code ([7121939](https://github.com/verdaccio/monorepo/commit/7121939))
* move to local storage the fs location handler ([3b12083](https://github.com/verdaccio/monorepo/commit/3b12083))
* mtimeMs is not backward compatible ([c6f74eb](https://github.com/verdaccio/monorepo/commit/c6f74eb))
* readme update ([f54f27b](https://github.com/verdaccio/monorepo/commit/f54f27b))
* remove temp file whether is emtpy and fails ([655102f](https://github.com/verdaccio/monorepo/commit/655102f))
* remove uncessary async ([3e3e3a6](https://github.com/verdaccio/monorepo/commit/3e3e3a6))
* remove unused dependency ([ef6e6fe](https://github.com/verdaccio/monorepo/commit/ef6e6fe))
* remove unused parameters ([554e301](https://github.com/verdaccio/monorepo/commit/554e301))
* restore build path ([4902042](https://github.com/verdaccio/monorepo/commit/4902042))
* return time as milliseconds ([15467ba](https://github.com/verdaccio/monorepo/commit/15467ba))
* sync after set secret ([2abae4f](https://github.com/verdaccio/monorepo/commit/2abae4f))
* temp files are written into the storage ([89a1dc8](https://github.com/verdaccio/monorepo/commit/89a1dc8))
* unit test ([995a27c](https://github.com/verdaccio/monorepo/commit/995a27c))
* update [@google-cloud](https://github.com/google-cloud) deps ([811b706](https://github.com/verdaccio/monorepo/commit/811b706))
* update @verdaccio/file-locking@1.0.0 ([9bd36f0](https://github.com/verdaccio/monorepo/commit/9bd36f0))
* update lodash types ([184466c](https://github.com/verdaccio/monorepo/commit/184466c))


### Features

* token support with level.js ([#168](https://github.com/verdaccio/monorepo/issues/168)) ([ca877ff](https://github.com/verdaccio/monorepo/commit/ca877ff))
* **build:** standardize build ([33fe090](https://github.com/verdaccio/monorepo/commit/33fe090))
* add file validation configuration ([bcd46c5](https://github.com/verdaccio/monorepo/commit/bcd46c5))
* add write tarball and read tarball ([f0296db](https://github.com/verdaccio/monorepo/commit/f0296db))
* change new db name to verdaccio ([#83](https://github.com/verdaccio/monorepo/issues/83)) ([edfca9f](https://github.com/verdaccio/monorepo/commit/edfca9f))
* drop node v6 support ([664f288](https://github.com/verdaccio/monorepo/commit/664f288))
* implement search ([2e2bb32](https://github.com/verdaccio/monorepo/commit/2e2bb32))
* improve storage transactions based on bucket ([7edaae7](https://github.com/verdaccio/monorepo/commit/7edaae7))
* migrate to typescript ([c439d25](https://github.com/verdaccio/monorepo/commit/c439d25))
* update database method with callbacks ([ef202a9](https://github.com/verdaccio/monorepo/commit/ef202a9))
* update minor dependencies ([007b026](https://github.com/verdaccio/monorepo/commit/007b026))





# [8.0.0-next.2](https://github.com/verdaccio/monorepo/compare/v8.0.0-next.1...v8.0.0-next.2) (2019-08-03)


### Bug Fixes

* update types for tokens ([9734fa8](https://github.com/verdaccio/monorepo/commit/9734fa8))


### Features

* add aws s3 plugin in typescrip ([d65c88d](https://github.com/verdaccio/monorepo/commit/d65c88d))
* add logging ([#5](https://github.com/verdaccio/monorepo/issues/5)) ([4d7a068](https://github.com/verdaccio/monorepo/commit/4d7a068))





# [8.0.0-next.1](https://github.com/verdaccio/monorepo/compare/v8.0.0-next.0...v8.0.0-next.1) (2019-08-01)

**Note:** Version bump only for package @verdaccio/monorepo





# [8.0.0-next.0](https://github.com/verdaccio/monorepo/compare/v2.0.0...v8.0.0-next.0) (2019-08-01)


### Bug Fixes

* add _autogenerated to UpLinkConf ([436bd91](https://github.com/verdaccio/monorepo/commit/436bd91))
* add config prop to IBasicAuth ([2481d6f](https://github.com/verdaccio/monorepo/commit/2481d6f))
* add es6 imports ([932a22d](https://github.com/verdaccio/monorepo/commit/932a22d))
* add missing adduser method ([22cdb4e](https://github.com/verdaccio/monorepo/commit/22cdb4e))
* add missing properties ([973c5e4](https://github.com/verdaccio/monorepo/commit/973c5e4))
* add missing status error code, fix flow issue ([e3ad550](https://github.com/verdaccio/monorepo/commit/e3ad550))
* allow extend config ([0aea94f](https://github.com/verdaccio/monorepo/commit/0aea94f))
* allow sub types on allow auth methods ([7325f74](https://github.com/verdaccio/monorepo/commit/7325f74))
* deprecated methods are optional ([b77155a](https://github.com/verdaccio/monorepo/commit/b77155a))
* entry point [#14](https://github.com/verdaccio/monorepo/issues/14) ([7575e75](https://github.com/verdaccio/monorepo/commit/7575e75))
* eslint and typescript errors ([8b3f153](https://github.com/verdaccio/monorepo/commit/8b3f153))
* export Author type ([bf7115b](https://github.com/verdaccio/monorepo/commit/bf7115b))
* fix/token i local package manager ([#61](https://github.com/verdaccio/monorepo/issues/61)) ([a7e0fc8](https://github.com/verdaccio/monorepo/commit/a7e0fc8))
* fixes for storage plugin types per code review ([#59](https://github.com/verdaccio/monorepo/issues/59)) ([04fccb8](https://github.com/verdaccio/monorepo/commit/04fccb8))
* getPackageStorage allowed to return undefined ([8a859d0](https://github.com/verdaccio/monorepo/commit/8a859d0))
* improvements config interface ([1dac321](https://github.com/verdaccio/monorepo/commit/1dac321))
* issue on package not found ([944e1a5](https://github.com/verdaccio/monorepo/commit/944e1a5))
* lint issues ([d195fff](https://github.com/verdaccio/monorepo/commit/d195fff))
* lint warnings ([444a99e](https://github.com/verdaccio/monorepo/commit/444a99e))
* main file is correct routed ([245b115](https://github.com/verdaccio/monorepo/commit/245b115))
* methods return Stream ([22e0672](https://github.com/verdaccio/monorepo/commit/22e0672))
* missing params ([9979160](https://github.com/verdaccio/monorepo/commit/9979160))
* on error returns 500 by default ([86bf628](https://github.com/verdaccio/monorepo/commit/86bf628))
* package.json to reduce vulnerabilities ([457a791](https://github.com/verdaccio/monorepo/commit/457a791))
* read tarball stream ([bc4bbbb](https://github.com/verdaccio/monorepo/commit/bc4bbbb))
* remove options from get package metadata ([2bfc048](https://github.com/verdaccio/monorepo/commit/2bfc048))
* remove source maps ([6ca4895](https://github.com/verdaccio/monorepo/commit/6ca4895))
* remove wrong definition ([acba624](https://github.com/verdaccio/monorepo/commit/acba624))
* remove wrong imports ([c82f51c](https://github.com/verdaccio/monorepo/commit/c82f51c))
* restore error messages ([5d241b6](https://github.com/verdaccio/monorepo/commit/5d241b6))
* restore missing type on RemoteUser ([b596896](https://github.com/verdaccio/monorepo/commit/b596896))
* storage types ([1285675](https://github.com/verdaccio/monorepo/commit/1285675))
* tokens are accesible also in local-storage ([08b342d](https://github.com/verdaccio/monorepo/commit/08b342d))
* update @verdaccio/file-locking@1.0.0 ([2946f83](https://github.com/verdaccio/monorepo/commit/2946f83))
* update https ([c93c3fc](https://github.com/verdaccio/monorepo/commit/c93c3fc))
* update new plugin types flow ([d2e2319](https://github.com/verdaccio/monorepo/commit/d2e2319))
* update readTarball with right parameters ([8cbc7d1](https://github.com/verdaccio/monorepo/commit/8cbc7d1))
* update streams type ([7fa7be5](https://github.com/verdaccio/monorepo/commit/7fa7be5))
* update types for local data ([6706770](https://github.com/verdaccio/monorepo/commit/6706770))
* update utils types ([7c37133](https://github.com/verdaccio/monorepo/commit/7c37133))
* wrong signature for auth plugin ([e3e2508](https://github.com/verdaccio/monorepo/commit/e3e2508))


### Features

* add audit quick endpoint ([5ab2ece](https://github.com/verdaccio/monorepo/commit/5ab2ece))
* add AuthPluginPackage type ([f0e1cea](https://github.com/verdaccio/monorepo/commit/f0e1cea))
* add callback to database methods ([d0d55e9](https://github.com/verdaccio/monorepo/commit/d0d55e9))
* add config file types ([188a3e5](https://github.com/verdaccio/monorepo/commit/188a3e5))
* add getSecret support ([0d047f4](https://github.com/verdaccio/monorepo/commit/0d047f4))
* add gravatar prop for web config ([b3ac873](https://github.com/verdaccio/monorepo/commit/b3ac873))
* add interface for middleware and storage plugin ([2b18e22](https://github.com/verdaccio/monorepo/commit/2b18e22))
* add IStorageManager for middleware plugin ([0ac1cc4](https://github.com/verdaccio/monorepo/commit/0ac1cc4))
* add limit feature ([9e2fa5c](https://github.com/verdaccio/monorepo/commit/9e2fa5c))
* Add locking library on typings ([7f7ab67](https://github.com/verdaccio/monorepo/commit/7f7ab67))
* add logging output for each action ([66f183c](https://github.com/verdaccio/monorepo/commit/66f183c))
* add RemoteUser type ([7d11892](https://github.com/verdaccio/monorepo/commit/7d11892))
* add search method BREAKING CHANGE: search method must be implemented to allow search functionality ([b6d94e6](https://github.com/verdaccio/monorepo/commit/b6d94e6))
* add secret gateway methods ([5300147](https://github.com/verdaccio/monorepo/commit/5300147))
* add Security configuration ([0cdc0dd](https://github.com/verdaccio/monorepo/commit/0cdc0dd))
* add stream library ([434628f](https://github.com/verdaccio/monorepo/commit/434628f))
* add types for auth plugin ([6378186](https://github.com/verdaccio/monorepo/commit/6378186))
* add types for PackageUsers ([ad5f917](https://github.com/verdaccio/monorepo/commit/ad5f917))
* add types for search class ([e23782d](https://github.com/verdaccio/monorepo/commit/e23782d))
* callback does not return ([fd78bfc](https://github.com/verdaccio/monorepo/commit/fd78bfc))
* change password ([de0a341](https://github.com/verdaccio/monorepo/commit/de0a341))
* drop node v6 ([d0ae9ba](https://github.com/verdaccio/monorepo/commit/d0ae9ba))
* drop node v6 support ([bb319c4](https://github.com/verdaccio/monorepo/commit/bb319c4))
* local database method are async ([f55302b](https://github.com/verdaccio/monorepo/commit/f55302b))
* merge changes from 5.x ([5f61009](https://github.com/verdaccio/monorepo/commit/5f61009))
* migrate to typescript ([caffcd5](https://github.com/verdaccio/monorepo/commit/caffcd5))
* migrate to typescript ([c01df36](https://github.com/verdaccio/monorepo/commit/c01df36))
* migrate to typescript BREAKING CHANGE: new compiler might bring issues ([13ebde2](https://github.com/verdaccio/monorepo/commit/13ebde2))
* node 6 as minimum ([ed81731](https://github.com/verdaccio/monorepo/commit/ed81731))
* proxy npm audit endpoint ([b11151d](https://github.com/verdaccio/monorepo/commit/b11151d))
* **build:** use typescript, jest 24 and babel 7 as stack BREAKING CHANGE: typescript build system requires a major release to avoid issues with old installations ([4743a9a](https://github.com/verdaccio/monorepo/commit/4743a9a))
* **config:** allow set users ([e5326fd](https://github.com/verdaccio/monorepo/commit/e5326fd))
* migration to typescript ([748ca92](https://github.com/verdaccio/monorepo/commit/748ca92))
* package access props are not optional ([61708e2](https://github.com/verdaccio/monorepo/commit/61708e2))
* remote lodash as dependency ([affb65b](https://github.com/verdaccio/monorepo/commit/affb65b))
* remove flow [#70](https://github.com/verdaccio/monorepo/issues/70) ([2218b74](https://github.com/verdaccio/monorepo/commit/2218b74))
* remove sync method ([f60f81c](https://github.com/verdaccio/monorepo/commit/f60f81c))
* secret methods are async ([d5eacf5](https://github.com/verdaccio/monorepo/commit/d5eacf5))
* support for an IPluginStorageFilter ([#58](https://github.com/verdaccio/monorepo/issues/58)) ([eab219e](https://github.com/verdaccio/monorepo/commit/eab219e))
* token types ([#60](https://github.com/verdaccio/monorepo/issues/60)) @Eomm ([6e74da6](https://github.com/verdaccio/monorepo/commit/6e74da6))
* update secret to async ([9bcab19](https://github.com/verdaccio/monorepo/commit/9bcab19))
* **auth:** add method to update password ([e257c3a](https://github.com/verdaccio/monorepo/commit/e257c3a))
* **commons-api:** add commons-api package ([13dfa76](https://github.com/verdaccio/monorepo/commit/13dfa76))
* **readme:** import readme package ([f4bbf3a](https://github.com/verdaccio/monorepo/commit/f4bbf3a))
* **readme:** modernize project ([0d8f963](https://github.com/verdaccio/monorepo/commit/0d8f963))
* **storage:** path is not mandatory ([2c42931](https://github.com/verdaccio/monorepo/commit/2c42931))


### BREAKING CHANGES

* remove flow definitions
* storage needs to add new methods

* add: token types

* add: typescripts types
* **auth:** it will affect all auth plugins





# 2.0.0 (2019-07-21)


### Bug Fixes

* packages/verdaccio-file-locking/package.json to reduce vulnerabilities ([ba2579b](https://github.com/verdaccio/monorepo/commit/ba2579b))


### Features

* **babel-preset:** import babel-preset package ([9b39181](https://github.com/verdaccio/monorepo/commit/9b39181))
* **eslint-config:** add @verdaccio/eslint-config ([36fad54](https://github.com/verdaccio/monorepo/commit/36fad54))
* **eslint-config:** import eslint-config-verdaccio package ([6d602f4](https://github.com/verdaccio/monorepo/commit/6d602f4))
* **eslint-plugin-verdaccio:** import eslint-plugin-verdaccio package ([3e028d5](https://github.com/verdaccio/monorepo/commit/3e028d5))
* add project boilerplate ([73dcf5f](https://github.com/verdaccio/monorepo/commit/73dcf5f))
* wip add core packages ([d914f3e](https://github.com/verdaccio/monorepo/commit/d914f3e))


### BREAKING CHANGES

* **eslint-config:** ESLint and Prettier won't be provided anymore. They are moved as peerDependencies

* **babel-preset:** it remove ui dependencies need to be defined in a specific webpack project

- babel-loader, eslint-loader

- chore(release): 0.2.0

- chore: update lock file

- chore: add circleci

- chore: update circleci

- chore(release): 0.2.1

- feat: remove flow from configuration
* **babel-preset:** flow is not need it anymore

- chore(release): 1.0.0
