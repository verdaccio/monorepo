# verdaccio-google-cloud
[![npm](https://img.shields.io/npm/v/verdaccio-google-cloud.svg)](https://www.npmjs.com/package/verdaccio-google-cloud)
[![CircleCI](https://circleci.com/gh/verdaccio/verdaccio-google-cloud.svg?style=svg)](https://circleci.com/gh/verdaccio/verdaccio-google-cloud)
[![codecov](https://codecov.io/gh/verdaccio/verdaccio-google-cloud/branch/master/graph/badge.svg)](https://codecov.io/gh/verdaccio/verdaccio-google-cloud)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fverdaccio%2Fverdaccio-google-cloud.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fverdaccio%2Fverdaccio-google-cloud?ref=badge_shield)
[![backers](https://opencollective.com/verdaccio/tiers/backer/badge.svg?label=Backer&color=brightgreen)](https://opencollective.com/verdaccio)
[![discord](https://img.shields.io/discord/388674437219745793.svg)](http://chat.verdaccio.org/)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)


☁️📦 Google Cloud storage plugin for verdaccio

⚠️⚠️ This plugin is experimental and might be unstable. It requires further testing. ⚠️⚠️

```
npm i -g verdaccio-google-cloud
yarn global add verdaccio-google-cloud
pnpm i -g verdaccio-google-cloud
```

### Requirements

* Google Cloud Platform Account
* Google Cloud Platform project that is using [Google Firestore in Datastore mode](https://cloud.google.com/firestore/docs/firestore-or-datastore)
* Service account with 'Cloud Datastore Owner' role and read/write access to the storage bucket
* Verdaccio server (see below)

```
npm install -g verdaccio@latest
yarn global add verdaccio@latest
pnpm -g verdaccio@latest
```

### Configuration

Complete configuration example:

```yaml
store:
  google-cloud:
   ## google project id
   projectId: project-01 || env (GOOGLE_CLOUD_VERDACCIO_PROJECT_ID)

   ## The namespace for metadata database. Defaults to 'VerdaccioDataStore'.
   # kind: someRandomMetadataDatabaseKey

   ## This plugin does not create the bucket. It has to already exist.
   bucket: my-bucket-name

   ## Google Cloud Platform only recommends using this file for development.
   ## This field is optional.
   # keyFilename: /path/project-01.json || env (GOOGLE_CLOUD_VERDACCIO_KEY)

   ## The default validation is crc32c. It can be overridden using the
   ## https://googleapis.dev/nodejs/storage/latest/global.html#CreateWriteStreamOptions
   ## of https://googleapis.dev/nodejs/storage/latest/File.html#createWriteStream
   # validation: crc32c

   ## Enable/disable resumable uploads to GC Storage
   ## By default it's enabled in `@google-cloud/storage`.
   ## This may cause failures for small package uploads so it is recommended to set it to `false`.
   ## @see https://stackoverflow.com/questions/53172050/google-cloud-storage-invalid-upload-request-error-bad-request
   resumable: false
```

Define `env` whether you want load the value from environment variables.

> If you are willing to use some of `env` just **do not define** properties on
`config.yaml` or let them emtpy. Properties have preceden over `env` variables.

## Disclaimer

⚠️⚠️ This plugin is experimental and might be unstable. It requires further testing. ⚠️⚠️

## License

[MIT Licensed](http://www.opensource.org/licenses/mit-license.php)


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fverdaccio%2Fverdaccio-google-cloud.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fverdaccio%2Fverdaccio-google-cloud?ref=badge_large)
