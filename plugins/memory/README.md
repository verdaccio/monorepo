# verdaccio-memory

A memory based **storage plugin**.

```
 npm install --global verdaccio-memory
```

### Requirements

This plugin won't work with versiones minimum as `3.0.0-alpha.7`

```
npm install -g verdaccio@3.0.0-alpha.7
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
