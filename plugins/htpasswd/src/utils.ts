import crypto from 'crypto';

import md5 from 'apache-md5';
import bcrypt from 'bcryptjs';
import createError, { HttpError } from 'http-errors';
import { readFile } from '@verdaccio/file-locking';
import { Callback } from '@verdaccio/types';

import crypt3 from './crypt3';

export enum HtpasswdHashAlgorithm {
  md5 = 'md5',
  sha1 = 'sha1',
  crypt = 'crypt',
  bcrypt = 'bcrypt',
}

export interface HtpasswdHashConfig {
  algorithm: HtpasswdHashAlgorithm;
  rounds?: number;
}

// this function neither unlocks file nor closes it
// it'll have to be done manually later
export function lockAndRead(name: string, cb: Callback): void {
  readFile(name, { lock: true }, (err, res) => {
    if (err) {
      return cb(err);
    }

    return cb(null, res);
  });
}

/**
 * parseHTPasswd - convert htpasswd lines to object.
 * @param {string} input
 * @returns {object}
 */
export function parseHTPasswd(input: string): Record<string, any> {
  // The input is split on line ending styles that are both windows and unix compatible
  return input.split(/[\r]?[\n]/).reduce((result, line) => {
    const args = line.split(':', 3).map((str) => str.trim());
    if (args.length > 1) {
      result[args[0]] = args[1];
    }
    return result;
  }, {});
}

/**
 * verifyPassword - matches password and it's hash.
 * @param {string} passwd
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(passwd: string, hash: string): Promise<boolean> {
  if (hash.match(/^\$2([aby])\$/)) {
    return new Promise((resolve, reject) =>
      bcrypt.compare(passwd, hash, (error, result) => (error ? reject(error) : resolve(result)))
    );
  } else if (hash.indexOf('{PLAIN}') === 0) {
    return passwd === hash.slice(7);
  } else if (hash.indexOf('{SHA}') === 0) {
    return (
      crypto
        .createHash('sha1')
        // https://nodejs.org/api/crypto.html#crypto_hash_update_data_inputencoding
        .update(passwd, 'utf8')
        .digest('base64') === hash.slice(5)
    );
  }
  // for backwards compatibility, first check md5 then check crypt3
  return md5(passwd, hash) === hash || crypt3(passwd, hash) === hash;
}

/**
 * generateHtpasswdLine - generates line for htpasswd file.
 * @param {string} user
 * @param {string} passwd
 * @param {HtpasswdHashConfig} hashConfig
 * @returns {string}
 */
export function generateHtpasswdLine(
  user: string,
  passwd: string,
  hashConfig: HtpasswdHashConfig
): string {
  let hash: string;

  switch (hashConfig.algorithm) {
    case HtpasswdHashAlgorithm.bcrypt:
      hash = bcrypt.hashSync(passwd, hashConfig.rounds);
      break;
    case HtpasswdHashAlgorithm.crypt:
      hash = crypt3(passwd);
      break;
    case HtpasswdHashAlgorithm.md5:
      hash = md5(passwd);
      break;
    case HtpasswdHashAlgorithm.sha1:
      hash = '{SHA}' + crypto.createHash('sha1').update(passwd, 'utf8').digest('base64');
      break;
    default:
      throw createError('Unexpected hash algorithm');
  }

  const comment = 'autocreated ' + new Date().toJSON();
  return `${user}:${hash}:${comment}\n`;
}

/**
 * addUserToHTPasswd - Generate a htpasswd format for .htpasswd
 * @param {string} body
 * @param {string} user
 * @param {string} passwd
 * @returns {string}
 */
export function addUserToHTPasswd(
  body: string,
  user: string,
  passwd: string,
  hashConfig: HtpasswdHashConfig
): string {
  if (user !== encodeURIComponent(user)) {
    const err = createError('username should not contain non-uri-safe characters');

    err.status = 409;
    throw err;
  }

  let newline = generateHtpasswdLine(user, passwd, hashConfig);

  if (body.length && body[body.length - 1] !== '\n') {
    newline = '\n' + newline;
  }
  return body + newline;
}

/**
 * Sanity check for a user
 * @param {string} user
 * @param {object} users
 * @param {string} password
 * @param {Callback} verifyFn
 * @param {number} maxUsers
 * @returns {object}
 */
export async function sanityCheck(
  user: string,
  password: string,
  verifyFn: Callback,
  users: {},
  maxUsers: number
): Promise<HttpError | null> {
  let err;

  // check for user or password
  if (!user || !password) {
    err = Error('username and password is required');
    err.status = 400;
    return err;
  }

  const hash = users[user];

  if (maxUsers < 0) {
    err = Error('user registration disabled');
    err.status = 409;
    return err;
  }

  if (hash) {
    const auth = await verifyFn(password, users[user]);
    if (auth) {
      err = Error('username is already registered');
      err.status = 409;
      return err;
    }
    err = Error('unauthorized access');
    err.status = 401;
    return err;
  } else if (Object.keys(users).length >= maxUsers) {
    err = Error('maximum amount of users reached');
    err.status = 403;
    return err;
  }

  return null;
}

/**
 * changePasswordToHTPasswd - change password for existing user
 * @param {string} body
 * @param {string} user
 * @param {string} passwd
 * @param {string} newPasswd
 * @param {HtpasswdHashConfig} hashConfig
 * @returns {string}
 */
export async function changePasswordToHTPasswd(
  body: string,
  user: string,
  passwd: string,
  newPasswd: string,
  hashConfig: HtpasswdHashConfig
): Promise<string> {
  let lines = body.split('\n');
  const userLineIndex = lines.findIndex((line) => line.split(':', 1).shift() === user);
  if (userLineIndex === -1) {
    throw new Error(`Unable to change password for user '${user}': user does not currently exist`);
  }
  const [username, hash] = lines[userLineIndex].split(':', 2);
  const passwordValid = await verifyPassword(passwd, hash);
  if (!passwordValid) {
    throw new Error(`Unable to change password for user '${user}': invalid old password`);
  }
  const updatedUserLine = generateHtpasswdLine(username, newPasswd, hashConfig);
  lines.splice(userLineIndex, 1, updatedUserLine);
  return lines.join('\n');
}
