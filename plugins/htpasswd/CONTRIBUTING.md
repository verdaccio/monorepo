# Contributing

We are happy you wish to contribute this plugin, for that reason we want to board you with this guide.

## Reporting a Bug

We welcome clear bug reports. If you've found a bug in Verdaccio that isn't a security risk, please file a report in our [issue tracker](https://github.com/verdaccio/verdaccio-htpasswd/issues). Before you file your issue, search to see if it has already been reported. If so, up-vote (using GitHub reactions) or add additional helpful details to the existing issue to show that it's affecting multiple people.

### Check if there's a simple solution in the website.

Some of the most popular topics can be found in our website(http://www.verdaccio.org/docs/en/installation.html)

### Questions & Chat

We have a chat as **#questions/#development** channels at  [gitter](https://gitter.im/verdaccio/).

### Using the issue tracker

The issue tracker is a channel were mostly users/developers post.

#### I want to report a bug

We considere a bug a feature that is not working as is described in the documentation. Before reporting a bug follow the next steps:

1. Use the GitHub issue search — check if the issue has already been reported.

2. Check if the issue has been fixed — try to reproduce it using the latest master or development branch in the repository.

Verdaccio still does not support all npm commands due either in the initial design were not considered important or nobody has request it yet.

## Request Features

A new feature is always welcome, thus, analyse whether your idea fits in the scope of the project and elaborate your request providing enough context, for instance:

* A wide description the advantages of your request.
* It's compatible with `npm` and `yarn`?
* You might implement your feature and provide a forked repository as example.
* Whatever you have on mind 🤓.

### Submitting a Pull Request
The following are the general steps you should follow in creating a pull request.  Subsequent pull requests only need
to follow step 3 and beyond:

1. Fork the repository on GitHub
2. Clone the forked repository to your machine
3. Make your changes and commit them to your local repository
4. Rebase and push your commits to your GitHub remote fork/repository
5. Issue a Pull Request to the official repository
6. Your Pull Request is reviewed by a committer and merged into the repository

*Note*: While there are other ways to accomplish the steps using other tools, the examples here will assume the most
actions will be performed via the `git` command line.

For more information on maintaining a fork, please see the GitHub Help article [Fork a Repo](https://help.github.com/articles/fork-a-repo/) and information on
[rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing) from git.

### Make Changes and Commit

#### Before commit

At this point you have ready your changes, your new feature it's ready to be shipped, but, to avoid delays to merge, please be aware the build must past.

Before commit, run the test command:

```bash
yarn test
```
It won't have **eslint** errors and **all test must past**. Then, and only then, you should push and ship your **PR**.

#### Git Commit Guidelines

We follow the [conventional commit messages](https://conventionalcommits.org/) convention in order to automate Changelog generation and auto semantic versioning based on commit messages.

* feat: A new feature
* fix: A bug fix

A commit of the type feat introduces a new feature to the codebase (this correlates with MINOR in semantic versioning).

eg:
```
feat: xxxxxxxxxx
````

A commit of the type fix patches a bug in your codebase (this correlates with PATCH in semantic versioning).

eg:
```
fix: xxxxxxxxxx
````

Commits types as `docs:`,`style:`,`refactor:`,`perf:`,`test:` and `chore:` are valid but has no effect on versioning, but, it would be great if you use them.

Use `npm run commitmsg` to check your commit message.

> All PR that does not follow the commit guidelines will be hold until messages are fixed.

## Update Test

Any change in the sour code **must to include test update**, if you need support about how test works, please [refers to the following guide](https://github.com/verdaccio/verdaccio/wiki/Running-and-Debugging-tests). Please include test whether is a new feature, otherwise will be hold and never be merged.

> Documentation, website, build, deployment, assets  or flow types are excluded in this section