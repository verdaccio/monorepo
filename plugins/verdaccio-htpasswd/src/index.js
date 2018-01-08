'use strict';

import fs from 'fs';
import Path from 'path';
import {
  verifyPassword,
  lockAndRead,
  unlockFile,
  parseHTPasswd,
  addUserToHTPasswd,
} from './utils';

class HTPasswd {
  constructor(config, stuff) {
    this.users = {};

    // config for this module
    this.config = config;
    this.stuff = stuff;

    // verdaccio logger
    this.logger = stuff.logger;

    // verdaccio main config object
    this.verdaccioConfig = stuff.config;

    // all this "verdaccio_config" stuff is for b/w compatibility only
    this.maxUsers = this.config.max_users ? this.config.max_users : Infinity;

    this.lastTime = null;

    let {file} = config;

    if (!file) file = this.verdaccioConfig.users_file;

    if (!file) throw new Error('should specify "file" in config');

    this.path = Path.resolve(
      Path.dirname(this.verdaccioConfig.self_path),
      file
    );
  }

  /**
   *
   */
  authenticate(user, password, cb) {
    console.log(user, password);
    this.reload((err) => {
      if (err) return cb(err.code === 'ENOENT' ? null : err);
      if (!this.users[user]) return cb(null, false);
      console.log(this.users);
      if (verifyPassword(user, password, this.users[user])) {
        return cb(null, false);
      }

      // authentication succeeded!
      // return all usergroups this user has access to;
      // (this particular package has no concept of usergroups, so just return user herself)
      return cb(null, [user]);
    });
  }

  /**
   *
   * @param {*} user
   * @param {*} password
   * @param {*} real_cb
   */
  adduser(user, password, realCb) {
    const sanityCheck = () => {
      let err = null;
      if (this.users[user]) {
        err = Error('this user already exists');
      } else if (Object.keys(this.users).length >= this.maxUsers) {
        err = Error('maximum amount of users reached');
      }
      if (err) err.status = 403;
      return err;
    };

    // preliminary checks, just to ensure that file won't be reloaded if it's not needed
    if (sanityCheck()) {
      return realCb(sanityCheck, false);
    }

    lockAndRead(this.path, (err, res) => {
      let locked = false;

      // callback that cleans up lock first
      const cb = (err) => {
        if (locked) {
          unlockFile(this.path, function() {
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
      if (err && err.code !== 'ENOENT') return cb(err);

      let body = (res || '').toString('utf8');
      this.users = parseHTPasswd(body);

      // real checks, to prevent race conditions
      if (sanityCheck) return cb(sanityCheck);

      try {
        body = addUserToHTPasswd(body, user, password);
      } catch (err) {
        return cb(err);
      }
      fs.writeFile(this.path, body, (err) => {
        if (err) return cb(err);
        this.reload(function() {
          cb(null, true);
        });
      });
    });
  }

  /**
   *
   */
  reload(callback) {
    fs.stat(this.path, (err, stats) => {
      if (err) return callback(err);

      if (this.lastTime === stats.mtime) return callback();
      this.lastTime = stats.mtime;

      fs.readFile(this.path, 'utf8', (err, buffer) => {
        if (err) return callback(err);

        this.users = parseHTPasswd(buffer);

        callback();
      });
    });
  }
}

export default function(config, stuff) {
  return new HTPasswd(config, stuff);
}
