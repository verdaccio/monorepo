import { PluginOptions, Callback, PackageAccess, IPluginAuth, RemoteUser, Logger } from '@verdaccio/types';
import { getConflict, getForbidden, getNotFound, getUnauthorized } from '@verdaccio/commons-api/lib';

import { VerdaccioMemoryConfig, Users, UserMemory } from '../types/index';

export default class Memory implements IPluginAuth<VerdaccioMemoryConfig> {
  public _logger: Logger;
  public _users: Users;
  public _config: {};
  public _app_config: VerdaccioMemoryConfig;

  constructor(config: VerdaccioMemoryConfig, appOptions: PluginOptions<VerdaccioMemoryConfig>) {
    this._users = config.users || {};
    this._config = config;
    this._logger = appOptions.logger;
    this._app_config = appOptions.config;
  }

  authenticate(user: string, password: string, done: Callback) {
    const userCredentials = this._users[user];

    if (!userCredentials) {
      this._logger.debug({user}, '[VerdaccioMemory] user @{user} does not exist');
      return done(null, false);
    }

    if (password !== userCredentials.password) {
      const err = getUnauthorized("i don't like your password");
      this._logger.info({user}, '[VerdaccioMemory] password invalid for: @{user}');

      return done(err);
    }

    // authentication succeeded!
    // return all usergroups this user has access to;
    this._logger.info({user}, '[VerdaccioMemory] authentication succeeded for @{user}');
    return done(null, [user]);
  }

  adduser(user: string, password: string, done: Callback) {
    if (this._users[user]) {
      this._logger.debug({user}, '[VerdaccioMemory] user @{user} already exist');
      return done(null, true);
    }

    if (this._app_config.max_users) {
      if (Object.keys(this._users).length >= this._app_config.max_users) {
        const err = getConflict('maximum amount of users reached');

        return done(err);
      }
    }

    this._users[user] = { name: user, password: password };

    this._logger.info({ user }, '[VerdaccioMemory] user added succeeded for @{user}');
    done(null, user);
  }

  changePassword(username: string, password: string, newPassword: string, cb: Callback) {
    const user: UserMemory = this._users[username];
    this._logger.debug({ user: user.name }, 'user: @{user} init change password');

    if (user && user.password === password) {
      user.password = newPassword;
      this._users[username] = user;

      this._logger.info({ user }, '[VerdaccioMemory] user changed password succeeded for @{user}');
      cb(null, user);
    } else {
      const err = getNotFound('user not found');
      this._logger.debug({ user: user.name }, 'change password user  @{user} not found');

      return cb(err);
    }
  }

  allow_access(user: RemoteUser, pkg: PackageAccess, cb: Callback) {
    if (pkg.access!.includes('$all') || pkg.access!.includes('$anonymous')) {
      this._logger.debug({ user: user.name }, '[VerdaccioMemory] user: @{user} has been granted access');

      return cb(null, true);
    }

    if (!user.name) {
      const err = getForbidden('not allowed to access package');
      this._logger.debug({ user: user.name }, 'user: @{user} not allowed to access package');
      return cb(err);
    }

    if (pkg.access!.includes(user.name) || pkg.access!.includes('$authenticated')) {
      this._logger.debug({ user: user.name }, '[VerdaccioMemory] user: @{user} has been granted access');
      return cb(null, true);
    }

    const err = getForbidden('not allowed to access package');

    this._logger.debug({ user: user.name }, '[VerdaccioMemory] user: @{user} not allowed to access package');
    return cb(err);
  }

  allow_publish(user: RemoteUser, pkg: PackageAccess, cb: Callback) {
    if (pkg.publish!.includes('$all') || pkg.publish!.includes('$anonymous')) {
      this._logger.debug({ user: user.name }, '[VerdaccioMemory] user: @{user} has been granted to publish');
      return cb(null, true);
    }

    if (!user.name) {
      const err = getForbidden('not allowed to publish package');
      this._logger.debug({ user: user.name }, 'user: @{user} not allowed to publish package');

      return cb(err);
    }

    if (pkg.publish!.includes(user.name) || pkg.publish!.includes('$authenticated')) {
      return cb(null, true);
    }

    const err = getForbidden('not allowed to publish package');
    this._logger.debug({ user: user.name }, '[VerdaccioMemory] user: @{user} not allowed to publish package');

    return cb(err);
  }
}
