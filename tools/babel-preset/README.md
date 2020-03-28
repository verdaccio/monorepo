# @verdaccio/babel-preset

[![@verdaccio/babel-preset (latest)](https://img.shields.io/npm/v/@verdaccio/babel-preset/latest.svg)](https://www.npmjs.com/package/@verdaccio/babel-preset)
[![Node version (latest)](https://img.shields.io/node/v/@verdaccio/babel-preset/latest.svg)](https://www.npmjs.com/package/@verdaccio/babel-preset)
[![Dependencies](https://img.shields.io/david/verdaccio/monorepo?path=tools%2Fbabel-preset)](https://david-dm.org/verdaccio/monorepo/master?path=tools%2Fbabel-preset)
[![DevDependencies](https://img.shields.io/david/dev/verdaccio/monorepo?path=tools%2Fbabel-preset)](https://david-dm.org/verdaccio/monorepo/master?path=tools%2Fbabel-preset&type=dev)
[![MIT](https://img.shields.io/github/license/verdaccio/monorepo.svg)](./LICENSE)

Configurable Babel preset for Verdaccio projects

## Usage

To use the preset in your `.babelrc` file, you have to add it using:

```json
{
  "presets": ["@verdaccio"]
}
```

`BABEL_ENV` options possibles are: `ui`, `test`, `registry` and `docker`.

Note: `docker` has a fixed Node targed with `10`;

### Options

To use a different Node target version (by default is `6.10`)

```json
{
  "presets": [["@verdaccio", {"node": "9"}]]
}
```

> Node 8.15 is the minimum version supported and the default set up.

Enable debug

```json
{
  "presets": [["@verdaccio", {"debug": true}]]
}
```

## License

This is an open source project under [MIT license](./LICENSE)
