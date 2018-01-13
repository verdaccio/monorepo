# verdaccio-memory

A memory based **storage plugin**.

```
 npm install --global verdaccio-memory
```

Complete configuration example:

```yaml
store:
  memory:
    cache: true
```    

in `config.yaml`

If `store:` is present `storage:` fallback is being ignored.

```yaml
storage: /Users/jpicado/.local/share/verdaccio/storage
auth:
  htpasswd:
    file: ./htpasswd
store:
  memory:
    cache: true   
```

## Disclaimer

This plugin should not be use for production environments. It might be useful for testing or such places as CI where data does not need to be persisted.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)