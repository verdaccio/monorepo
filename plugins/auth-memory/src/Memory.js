// @flow

import type { Callback, PackageAccess, IPluginAuth, RemoteUser, Logger } from '@verdaccio/types';
import type { VerdaccioMemoryConfig, Users, UserMemory } from '../types';

import httpError from 'http-errors';

export default class Memory implements IPluginAuth {
  _logger: Logger;
  _users: Users;
  _config: {};
  _app_config: any;

  constructor(config: VerdaccioMemoryConfig, appOptions: any) {
    this._users = appOptions.users || {};
    this._config = config;
    this._logger = appOptions.logger;
    this._app_config = appOptions.config;
  }

  authenticate(user: string, password: string, done: Callback) {
    const userCredentials = this._users[user];

    if (!userCredentials) {
      return done(null, false);
    }

    if (password !== userCredentials.password) {
      const err = httpError(401, "i don't like your password");

      return done(err);
    }

    // authentication succeeded!
    // return all usergroups this user has access to;
    return done(null, [user]);
  }

  adduser(user: string, password: string, done: Callback) {
    if (this._users[user]) {
      return done(null, true);
    }

    if (this._app_config.max_users) {
      if (Object.keys(this._users).length >= this._app_config.max_users) {
        const err = httpError(409, 'maximum amount of users reached');

        return done(err);
      }
    }

    this._users[user] = { name: user, password: password };

    done(null, user);
  }

  changePassword(username: string, password: string, newPassword: string, cb: Callback) {
    const user: UserMemory = this._users[username];

    if (user && user.password === password) {
      user.password = newPassword;
      this._users[username] = user;

      cb(null, user);
    } else {
      const err = httpError(404, 'user not found');

      return cb(err);
    }
  }

  allow_access(user: RemoteUser, pkg: PackageAccess, cb: Callback) {
    if (pkg.access.includes('$all') || pkg.access.includes('$anonymous')) {
      return cb(null, true);
    }

    if (!user.name) {
      const err = httpError(403, 'not allowed to access package');
      return cb(err);
    }

    if (pkg.access.includes(user.name) || pkg.access.includes('$authenticated')) {
      return cb(null, true);
    }

    const err = httpError(403, 'not allowed to access package');

    return cb(err);
  }

  allow_publish(user: RemoteUser, pkg: PackageAccess, cb: Callback) {
    if (pkg.publish.includes('$all') || pkg.publish.includes('$anonymous')) {
      return cb(null, true);
    }

    if (!user.name) {
      const err = httpError(403, 'not allowed to publish package');

      return cb(err);
    }

    if (pkg.publish.includes(user.name) || pkg.publish.includes('$authenticated')) {
      return cb(null, true);
    }

    const err = httpError(403, 'not allowed to publish package');

    return cb(err);
  }
}
