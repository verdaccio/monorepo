# @verdaccio/eslint-config

Sharable Eslint and Prettier configuration for Verdaccio projects

## Usage

To import the global settings in your `.eslintrc` file, you have to extends using:
```json
{
  "extends": ["@verdaccio"]
}
```

But we have several different configuration based on project nature.
To use them, you have to specify the configuration file you want to extend, like:
```json
{
  "extends": ["@verdaccio/eslint-config/ui"]
}
```

## License

@verdaccio/eslint-config is a open source project with [MIT license](LICENSE)
