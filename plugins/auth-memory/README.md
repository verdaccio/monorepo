# verdaccio-auth-memory

This verdaccio auth plugin keeps the users in a memory plain object.
This means all sessions and users will disappear when you restart the verdaccio server.

If you want to use this piece of software, do it at your own risk. **This plugin is being used for unit testing**.

## Installation

```sh
$ npm install verdaccio
$ npm install verdaccio-auth-memory-memory
```

## Config

Add to your `config.yaml`:

```yaml
auth:
  memory: true
```

## For plugin writers

It's called as:

```js
require('verdaccio-auth-memory')(config, stuff)
```

Where:

 - config - module's own config
 - stuff - collection of different internal verdaccio objects
   - stuff.config - main config
   - stuff.logger - logger

This should export two functions:

 - `adduser(user, password, cb)`

   It should respond with:
    - `cb(err)` in case of an error (error will be returned to user)
    - `cb(null, false)` in case registration is disabled (next auth plugin will be executed)
    - `cb(null, true)` in case user registered successfully

   It's useful to set `err.status` property to set http status code (e.g. `err.status = 403`).

 - `authenticate(user, password, cb)`

   It should respond with:
    - `cb(err)` in case of a fatal error (error will be returned to user, keep those rare)
    - `cb(null, false)` in case user not authenticated (next auth plugin will be executed)
    - `cb(null, [groups])` in case user is authenticated

   Groups is an array of all users/usergroups this user has access to. You should probably include username itself here.


