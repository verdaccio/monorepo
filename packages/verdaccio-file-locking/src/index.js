/* @flow */

import * as _ from 'lodash';
import * as locker from 'lockfile';
import * as fs from 'fs';
import path from 'path';
import type {Callback} from '@verdaccio/types';
import type {LockOptions} from '@verdaccio/file-locking';

// locks a file by creating a lock file
const lockFile = function(name: string, callback: Callback) {

  const statDir = (name) => {
    return new Promise((resolve, reject) => {
      // test to see if the directory exists
      const dirPath = path.dirname(name);
      fs.stat(dirPath, function(err, stats) {
        if (err) {
          return reject(err);
        } else if (!stats.isDirectory()) {
          return resolve(new Error(`${path.dirname(name)} is not a directory`));
        } else {
          return resolve(null);
        }
      });
    });
  };

  const statfile = (name) => {
    return new Promise((resolve, reject) => {
      // test to see if the directory exists
      fs.stat(name, function(err, stats) {
        if (err) {
          return reject(err);
        } else if (!stats.isFile()) {
          return resolve(new Error(`${path.dirname(name)} is not a file`));
        } else {
          return resolve(null);
        }
      });
    });
  };

  const lockfile = (name) => {
    return new Promise((resolve) => {
      const lockOpts = {
        // time (ms) to wait when checking for stale locks
        wait: 1000,
        // how often (ms) to re-check stale locks
        pollPeriod: 100,
        // locks are considered stale after 5 minutes
        stale: 5 * 60 * 1000,
        // number of times to attempt to create a lock
        retries: 100,
        // time (ms) between tries
        retryWait: 100,
      };
      const lockFileName = `${name}.lock`;
      locker.lock(lockFileName, lockOpts, () => {
        resolve();
      });
    });
  };

  Promise.resolve().then(() => {
    return statDir(name);
  }).then(() => {
    return statfile(name);
  }).then(() => {
    return lockfile(name);
  }).then(() => {
    callback(null);
  }).catch((err) => {
    callback(err);
  });
};

// unlocks file by removing existing lock file
const unlockFile= function(name: string, next: Callback) {
  const lockFileName = `${name}.lock`;
  locker.unlock(lockFileName, function() {
    return next(null);
  });
};

/**
 *  Reads a local file, which involves
 *  optionally taking a lock
 *  reading the file contents
 *  optionally parsing JSON contents
 * @param {*} name
 * @param {*} options
 * @param {*} callback
 */
function readFile(name: string, options: LockOptions, callback: any) {
  if (_.isFunction(options) && _.isNil(callback)) {
    callback = options;
    options = {};
  }

  options = options || {};
  options.lock = options.lock || false;
  options.parse = options.parse || false;

  const lock = function(options) {
    return new Promise((resolve, reject) => {
      if (!options.lock) {
        return resolve(null);
      }

      lockFile(name, function(err) {
        if (err) {
          return reject(err);
        }
        return resolve(null);
      });
    });
  };

  const read = function() {
    return new Promise((resolve, reject) => {
      fs.readFile(name, 'utf8', function(err, contents) {
        if (err) {
          return reject(err);
        }

        resolve(contents);
      });
    });
  };

  const parseJSON = function(contents) {
    return new Promise((resolve, reject) => {
      if (!options.parse) {
        return resolve(contents);
      }
      try {
        contents = JSON.parse(contents);
        return resolve(contents);
      } catch (err) {
        return reject(err);
      }
    });
  };

  Promise.resolve().then(()=> {
    return lock(options);
  }).then(() => {
    return read();
  }).then((content) => {
    return parseJSON(content);
  }).then((result) => {
    callback(null, result);
  }, (err) => {
    callback(err);
  });
}

export {lockFile, unlockFile, readFile};
