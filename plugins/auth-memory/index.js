'use strict';

function Memory(config, appOptions) {
    const self = Object.create(Memory.prototype);

    self._users = config.users || {};
    self._config = config;
    self._logger = appOptions.logger;
    self._app_config = appOptions.config;

    return self
}

Memory.prototype.authenticate = function (user, password, done) {
    var self = this
    var userCredentials = self._users[user];

    if (!userCredentials) {
      return done(null, false);
    }


    if (password !== userCredentials.password) {
      var err = Error('i don\'t like your password');

      err.status = 401;
      return done(err);
    }

    // authentication succeeded!
    // return all usergroups this user has access to;
    return done(null, [user])

};

Memory.prototype.adduser = function (user, password, done) {
    var self = this;

    if (this._users[user]) {
      return done(null, true);
    }

    if (self._app_config.max_users) {
      if (Object.keys(this._users).length >= self._app_config.max_users) {
        var err = Error('maximum amount of users reached');

        err.status = 409;
        return done(err);
      }
    }

    this._users[user] = {name: user, password: password};

    done(null, user);
};

Memory.prototype.allow_access = function(user, pkg, cb) {
  if(((pkg.access.includes('$all') || pkg.access.includes('$anonymous') ))) {
    return cb(null, true);
  }

  if (!user.name) {
    const err = Error('not allowed to access package');
    err.status = 403;
    return cb(err);
  }

  if (pkg.access.includes(user.name) || pkg.access.includes('$authenticated')) {
    return cb(null, true);
  }

  const err = Error('not allowed to access package');
  err.status = 403;
  return cb(err);
};

Memory.prototype.allow_publish = function(user, pkg, cb) {

  if ((pkg.publish.includes('$all') || pkg.publish.includes('$anonymous') )) {
    return cb(null, true);
  }

  if (!user.name) {
    const err = Error('not allowed to publish package');
    err.status = 403;
    return cb(err);
  }

  if (pkg.publish.includes(user.name) || pkg.publish.includes('$authenticated')) {
    return cb(null, true);
  }

  const err = Error('not allowed to publish package');
  err.status = 403;
  return cb(err);
};

module.exports = Memory;
