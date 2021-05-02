# Contributing to Verdaccio Monorepo

We are happy that you wish to contribute to this project. For that reason, we present you this guide.

All you need to know is in this guide. If you need to know more information, you can ask in our [chat](#chat).

## How Can I Contribute?

There are different ways to contribute, each with a different level of involvement and technical knowledge, such as:

- [Reporting Bugs](#reporting-bugs)

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

In our chat you can get help faster than filling issues.

## Requesting Features

> Not allowed on this repository anymore, check `verdaccio/verdaccio` master branch.

### Submitting a Pull Request

The following are the steps you should follow when creating a pull request.
Subsequent pull requests only need to follow step 3 and beyond.

1. Fork the repository on GitHub
2. Clone the forked repository to your machine
3. Make your changes and commit them to your local repository
4. Rebase and push your commits to your GitHub remote fork/repository
5. Issue a Pull Request to the official repository
6. Your Pull Request is reviewed by a committer and merged into the repository

**NOTE**: While there are other ways to accomplish the steps using other tools,
the examples here will assume most actions will be performed via `git` on
command line.

For more information on maintaining a fork, please see the GitHub Help article
titled [Fork a Repo](https://help.github.com/articles/fork-a-repo/), and
information on [rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing).

### Make Changes and Commit

#### Caveats

Feel free to commit as much times you want in your branch, but keep on mind on this repository we `git squash` on merge by default, any other way is forbidden since we intent to have a clean git history.

#### Before Commit

Before committing, **you must ensure there are no linting errors and
all tests pass.**

To do this, run these commands before create the PR:

```bash
pnpm lint
pnpm format
pnpm build
pnpm test
```

> note: eslint and formatting are running separately, keep code formatting before push.

All good? perfect, then you should create the pull request.

#### Commit Guidelines

For example:

- `feat: A new feature`
- `fix: A bug fix`

A commit of the type feat introduces a new feature to the codebase
(this correlates with MINOR in semantic versioning).

e.g.:

```
feat: xxxxxxxxxx
```

A commit of the type fix patches a bug in your codebase (this correlates with PATCH in semantic versioning).

e.g.:

```
fix: xxxxxxxxxxx
```

Commits types such as as `docs:`,`style:`,`refactor:`,`perf:`,`test:`
and `chore:` are valid but have no effect on versioning. **It would be great if you use them.**

All commits message are going to be validated when they are created using husky hooks.

> Please, try to provide one single commit to help a clean and easy merge process.

### Adding a changeset

We use [changesets](https://github.com/atlassian/changesets) in order to generate a detailed Changelog as possible.

Add a changeset with your Pull Request is essential if you want your contribution get merged (unless is a change that does not affect library functionality, eg: typo, docs, readme, add additional test or linting code). To create a changeset please run:

```
pnpm changeset
```

Then select the packages you want to include in your changeset navigating through them and press the spacebar to check it, on finish press enter to move to the next step.

```
🦋  Which packages would you like to include? …
✔ changed packages
 changed packages
  ✔ @verdaccio/api
  ✔ @verdaccio/auth
  ✔ @verdaccio/cli
  ✔ @verdaccio/config
  ✔ @verdaccio/commons-api
```

The next question would be if you want a _major bump_, this is not the usual scenario, most likely would be a patch, in that case press enter 2 times (to skip minor)

```
🦋  Which packages should have a major bump? …
✔ all packages
  ✔ @verdaccio/config@5.0.0-alpha.0
```

Once the desired bump you need, the CLI will ask for a summary, here you have fully freedom what to include.

```
🦋  Which packages would you like to include? · @verdaccio/config
🦋  Which packages should have a major bump? · No items were selected
🦋  Which packages should have a minor bump? · No items were selected
🦋  The following packages will be patch bumped:
🦋  @verdaccio/config@5.0.0-alpha.0
🦋  Please enter a summary for this change (this will be in the changelogs). Submit empty line to open external editor
🦋  Summary ›
```

The last step is confirm your changeset or abort the operation.

```
🦋  Is this your desired changeset? (Y/n) · true
🦋  Changeset added! - you can now commit it
🦋
🦋  If you want to modify or expand on the changeset summary, you can find it here
🦋  info /Users/user/verdaccio.clone/.changeset/light-scissors-smell.md
```

Once the changeset is added (all will have an unique name) you can freely edit using markdown, adding additional information, code snippets or what you consider is relevant.

All that information will be part of the **changelog**, be concise but informative. It is considered a good option to add your nickname and GitHub link to your profile.

**PRs that do not follow the commit message guidelines will not be merged.**
