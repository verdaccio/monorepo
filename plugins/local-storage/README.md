# @verdaccio/local-storage

📦 File system storage plugin for verdaccio 


[![CircleCI](https://circleci.com/gh/verdaccio/local-storage/tree/master.svg?style=svg)](https://circleci.com/gh/verdaccio/local-storage/tree/master)
[![Backers on Open Collective](https://opencollective.com/verdaccio/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/verdaccio/sponsors/badge.svg)](#sponsors)
[![Gitter chat](https://badges.gitter.im/verdaccio/questions.png)](https://gitter.im/verdaccio/)
[![dependencies Status](https://david-dm.org/verdaccio/local-storage/status.svg)](https://david-dm.org/verdaccio/local-storage)
[![Known Vulnerabilities](https://snyk.io/test/github/verdaccio/local-storage/badge.svg?targetFile=package.json)](https://snyk.io/test/github/verdaccio/local-storage?targetFile=package.json)
[![codecov](https://codecov.io/gh/verdaccio/local-storage/branch/master/graph/badge.svg)](https://codecov.io/gh/verdaccio/local-storage)

> This package is already built-in in verdaccio

```
npm install @verdaccio/local-storage
```

### API

### LocalDatabase

The main object that handle a JSON database the private packages.

#### Constructor

```
new LocalDatabase(config, logger);
```

* **config**: A verdaccio configuration instance.
* **logger**: A logger instance

### LocalFS

A class that handle an package instance in the File System

```
new LocalFS(packageStoragePath, logger);
```



## License
Verdaccio is [MIT licensed](https://github.com/verdaccio/local-storage/blob/master/LICENSE).
