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
```
Define `env` whether you want load the value from environment variables.

## Disclaimer

This plugin is experimental and unstable.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
