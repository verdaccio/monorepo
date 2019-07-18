# @verdaccio/babel-preset

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

@verdaccio/babel-preset is a open source project with [MIT license](LICENSE)
