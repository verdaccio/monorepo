# Contributing

This project is managed in a Monorepo structure. We decided to use Lerna with Yarn Workspaces for this purpose. If you don't know what a monorepo is, we recommend you to read the core concepts described in [this article](https://medium.com/@maoberlehner/monorepos-in-the-wild-33c6eb246cb9) and [Lerna docs](https://lernajs.io/).

## Investigate

First of all, we encourage you to search issues and find if it is already opened. If not, open a new one with a detailed description. With more details we can help you better.

If you are not sure about the problem, you can talk with us at Discord, in our [general](https://discord.gg/6s5CBRu) or [question channel](https://discord.gg/BVyg4F6).

## Development

To start developing, you should perform some steps to prepare the packages:

1.  Install monorepo dependencies. We use [Yarn](https://yarnpkg.com) as package manager. We recommend the use of `--frozen-lockfile` option to keep the same dependency tree as we have.
    ```shell
    yarn install --frozen-lockfile
    ```
2.  Move to package directory to work normally (e.g, pass tests with `yarn test`)

## Committing changes

We follow [Conventional Commits Specification](https://conventionalcommits.org/) to generate changelogs automatically. Because every commit affects every package in the monorepo, we must specify the package folder in the scope field to generate each changelog correctly. Some examples of use is:
```shell
feat(babel-preset): add basic config
```
```shell
fix(eslint-config): remove unnecessary comment
```
```shell
chore(eslint-config): update some deps
```
