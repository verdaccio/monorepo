# verdaccio-audit
🛡🔬 npmjs audit support for verdaccio

[![verdaccio (latest)](https://img.shields.io/npm/v/verdaccio-audit/latest.svg)](https://www.npmjs.com/package/verdaccio-audit)
[![Known Vulnerabilities](https://snyk.io/test/github/verdaccio/verdaccio-audit/badge.svg?targetFile=package.json)](https://snyk.io/test/github/verdaccio/verdaccio-audit?targetFile=package.json)
[![backers](https://opencollective.com/verdaccio/tiers/backer/badge.svg?label=Backer&color=brightgreen)](https://opencollective.com/verdaccio)
[![discord](https://img.shields.io/discord/388674437219745793.svg)](http://chat.verdaccio.org/)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
[![node](https://img.shields.io/node/v/verdaccio-audit/latest.svg)](https://www.npmjs.com/package/verdaccio-audit)

## Requirements

* verdaccio@3.x or higher

```
 npm install --global verdaccio-audit
```

## Usage
To enable it you need to add this to your configuration file.
```
middlewares:
  audit:
    enabled: true
```

## Disclaimer

This plugin is experimental and unstable. Please report any issue you found.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
