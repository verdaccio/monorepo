[![verdaccio (latest)](https://img.shields.io/npm/v/verdaccio-htpasswd/latest.svg)](https://www.npmjs.com/package/verdaccio-htpasswd)
[![Known Vulnerabilities](https://snyk.io/test/github/verdaccio/verdaccio-htpasswd/badge.svg?targetFile=package.json)](https://snyk.io/test/github/verdaccio/verdaccio-htpasswd?targetFile=package.json)
[![CircleCI](https://circleci.com/gh/verdaccio/verdaccio-htpasswd.svg?style=svg)](https://circleci.com/gh/ayusharma/verdaccio-htpasswd) [![codecov](https://codecov.io/gh/ayusharma/verdaccio-htpasswd/branch/master/graph/badge.svg)](https://codecov.io/gh/ayusharma/verdaccio-htpasswd)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fverdaccio%2Fverdaccio-htpasswd.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fverdaccio%2Fverdaccio-htpasswd?ref=badge_shield)
[![backers](https://opencollective.com/verdaccio/tiers/backer/badge.svg?label=Backer&color=brightgreen)](https://opencollective.com/verdaccio)
[![discord](https://img.shields.io/discord/388674437219745793.svg)](http://chat.verdaccio.org/)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
[![node](https://img.shields.io/node/v/verdaccio-htpasswd/latest.svg)](https://www.npmjs.com/package/verdaccio-htpasswd)

# Verdaccio Module For User Auth Via Htpasswd

`verdaccio-htpasswd` is a default authentication plugin for the [Verdaccio](https://github.com/verdaccio/verdaccio).

> Plugin only valid for verdaccio v5.x

## Install

As simple as running:

    $ npm install -g verdaccio-htpasswd

## Configure

    auth:
        htpasswd:
            file: ./htpasswd
            # Maximum amount of users allowed to register, defaults to "+infinity".
            # You can set this to -1 to disable registration.
            #max_users: 1000
            # Hash algorithm, possible options are: "bcrypt", "md5", "sha1", "crypt".
            # Default algorithm is crypt.
            #algorithm: bcrypt
            # Rounds number for "bcrypt", will be ignored for other algorithms.
            # Setting this value higher will result in password verification taking longer.
            #rounds: 10
            # Log a warning if the password takes more then this duration in milliseconds to verify.
            #slow_verify_ms: 200

### Bcrypt rounds

It is important to note that when using the default `bcrypt` algorithm and setting
the `rounds` configuration value to a higher number then the default of `10`, that
verification of a user password can cause significantly increased CPU usage and
additional latency in processing requests.

If your Verdaccio instance handles a large number of authenticated requests using
username and password for authentication, the `rounds` configuration value may need
to be decreased to prevent excessive CPU usage and request latency.

Also note that setting the `rounds` configuration value to a value that is too small
increases the risk of successful brute force attack. Auth0 has a
[blog article](https://auth0.com/blog/hashing-in-action-understanding-bcrypt)
that provides an overview of how `bcrypt` hashing works and some best practices.

## Logging In

To log in using NPM, run:

```
    npm adduser --registry  https://your.registry.local
```

## Generate htpasswd username/password combination

If you wish to handle access control using htpasswd file, you can generate
username/password combination form
[here](http://www.htaccesstools.com/htpasswd-generator/) and add it to htpasswd
file.

## How does it work?

The htpasswd file contains rows corresponding to a pair of username and password
separated with a colon character. The password is encrypted using the UNIX system's
`crypt` method and may use MD5 or SHA1.

#### Useful Links

- [Plugin Development](http://www.verdaccio.org/docs/en/dev-plugins.html)
- [List of Plugins](http://www.verdaccio.org/docs/en/plugins.html)

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fverdaccio%2Fverdaccio-htpasswd.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fverdaccio%2Fverdaccio-htpasswd?ref=badge_large)
