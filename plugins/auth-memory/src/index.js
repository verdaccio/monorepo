// @flow
import type { RemoteUser, Callback, PackageAccess } from '@verdaccio/types';
import type { verdaccioConfigAuthMemory, VerdaccioConfigApp } from '../types';
/**
 * Verdaccio auth memory
 */
export default class Memory {
  // flow types
  config: Object;
  verdaccioConfig: Object;
  users: Object;
  max_users: number;
  constructor(
    config: verdaccioConfigAuthMemory,
    verdaccioConfig: VerdaccioConfigApp
  ) {
    this.config = config;
    this.verdaccioConfig = verdaccioConfig;
    this.users = config.users || {};
    this.max_users = verdaccioConfig.max_users || Infinity;
  }

  authenticate(user: string, password: string, done: Callback): Callback {
    const { users } = this;
    const userCredentials = users[user];

    if (!userCredentials) {
      return done(null, false);
    }

    if (password !== userCredentials.password) {
      const error = Error('Unauthorized access');
      // $FlowFixMe
      error.status = 401;
      return done(error);
    }

    // authentication succeeded!
    // return all usergroups this user has access to;
    return done(null, [user]);
  }

  adduser(user: RemoteUser, password: string, done: Callback): Callback {
    const { users, max_users } = this;
    if (users[user]) {
      return done(null, true);
    }

    if (max_users && Object.keys(users).length >= max_users) {
      let error = Error('maximum amount of users reached');
      // $FlowFixMe
      error.status = 409;
      return done(error);
    }

    this.users[user] = { name: user, password };

    return done(null, user);
  }

  allow_access(user: RemoteUser, pkg: PackageAccess, done: Callback): Callback {
    if (
      String(pkg.access).includes('$all') ||
      String(pkg.access).includes('$anonymous')
    ) {
      return done(null, true);
    }

    const { name } = user;

    if (!name) {
      const error = Error('not allowed to access package');
      // $FlowFixMe
      error.status = 403;
      return done(error);
    }

    if (
      String(pkg.access).includes(name) ||
      String(pkg.access).includes('$authenticated')
    ) {
      return done(null, true);
    }

    const error = Error('not allowed to access package');
    // $FlowFixMe
    error.status = 403;
    return done(error);
  }

  allow_publish(
    user: RemoteUser,
    pkg: PackageAccess,
    done: Callback
  ): Callback {
    if (
      String(pkg.publish).includes('$all') ||
      String(pkg.publish).includes('$anonymous')
    ) {
      return done(null, true);
    }

    const { name } = user;

    if (!name) {
      const error = Error('not allowed to publish package');
      // $FlowFixMe
      error.status = 403;
      return done(error);
    }

    if (
      String(pkg.publish).includes(name) ||
      String(pkg.publish).includes('$authenticated')
    ) {
      return done(null, true);
    }

    const error = Error('not allowed to publish package');
    // $FlowFixMe
    error.status = 403;
    return done(error);
  }
}
