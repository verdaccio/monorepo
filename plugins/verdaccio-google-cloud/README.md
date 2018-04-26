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
   projectId: project-01 | env
	key: /path/project-01.json | env
```
Define `env` whether you want load the value from environment variables.

in `config.yaml`

If `store:` is present `storage:` fallback is being ignored.

```yaml
# storage is required as fallback but not used if you enable this plugin
storage: /Users/user/.local/share/verdaccio/storage
auth:
  htpasswd:
    file: ./htpasswd
store:
  google-cloud:
   projectId: project-01
   key: /path/project-01.json
```

## Disclaimer

This plugin is experimental and unstable.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)