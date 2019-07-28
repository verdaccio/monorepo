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

### Project Structure

### Installing Tools

### Interesting Commands

### Creating Packages

### Importing Packages

### Managing Dependencies

## Using VSCode Development Environment

_This section is optional_
