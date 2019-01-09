# @verdaccio/local-storage

📦 File system storage plugin for verdaccio 


[![CircleCI](https://circleci.com/gh/verdaccio/local-storage/tree/master.svg?style=svg)](https://circleci.com/gh/verdaccio/local-storage/tree/master)
[![codecov](https://codecov.io/gh/verdaccio/local-storage/branch/master/graph/badge.svg)](https://codecov.io/gh/verdaccio/local-storage)
[![backers](https://opencollective.com/verdaccio/tiers/backer/badge.svg?label=Backer&color=brightgreen)](https://opencollective.com/verdaccio)
[![discord](https://img.shields.io/discord/388674437219745793.svg)](http://chat.verdaccio.org/)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)

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
