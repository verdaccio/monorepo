# verdaccio-memory

[![CircleCI](https://circleci.com/gh/verdaccio/verdaccio-memory.svg?style=svg)](https://circleci.com/gh/ayusharma/verdaccio-memory)
[![codecov](https://codecov.io/gh/verdaccio/verdaccio-memory/branch/master/graph/badge.svg)](https://codecov.io/gh/verdaccio/verdaccio-memory)

A memory based **storage plugin**.

```
 npm install --global verdaccio-memory
```

### Requirements

Higher than `verdaccio@3.0.0`

```
npm install -g verdaccio@latest
```

Complete configuration example:

```yaml
store:
  memory:
    limit: 1000
```

in `config.yaml`

If `store:` is present `storage:` fallback is being ignored.

```yaml
storage: /Users/user/.local/share/verdaccio/storage
auth:
  htpasswd:
    file: ./htpasswd
store:
  memory:
    limit: 1000
```

## Disclaimer

This plugin should not be use for production environments. It might be useful for testing or such places as CI where data does not need to be persisted.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
