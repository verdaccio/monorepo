# @verdaccio/active-directory

Active Directory authentication plugin for Verdaccio

## Installation

```bash
npm install -g @verdaccio/active-directory
```

## Config

This settings can be set in `config.yaml`. All fields are mandatory except `groupName`, which is optional, to add security group(s). Also, this optional field can be a single string or a list of strings. Take care that, when defining `groupName` key, the user that will be authenticating must be in, at least, one of the groups defined, to authenticate successfully.

```yaml
auth:
  activedirectory:
    url: "ldap://localhost"
    baseDN: 'dc=local,dc=host'
    domainSuffix: 'local.host'
    # groupName: 'singleGroup' # optional, single group syntax
    # groupName:               # optional, multiple groups syntax
    #   - 'group1'
    #   - 'group2'
```

## License

@verdaccio/active-directory is an open source project with [MIT license](LICENSE)
