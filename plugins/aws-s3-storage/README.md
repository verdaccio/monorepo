# verdaccio-aws-s3-storage

📦 AWS S3 storage plugin for Verdaccio

[![verdaccio (latest)](https://img.shields.io/npm/v/verdaccio-aws-s3-storage/latest.svg)](https://www.npmjs.com/package/verdaccio-aws-s3-storage)
[![CircleCI](https://circleci.com/gh/verdaccio/verdaccio-aws-s3-storage/tree/master.svg?style=svg)](https://circleci.com/gh/verdaccio/verdaccio-aws-s3-storage/tree/master)
[![Known Vulnerabilities](https://snyk.io/test/github/verdaccio/verdaccio-aws-s3-storage/badge.svg?targetFile=package.json)](https://snyk.io/test/github/verdaccio/verdaccio-aws-s3-storage?targetFile=package.json)
[![codecov](https://codecov.io/gh/verdaccio/verdaccio-aws-s3-storage/branch/master/graph/badge.svg)](https://codecov.io/gh/verdaccio/verdaccio-aws-s3-storage)
[![backers](https://opencollective.com/verdaccio/tiers/backer/badge.svg?label=Backer&color=brightgreen)](https://opencollective.com/verdaccio)
[![discord](https://img.shields.io/discord/388674437219745793.svg)](http://chat.verdaccio.org/)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
[![node](https://img.shields.io/node/v/verdaccio-aws-s3-storage/latest.svg)](https://www.npmjs.com/package/verdaccio-aws-s3-storage)

[![Twitter followers](https://img.shields.io/twitter/follow/verdaccio_npm.svg?style=social&label=Follow)](https://twitter.com/verdaccio_npm)
[![Github](https://img.shields.io/github/stars/verdaccio/verdaccio.svg?style=social&label=Stars)](https://github.com/verdaccio/verdaccio/stargazers)
[![backers](https://opencollective.com/verdaccio/tiers/backer/badge.svg?label=Backer&color=brightgreen)](https://opencollective.com/verdaccio)
[![stackshare](https://img.shields.io/badge/Follow%20on-StackShare-blue.svg?logo=stackshare&style=flat)](https://stackshare.io/verdaccio)


> This plugin was forked based on [`verdaccio-s3-storage`](https://github.com/Remitly/verdaccio-s3-storage) built in Typescript + other features added along 
the time. Both plugins might have vary in behaviour since then, we recommend use the AWS plugin on this repo due
is under control of Verdaccio community and constantly upated. 

## See it in action

* Test on [Docker + LocalStack + Verdaccio 4 + S3 Plugin example](https://github.com/verdaccio/docker-examples/tree/master/amazon-s3-docker-example).
* Using `docker-compose` on this repo based on [**verdaccio-minio**](https://github.com/barolab/verdaccio-minio) developed by [barolab](https://github.com/barolab).
* Feel free to propose new ways to run this plugin. 

### Basic Requirements

* AWS Account (in case you are using the cloud)
* Verdaccio server (4.0) (for 3.x use `verdaccio-s3-storage` instead)

```bash
npm install -g verdaccio
```

## Usage

```bash
npm install verdaccio-aws-s3-storage
```

This will pull AWS credentials from your environment.

In your verdaccio config, configure

```yaml
store:
  aws-s3-storage:
    bucket: your-s3-bucket
    keyPrefix: some-prefix # optional, has the effect of nesting all files in a subdirectory
    region: us-west-2 # optional, will use aws s3's default behavior if not specified
    endpoint: https://{service}.{region}.amazonaws.com # optional, will use aws s3's default behavior if not specified
    s3ForcePathStyle: false # optional, will use path style URLs for S3 objects
    tarballACL: private # optional, use public-read to work with CDN like Amazon CloudFront
    accessKeyId: your-access-key-id # optional, aws accessKeyId for private S3 bucket
    secretAccessKey: your-secret-access-key # optional, aws secretAccessKey for private S3 bucket
    sessionToken: your-session-token # optional, aws sessionToken for private S3 bucket
    proxy: your-proxy # optional, HTTP or HTTPS proxies if you can't connect to internet directly
```

The configured values can either be the actual value or the name of an environment variable that contains the value for the following options:

- `bucket`
- `keyPrefix`
- `region`
- `endpoint`
- `accessKeyId`
- `secretAccessKey`
- `sessionToken`
- `proxy`

> If an environment variable is not set then it is assumed the value is the literal value given. For example, if `S3_BUCKET` is not set, then this will use a bucket named exactly "S3_BUCKET".

```yaml
store:
  aws-s3-storage:
    bucket: S3_BUCKET
    keyPrefix: S3_KEY_PREFIX
    region: S3_REGION
    endpoint: S3_ENDPOINT
    accessKeyId: S3_ACCESS_KEY_ID
    secretAccessKey: S3_SECRET_ACCESS_KEY
    sessionToken: S3_SESSION_TOKEN
    proxy: HTTPS_PROXY
```

Additional properties can be defined for packages. The `storage` location corresponds to the folder in the S3 bucket.

```yaml
packages:
  '@scope/*':
    access: all
    publish: $all
    storage: 'scoped'
  '**':
    access: $all
    publish: $all
    proxy: npmjs
    storage: 'public'
```

### Specify ACL of Tarball Files

You can specify ACL of tarball files in S3 by the *tarballACL* configuration, set to 'private' by default. To enable S3 integrated CDN service (Amazon CloudFront for example), set *tarballACL* to 'public-read' to grant tarball files anonymous read permission.

```yaml
store:
  aws-s3-storage:
    tarballACL: public-read
```

## Developer Testing

In case of local testing, this project can be used self-efficiently. Four main ingredients are as follows:

* `config.yaml`, see [verdaccio documentation](https://verdaccio.org/docs/en/configuration.html)
* The provided docker file allows to test the plugin, with no need for main verdaccio application
* The provided docker-compose also provides minio in orchestration as a local substitute for S3 backend
* Create and set content of `registry.env` as follows. This file does not exist on the repo and should be generated manually after cloning the project.

```
AWS_ACCESS_KEY_ID=foobar
AWS_SECRET_ACCESS_KEY=1234567e
AWS_DEFAULT_REGION=eu-central-1
AWS_S3_ENDPOINT=https://localhost:9000/
AWS_S3_PATH_STYLE=true
```

## Execute the docker image for testing

> You need the latest docker installed in your computer

```bash
docker-compose up
```

> By default there is no bucket created, **you might need to browse `http://127.0.0.1:9000/minio/` and create
the example bucket manually named `rise`** and then restart `docker-compose up`.

The default values should work out of the box. If you change anything, make sure the corresponding variables are set in
other parts of the ingredient as well.
