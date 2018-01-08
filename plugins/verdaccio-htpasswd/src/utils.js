'use strict';

import crypto from 'crypto';
import crypt3 from './crypt3';
import md5 from 'apache-md5';
import locker from '@verdaccio/file-locking';

// this function neither unlocks file nor closes it
// it'll have to be done manually later
export function lockAndRead(name, cb) {
  locker.readFile(name, {lock: true}, function(err, res) {
    if (err) {
      return cb(err);
    }
    return cb(null, res);
  });
}

// close and unlock file
export function unlockFile(name, cb) {
  locker.unlockFile(name, cb);
}

export function parseHTPasswd(input) {
  let result = {};
  input.split('\n').forEach(function(line) {
    let args = line.split(':', 3);
    if (args.length > 1) result[args[0]] = args[1];
  });
  return result;
}

export function verifyPassword(user, passwd, hash) {
  console.log(hash);
  if (hash.indexOf('{PLAIN}') === 0) {
    return passwd === hash.substr(7);
  } else if (hash.indexOf('{SHA}') === 0) {
    return (
      crypto
        .createHash('sha1')
        .update(passwd, 'binary')
        .digest('base64') === hash.substr(5)
    );
  } else {
    console.log(md5(passwd, hash) === hash || crypt3(passwd, hash) === hash);
    return (
      // for backwards compatibility, first check md5 then check crypt3
      md5(passwd, hash) === hash || crypt3(passwd, hash) === hash
    );
  }
}

export function addUserToHTPasswd(body, user, passwd) {
  if (user !== encodeURIComponent(user)) {
    let err = Error('username should not contain non-uri-safe characters');
    err.status = 409;
    throw err;
  }

  if (crypt3) {
    passwd = crypt3(passwd);
  } else {
    passwd =
      '{SHA}' +
      crypto
        .createHash('sha1')
        .update(passwd, 'binary')
        .digest('base64');
  }
  let comment = 'autocreated ' + new Date().toJSON();

  let newline = user + ':' + passwd + ':' + comment + '\n';
  if (body.length && body[body.length - 1] !== '\n') newline = '\n' + newline;
  return body + newline;
}
