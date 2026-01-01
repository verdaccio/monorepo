import createDebug from 'debug';

import { cryptoUtils, errorUtils } from '@verdaccio/core';
import {
  Callback,
  Config,
  IPluginAuth,
  Logger,
  PackageAccess,
  PluginOptions,
  RemoteUser,
} from '@verdaccio/legacy-types';

const { getConflict, getForbidden, getNotFound, getUnauthorized } = errorUtils;

const debug = createDebug('verdaccio:plugin:memory');

export interface UserMemory {
  name: string;
  password: string;
}

export interface Users {
  [key: string]: UserMemory;
}

export interface VerdaccioMemoryConfig extends Config {
  max_users?: number;
  users: Users;
}

export default class Memory implements IPluginAuth<VerdaccioMemoryConfig> {
  public _logger: Logger;
  public _users: Users;
  public _config: {};
  public _app_config: VerdaccioMemoryConfig;

  public constructor(
    config: VerdaccioMemoryConfig,
    appOptions: PluginOptions<VerdaccioMemoryConfig>
  ) {
    debug('init memory auth plugin with config: %o', config);
    this._users = config.users || {};
    this._config = config;
    this._logger = appOptions.logger;
    this._app_config = appOptions.config;
  }

  public authenticate(user: string, password: string, done: Callback): void {
    debug('authenticate user: %s', user);
    debug('authenticate password: %s', cryptoUtils.mask(password, 5));
    const userCredentials = this._users[user];

    if (!userCredentials) {
      debug('user %s does not exist', user);
      this._logger.debug({ user }, 'user @{user} does not exist');
      return done(null, false);
    }

    if (password !== userCredentials.password) {
      debug('password invalid for user %s', user);
      const err = getUnauthorized("i don't like your password");
      this._logger.info({ user }, 'password invalid for: @{user}');

      return done(err);
    }

    // authentication succeeded!
    // return all usergroups this user has access to;
    this._logger.info({ user }, 'authentication succeeded for @{user}');
    return done(null, [user]);
  }

  public adduser(user: string, password: string, done: Callback): void {
    debug('add user: %s', user);
    if (this._users[user]) {
      this._logger.debug({ user }, 'user @{user} already exist');
      return done(null, true);
    }

    if (this._app_config.max_users) {
      debug('max users configured: %d', this._app_config.max_users);
      if (Object.keys(this._users).length >= this._app_config.max_users) {
        const err = getConflict('maximum amount of users reached');

        return done(err);
      }
    }

    this._users[user] = { name: user, password: password };

    this._logger.info({ user }, 'user added succeeded for @{user}');
    done(null, user);
  }

  public changePassword(
    username: string,
    password: string,
    newPassword: string,
    cb: Callback
  ): void {
    debug('change password for user: %s', username);
    const user: UserMemory = this._users[username];
    this._logger.debug({ user: username }, 'user: @{user} init change password');

    if (user && user.password === password) {
      user.password = newPassword;
      this._users[username] = user;

      this._logger.info({ user }, 'user changed password succeeded for @{user}');
      cb(null, user);
    } else {
      const err = getNotFound('user not found');
      this._logger.debug({ user: username }, 'change password user  @{user} not found');

      return cb(err);
    }
  }

  public allow_access(user: RemoteUser, pkg: PackageAccess, cb: Callback): void {
    if (
      (pkg.access && pkg.access.includes('$all')) ||
      (pkg.access && pkg.access.includes('$anonymous'))
    ) {
      this._logger.debug({ user: user.name }, 'user: @{user} has been granted access');

      return cb(null, true);
    }

    if (!user.name) {
      debug('user is not authenticated, cannot access package');
      const err = getForbidden('not allowed to access package');
      this._logger.debug({ user: user.name }, 'user: @{user} not allowed to access package');
      return cb(err);
    }

    if (
      (pkg.access && pkg.access.includes(user.name)) ||
      (pkg.access && pkg.access.includes('$authenticated'))
    ) {
      debug('user %s has been granted access to package', user.name);
      this._logger.debug({ user: user.name }, 'user: @{user} has been granted access');
      return cb(null, true);
    }

    const err = getForbidden('not allowed to access package');

    debug('user %s not allowed to access package', user.name);
    this._logger.debug({ user: user.name }, 'user: @{user} not allowed to access package');
    return cb(err);
  }

  public allow_publish(user: RemoteUser, pkg: PackageAccess, cb: Callback): void {
    debug('allow publish for user: %s', user.name);
    if (
      (pkg.publish && pkg.publish.includes('$all')) ||
      (pkg.publish && pkg.publish.includes('$anonymous'))
    ) {
      this._logger.debug({ user: user.name }, 'user: @{user} has been granted to publish');
      return cb(null, true);
    }

    if (!user.name) {
      debug('user is not authenticated, cannot publish package');
      const err = getForbidden('not allowed to publish package');
      this._logger.debug({ user: user.name }, 'user: @{user} not allowed to publish package');

      return cb(err);
    }

    if (
      (pkg.publish && pkg.publish.includes(user.name)) ||
      (pkg.publish && pkg.publish.includes('$authenticated'))
    ) {
      debug('user %s has been granted to publish package', user.name);
      return cb(null, true);
    }

    const err = getForbidden('not allowed to publish package');
    debug('user %s not allowed to publish package', user.name);
    this._logger.debug({ user: user.name }, 'user: @{user} not allowed to publish package');

    return cb(err);
  }
}
