import fs from 'fs';
import Path from 'path';

import { Callback, AuthConf, Config, Logger, IPluginAuth } from '@verdaccio/types';
import { unlockFile } from '@verdaccio/file-locking';

import {
  verifyPassword,
  lockAndRead,
  parseHTPasswd,
  addUserToHTPasswd,
  changePasswordToHTPasswd,
  sanityCheck,
} from './utils';

export interface VerdaccioConfigApp extends Config {
  file: string;
  slow_verify_ms?: number;
}

export const DEFAULT_SLOW_VERIFY_MS = 200;

/**
 * HTPasswd - Verdaccio auth class
 */
export default class HTPasswd implements IPluginAuth<VerdaccioConfigApp> {
  /**
   *
   * @param {*} config htpasswd file
   * @param {object} stuff config.yaml in object from
   */
  private users: {};
  private stuff: {};
  private config: {};
  private verdaccioConfig: Config;
  private maxUsers: number;
  private path: string;
  private slowVerifyMs: number;
  private logger: Logger;
  private lastTime: any;
  // constructor
  public constructor(config: AuthConf, stuff: VerdaccioConfigApp) {
    this.users = {};

    // config for this module
    this.config = config;
    this.stuff = stuff;

    // verdaccio logger
    this.logger = stuff.logger;

    // verdaccio main config object
    this.verdaccioConfig = stuff.config;

    // all this "verdaccio_config" stuff is for b/w compatibility only
    this.maxUsers = config.max_users ? config.max_users : Infinity;

    this.lastTime = null;

    const { file } = config;

    if (!file) {
      throw new Error('should specify "file" in config');
    }

    this.path = Path.resolve(Path.dirname(this.verdaccioConfig.self_path), file);
    this.slowVerifyMs = config.slow_verify_ms || DEFAULT_SLOW_VERIFY_MS;
  }

  /**
   * authenticate - Authenticate user.
   * @param {string} user
   * @param {string} password
   * @param {function} cb
   * @returns {function}
   */
  public authenticate(user: string, password: string, cb: Callback): void {
    this.reload(async (err) => {
      if (err) {
        return cb(err.code === 'ENOENT' ? null : err);
      }
      if (!this.users[user]) {
        return cb(null, false);
      }

      let passwordValid = false;
      try {
        const start = new Date();
        passwordValid = await verifyPassword(password, this.users[user]);
        const durationMs = new Date().getTime() - start.getTime();
        if (durationMs > this.slowVerifyMs) {
          this.logger.warn(
            { user, durationMs },
            'Password for user "@{user}" took @{durationMs}ms to verify'
          );
        }
      } catch ({ message }) {
        this.logger.error({ message }, 'Unable to verify user password: @{message}');
      }
      if (!passwordValid) {
        return cb(null, false);
      }

      // authentication succeeded!
      // return all usergroups this user has access to;
      // (this particular package has no concept of usergroups, so just return
      // user herself)
      return cb(null, [user]);
    });
  }

  /**
   * Add user
   * 1. lock file for writing (other processes can still read)
   * 2. reload .htpasswd
   * 3. write new data into .htpasswd.tmp
   * 4. move .htpasswd.tmp to .htpasswd
   * 5. reload .htpasswd
   * 6. unlock file
   *
   * @param {string} user
   * @param {string} password
   * @param {function} realCb
   * @returns {Promise<any>}
   */
  public async adduser(user: string, password: string, realCb: Callback): Promise<any> {
    const pathPass = this.path;
    let sanity = await sanityCheck(user, password, verifyPassword, this.users, this.maxUsers);

    // preliminary checks, just to ensure that file won't be reloaded if it's
    // not needed
    if (sanity) {
      return realCb(sanity, false);
    }

    lockAndRead(pathPass, async (err, res): Promise<void> => {
      let locked = false;

      // callback that cleans up lock first
      const cb = (err): void => {
        if (locked) {
          unlockFile(pathPass, () => {
            // ignore any error from the unlock
            realCb(err, !err);
          });
        } else {
          realCb(err, !err);
        }
      };

      if (!err) {
        locked = true;
      }

      // ignore ENOENT errors, we'll just create .htpasswd in that case
      if (err && err.code !== 'ENOENT') {
        return cb(err);
      }
      const body = (res || '').toString('utf8');
      this.users = parseHTPasswd(body);

      // real checks, to prevent race conditions
      // parsing users after reading file.
      sanity = await sanityCheck(user, password, verifyPassword, this.users, this.maxUsers);

      if (sanity) {
        return cb(sanity);
      }

      try {
        this._writeFile(addUserToHTPasswd(body, user, password), cb);
      } catch (err) {
        return cb(err);
      }
    });
  }

  /**
   * Reload users
   * @param {function} callback
   */
  public reload(callback: Callback): void {
    fs.stat(this.path, (err, stats) => {
      if (err) {
        return callback(err);
      }
      if (this.lastTime === stats.mtime) {
        return callback();
      }

      this.lastTime = stats.mtime;

      fs.readFile(this.path, 'utf8', (err, buffer) => {
        if (err) {
          return callback(err);
        }

        Object.assign(this.users, parseHTPasswd(buffer));
        callback();
      });
    });
  }

  private _stringToUt8(authentication: string): string {
    return (authentication || '').toString();
  }

  private _writeFile(body: string, cb: Callback): void {
    fs.writeFile(this.path, body, (err) => {
      if (err) {
        cb(err);
      } else {
        this.reload(() => {
          cb(null);
        });
      }
    });
  }

  /**
   * changePassword - change password for existing user.
   * @param {string} user
   * @param {string} password
   * @param {string} newPassword
   * @param {function} realCb
   * @returns {function}
   */
  public changePassword(
    user: string,
    password: string,
    newPassword: string,
    realCb: Callback
  ): void {
    lockAndRead(this.path, (err, res) => {
      let locked = false;
      const pathPassFile = this.path;

      // callback that cleans up lock first
      const cb = (err): void => {
        if (locked) {
          unlockFile(pathPassFile, () => {
            // ignore any error from the unlock
            realCb(err, !err);
          });
        } else {
          realCb(err, !err);
        }
      };

      if (!err) {
        locked = true;
      }

      if (err && err.code !== 'ENOENT') {
        return cb(err);
      }

      const body = this._stringToUt8(res);
      this.users = parseHTPasswd(body);

      if (!this.users[user]) {
        return cb(new Error('User not found'));
      }

      try {
        this._writeFile(changePasswordToHTPasswd(body, user, password, newPassword), cb);
      } catch (err) {
        return cb(err);
      }
    });
  }
}
