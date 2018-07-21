# verdaccio-google-cloud
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fverdaccio%2Fverdaccio-google-cloud.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fverdaccio%2Fverdaccio-google-cloud?ref=badge_shield)

☁️📦 Google Cloud storage plugin for verdaccio

```
npm i -g verdaccio-google-cloud
yarn global add verdaccio-google-cloud
pnpm i -g verdaccio-google-cloud
```

### Requirements

* Google Cloud Account
* Verdaccio server (see below)

```
npm install -g verdaccio@beta
yarn global add verdaccio@beta
pnpm -g verdaccio@beta
```

### Configuration

Complete configuration example:

```yaml
store:
  google-cloud:
   ## google project id
   projectId: project-01 || env (GOOGLE_CLOUD_VERDACCIO_PROJECT_ID)

   ## namespace for metadata database
   kind: someRandonMetadataDatabaseKey

   ## this pluging do not create the bucket, it has to exist
   bucket: my-bucket-name

   ## google cloud recomend this file only for development
   ## this field is not mandatory
   keyFilename: /path/project-01.json || env (GOOGLE_CLOUD_VERDACCIO_KEY)

   ## default validation is, it can be overrided by 
   ## https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/File.html#createWriteStream
   # validation: crc32c
```
Define `env` whether you want load the value from environment variables.

> If you are willing to use some of `env` just **do not define** properties on
`config.yaml` or let them emtpy. Properties have preceden over `env` variables.

## Disclaimer

This plugin is experimental and unstable. It requires further testing.

## License

[MIT Licensed](http://www.opensource.org/licenses/mit-license.php)


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fverdaccio%2Fverdaccio-google-cloud.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fverdaccio%2Fverdaccio-google-cloud?ref=badge_large)
