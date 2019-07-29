# Contributing to Verdaccio Monorepo

We are happy that you wish to contribute to this project. For that reason, we present you this guide.

All you need to know is in this guide. If you need to know more information, you can ask in our [chat](#chat).

## Contents

- [Contents](#contents)
- [How Can I Contribute?](#how-can-i-contribute)
- [Reporting Bugs](#reporting-bugs)
  - [Issue Search](#issue-search)
  - [How to Report](#how-to-report)
  - [Chat](#chat)
- [Requesting Features](#requesting-features)
  - [Submitting a Pull Request](#submitting-a-pull-request)
  - [Commiting Changes](#commiting-changes)
- [Development](#development)
  - [Project Structure](#project-structure)
  - [Installing Tools](#installing-tools)
  - [Interesting Commands](#interesting-commands)
  - [Creating Packages](#creating-packages)
  - [Importing Packages](#importing-packages)
  - [Managing Dependencies](#managing-dependencies)
- [Using VSCode Remote Development Environment](#using-vscode-remote-development-environment)

## How Can I Contribute?

There are different ways to contribute, each with a different level of involvement and technical knowledge, such as:

- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [Development](#development)

**Please read this document carefully. It will help maintainers and readers in solving your issue(s), evaluating your features request(s), etc.**

## Reporting Bugs

We welcome clear and detailed bug reports.

**Bugs are considered features that are not working as described in the documentation.**

If you have found a bug, please file a report in our [issue tracker](https://github.com/verdaccio/monorepo/issues).

### Issue Search

Before opening a new issue, please, search if someone opened an issue describing the same behaviour.

We will have them labeled for easy look-up.

If one exists, up-vote it (using GitHub reactions) or add additional details in the existing issue to have better knowledge of the problem(s).

Also, take care of checking closed issues. If there is one, the problem could be resolved in the development branch or it doesn't seem to apply. In that case, add details and we can check it again.

### How to Report

First of all, we have templates to make easier to report a bug. Read the instructions carefully to understand how we can collaborate.

Please, provide as much detail as you can. They will give us more context in the problem(s) and it will be easier to find them and fix.

If there is sensitive data, like paths, hosts or package names, feel free to change them. But try to include such info could be really helpful.

### Chat

If you have any questions, please ask them via Discord before open an issue.

Use [`#questions`](https://discord.gg/BVyg4F6) and [`#features`](https://discord.gg/Z5hnpfv) channels and provide as much information as you can, like opening an issue.

In our chat you can get help faster than filling issues.

## Requesting Features

New features are welcome. It's important to analyze if the idea fits within the scope and vision of the project.

Furthermore, detail your request, ensuring the context and use case, using the templates available.

### Commiting Changes

#### Before Commit

Before commiting, **you must ensure there are no linting errors and tests are passing**. This checks also takes place in our CI tooling but will delay our development if you do not review first.

You can perform next commands to review them:

| Lint        | Tests       |
| ----------- | ----------- |
| `yarn lint` | `yarn test` |

Then, and only then, you can create your pull request.

#### Commit Guidelines

We write commit messages following [Conventional Commits Specification](https://www.conventionalcommits.org/) to automate semantic versioning of the packages and _CHANGELOG_ generation.

As every commit affects all the packages in the monorepo, we must specify the folder name of the package in the scope field to generate each `CHANGELOG` correctly, unless the change affects several packages at the same time. Some examples of use are:

`feat(babel-preset): add basic config`

`fix(eslint-config): remove unnecessary comment`

`chore(streams): update documentation`

`chore: update devDependencies`

Commits types such as `docs:`, `style:`, `refactor:`, `perf:`, `test:` and `chore:` are valid but have no effect on versioning. It would be great if you use them.

When you perform the commit, [Husky](https://github.com/typicode/husky) and [Commitlint](https://commitlint.js.org) will check the commit message format.

**Pull Requests that contains commits that do not follow these guidelines will not be merged.**

### Submitting a Pull Request

The following are the steps you should follow when creating a pull request. Subsequent pull requests only need to follow step 3 and beyond.

1. Fork the repository on GitHub
2. Clone the forked repository to your machine
3. Make your changes and commit them to your local repository
4. Rebase and push your commits to your GitHub remote fork/repository
5. Issue a Pull Request to the official repository
6. Your Pull Request is reviewed by maintainers and merged into the repository

**NOTE**: While there are other ways to accomplish the steps using other tools,
the examples here will assume most actions will be performed via `git` on
command line.

For more information on maintaining a fork, please see the GitHub Help article
titled [Fork a Repo](https://help.github.com/articles/fork-a-repo/), and
information on [branch rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing).

## Development

This project is managed by [Lerna](https://lerna.js.org/) and [Yarn Workspaces](https://yarnpkg.com/lang/en/docs/workspaces/). These concepts are a little hard to understand, but we are working to facilitate you that work as much as we can.

To have a better understanding about how Lerna and Yarn Workspaces work together, read this great [article](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/).

#### Lerna

Lerna is a tool to manage several Javascript projects with multiple packages, called _monorepos_.

When you have many Javascript projects separated in multiple repositories that have common parts like scripts, devDependencies, tools, etc, you have to maintain and make the same changes in several projects at the same time, e.g, when a devDependency, like ESLint, release a new version.

Unifying those packages in a monorepo architecture allows you to have only one repository and make changes in several projects at the same time, perform scripts like test or lint with only one command, and more. This gives faster and easier maintenance.

#### Yarn Workspaces

Yarn Workspaces is way to setup packages architecture, simplifying dependencies installation, package linking, etc.

Using Yarn Workspaces, all types of dependencies will be installed in a root _node_modules_ (wherever they are defined). Only one lockfile will control all dependencies from the projects in the workspace.

Also, if a package from the workspace have dependency on another package from the same workspace, they will be linked automatically. This is better mechanism than normal linking because this only affects workspace and not the whole system.

### Project Structure

This project is separated into three types of packages, depending on the behaviour:

- _core_: main parts of the Verdaccio architecture
- _plugins_: developed to extend or change the main behaviour of Verdaccio
- _tools_: packages to improve and maintain a robust codebase for all of our projects

Inside each folder, there are several packages to keep them easy.

### Installing Tools

First of all, you need [Yarn](https://yarnpkg.com) to install all the dependencies from the project (using Yarn Workspaces as described above).

In case you have it installed, you can skip this step. You can install following the method you prefer from their official [docs](https://yarnpkg.com/en/docs/install#debian-stable).

After that, you only need to execute the installation command. We prefer to use `--frozen-lockfile` option to install the same dependency tree we have to avoid the typical _"in my machine works"_.

```bash
yarn install --frozen-lockfile
```

There is a special note, we do not need to run `lerna bootstrap` to install projects dependencies and link together, because Yarn Workspaces do that when installing.

After this, you can move into the package folder you desire and work like a normal package with their own scripts, or stay in the root folder and run the scripts for all the packages.

Optionally, you would like to install Lerna globally. You can do this with the package manager you prefer:

| npm                          | yarn                    | pnpm                          |
| ---------------------------- | ----------------------- | ----------------------------- |
| `npm install --global lerna` | `yarn global add lerna` | `pnpm install --global lerna` |

### Interesting Commands

There are some interesting commands you would need to know when working with Lerna and Yarn Workspaces.

#### Lerna

The main commands you need to know are:

- `lerna bootstrap`: install root project and packages dependencies. Also, it will link packages located in the monorepo. We do not need this command as it's managed by Yarn.
- `lerna run <script>`: run the script specified in packages that have that script defined, e.g, `lerna run test` will pass tests on all the packages that contains tests.
- `lerna exec <script>`: run script on all packages unless you ignore packages with `--ignore=<pkg1>,<pkg2>` or specify in which it should execute with `--scope=<pkg3>,<pkg4>`.
- `lerna clean`: clean _node_modules_ from root and all packages.
- `lerna create <name> <location>`: create a new package named name in location specified (it could be `core`, `plugins` or `tools`).
- `lerna import <source_package> --dest=<location>`: import an external package from _source_package_ in the location specified (it could be `core`, `plugins` or `tools`).

There are more commands and options well explained you can see in their [GitHub repository](https://github.com/lerna/lerna).

#### Yarn Workspaces

We delegate high-level managing commands to Lerna, but there are some commands you should know:

- `yarn workspaces info`: show info and relations between packages in the workspace, and if a package dependency from the workspace is not updated.
- `yarn workspace <package> <command>`: run command in the package specified.

For more information, take a look at [`yarn workspace`](https://yarnpkg.com/lang/en/docs/cli/workspace) and [`yarn workspaces`](https://yarnpkg.com/en/docs/cli/workspaces) CLI docs.

### Creating Packages

To create a new package, you can create with:

`lerna create <package_name> <scope_location>`

And then, follow the next steps in the package recently created:

1. Add MIT LICENSE file (using`npx license -o Verdaccio mit > LICENSE`) and complete README.
2. Add the necessary tools files the project will require like `.gitignore`, `.eslintrc.json`, `tsconfig.json` or `.babelrc`. You can see other packages in the monorepo to know which tools are we using.
3. Add all the necessary stuff in the `package.json`, like scripts or dependencies, taking care of script naming like `lint`, `lint:stage` or `test`.
4. In case the package is scoped (like `@verdaccio/streams`), add next block in `package.json`:
   ```json
   "publishConfig": {
     "access": "public"
   }
   ```
5. Flat those `devDependencies` that aren't part of the monorepo to the root `package.json`, like `in-publish`, but not `devDependencies` like `@verdaccio/eslint-config`.
6. Ensure everything is working correctly, both in package and with root scripts.

### Importing Packages

The steps for importing and creating packages differ a little bit. First, you need to have cloned the project to import in your local filesystem and then you need to import all the project git tree using next command:

`lerna import <project_location> --dest=<scope_location>`

If this process fails because there were merge conflicts, you must add `--flatten` option to the command above to flat history.

Later, follow the next steps in the package recently imported:

1. Remove unnecessary stuff, like CI settings, GitHub stuff, CONTRIBUTING, unnecessary things from .gitignore, etc.
2. Update LICENSE year.
3. Follow the steps described in [Creating Packages](#creating-packages) to complete the flow.

### Managing Dependencies

Every package contains their own dependencies and devDependencies. We need to understand how to manage them, because each type have their own restrictions.

#### Dependencies

All packages must contain their own dependencies defined in their `package.json` and never should be flattened.

If a package dependencies are flattened, the user of that package will not know what dependencies needs to install, so the package could be broken. So never flatten them.

Also, we have decided to fix versions of all dependencies to manage them manually.

#### Development Dependencies

There are two ways for defining devDependencies.

First, we prefer to define devDependencies in root `package.json` to share them with every package in the monorepo, even when the package is used only by one package. This way, all packages share the same devDependencies and we can manage them easily.

Second, if a package requires a specific devDependency version of a package defined in the root `package.json`, we must define that in the `package.json` located under the package we want.

An example of this could be next: We have a monorepo with packages `foo` and `bar`. We use `eslint@5.16.0` for all, so in `<root>/package.json` we define:

```json
"devDependencies": {
    "eslint": "^5.16.0
}
```

But now we want `bar` package use a new release of that package. So we can keep `<root>/package.json` as before and define next block in `<root>/packages/bar/package.json`:

```json
"devDependencies": {
    "eslint": "^6.0.0
}
```

This way, we will have both versions installed but each package use what they require.

Also, it's important to note that we prefer to use caret (`^`) when managing `devDependencies`. As they are used only for developing, we don't need to take as care as with package `dependencies`.

## Using VSCode Remote Development Environment

_This section is optional_

For those inexperienced developer or who only want to make some simple changes (like improving documentation) or who only want to program in the same environment we use to develop, we want to help you with an isolated development environment.

VSCode Remote Development Environment allows us to define a container where you will have the source code, your SSH credentials and a set of plugins and settings we think you would need to work.

The requirements and installation process is defined in [VSCode docs](https://code.visualstudio.com/docs/remote/containers#_getting-started). We make a summary you will need:

- [Docker](https://www.docker.com/)
- [VSCode](https://code.visualstudio.com/)
- [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) for VSCode
- _(Optional)_ [Remote Development extension pack](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) for VSCode (includes the extension _Remote - Containers_)

With everything configured, you only need to open Command Palette and select `Remote-Containers: Open Folder in Container` option, and select the root folder of this project in your filesystem, or simply `Remove-Containers: Reopen Folder in Container`.

It will reload VSCode and start the container with the configuration specified. You need to wait a little bit until it starts completely.

To exit the container, you only need to open Command Palette again and select `Remote-Containers: Reopen Folder Locally`.
