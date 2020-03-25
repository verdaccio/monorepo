# eslint-plugin-verdaccio

[![eslint-plugin-verdaccio (latest)](https://img.shields.io/npm/v/eslint-plugin-verdaccio/latest.svg)](https://www.npmjs.com/package/eslint-plugin-verdaccio)
[![Node version (latest)](https://img.shields.io/node/v/eslint-plugin-verdaccio/latest.svg)](https://www.npmjs.com/package/eslint-plugin-verdaccio)
[![Dependencies](https://img.shields.io/david/verdaccio/monorepo?path=tools%2Feslint-plugin-verdaccio)](https://david-dm.org/verdaccio/monorepo/master?path=tools%2Feslint-plugin-verdaccio)
[![DevDependencies](https://img.shields.io/david/dev/verdaccio/monorepo?path=tools%2Feslint-plugin-verdaccio)](https://david-dm.org/verdaccio/monorepo/master?path=tools%2Feslint-plugin-verdaccio&type=dev)
[![MIT](https://img.shields.io/github/license/verdaccio/monorepo.svg)](./LICENSE)

verdaccio code guidelines

## Installation

You"ll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-verdaccio`:

```
$ npm install eslint-plugin-verdaccio --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-verdaccio` globally.

## Usage

Add `verdaccio` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "verdaccio"
    ]
}
```

Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "verdaccio/jsx-spread": "error",
        "verdaccio/jsx-no-style": "error",
        "verdaccio/jsx-no-classname-object": "error"
    }
}
```

## Supported Rules

* [verdaccio/jsx-spread](docs/rules/jsx-spread.md): Enforce don"t use of spread operators with JSX components.
* [verdaccio/jsx-no-style](docs/rules/jsx-no-style.md): Enforce don"t use of style attribute with JSX components.
* [verdaccio/jsx-no-classname-object](docs/rules/jsx-no-classname-object.md): Enforce don"t use of nested objects on className attribute with JSX components.

## License

This is an open source project under [MIT license](./LICENSE)
