# verdaccio-google-cloud
☁️📦 Google Cloud storage plugin for verdaccio

```
 npm install --global verdaccio-google-cloud
```

### Requirements

```
npm install -g verdaccio@beta
// or
npm install -g verdaccio@3.0.0
```

Complete configuration example:

```yaml
store:
  google-cloud:
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

This plugin is experimental and unstable.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
