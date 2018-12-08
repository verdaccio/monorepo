# @verdaccio/local-storage

📦 File system storage plugin for verdaccio 


[![CircleCI](https://circleci.com/gh/verdaccio/local-storage/tree/master.svg?style=svg)](https://circleci.com/gh/verdaccio/local-storage/tree/master)
[![Backers on Open Collective](https://opencollective.com/verdaccio/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/verdaccio/sponsors/badge.svg)](#sponsors)
[![dependencies Status](https://david-dm.org/verdaccio/local-storage/status.svg)](https://david-dm.org/verdaccio/local-storage)
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


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fverdaccio%2Flocal-storage.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fverdaccio%2Flocal-storage?ref=badge_large)
