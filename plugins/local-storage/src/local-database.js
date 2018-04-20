// @flow

import fs from 'fs';
import _ from 'lodash';
import Path from 'path';
import LocalFS from './local-fs';
import mkdirp from 'mkdirp';
import type { StorageList, LocalStorage, Logger, Config, Callback } from '@verdaccio/types';
import type { IPackageStorage, ILocalData } from '@verdaccio/local-storage';

/**
 * Handle local database.
 */
class LocalDatabase implements ILocalData {
  path: string;
  logger: Logger;
  data: LocalStorage;
  config: Config;
  locked: boolean;

  /**
   * Load an parse the local json database.
   * @param {*} path the database path
   */
  constructor(config: Config, logger: Logger) {
    this.config = config;
    this.path = this._buildStoragePath(config);
    this.logger = logger;
    this.locked = false;
    this.data = this._fetchLocalPackages();
    this._sync();
  }

  getSecret() {
    return this.data.secret;
  }

  setSecret(secret: string) {
    this.data.secret = secret;
    this._sync();
  }

  /**
   * Add a new element.
   * @param {*} name
   * @return {Error|*}
   */
  add(name: string, cb: Callback) {
    if (this.data.list.indexOf(name) === -1) {
      this.data.list.push(name);
      cb(this._sync());
    }
  }

  /**
   * Remove an element from the database.
   * @param {*} name
   * @return {Error|*}
   */
  remove(name: string, cb: Callback) {
    this.get((err, data) => {
      if (err) {
        cb(new Error('error on get'));
      }

      const pkgName = data.indexOf(name);
      if (pkgName !== -1) {
        this.data.list.splice(pkgName, 1);
      }

      cb(this._sync());
    });
  }

  /**
   * Return all database elements.
   * @return {Array}
   */
  get(cb: Callback) {
    cb(null, this.data.list);
  }

  /**
   * Syncronize {create} database whether does not exist.
   * @return {Error|*}
   */
  _sync() {
    if (this.locked) {
      this.logger.error('Database is locked, please check error message printed during startup to prevent data loss.');
      return new Error('Verdaccio database is locked, please contact your administrator to checkout logs during verdaccio startup.');
    }
    // Uses sync to prevent ugly race condition
    try {
      mkdirp.sync(Path.dirname(this.path));
    } catch (err) {
      // perhaps a logger instance?
      return null;
    }

    try {
      fs.writeFileSync(this.path, JSON.stringify(this.data));
      return null;
    } catch (err) {
      return err;
    }
  }

  getPackageStorage(packageInfo: string): IPackageStorage {
    // $FlowFixMe
    const packagePath: string = this._getLocalStoragePath(this.config.getMatchedPackagesSpec(packageInfo).storage);

    if (_.isString(packagePath) === false) {
      this.logger.debug({ name: packageInfo }, 'this package has no storage defined: @{name}');
      return;
    }

    const packageStoragePath: string = Path.join(Path.resolve(Path.dirname(this.config.self_path || ''), packagePath), packageInfo);

    return new LocalFS(packageStoragePath, this.logger);
  }

  /**
   * Verify the right local storage location.
   * @param {String} path
   * @return {String}
   * @private
   */
  _getLocalStoragePath(path: string): string {
    if (_.isNil(path) === false) {
      return path;
    }

    return this.config.storage;
  }

  /**
   * Build the local database path.
   * @param {Object} config
   * @return {string|String|*}
   * @private
   */
  _buildStoragePath(config: Config) {
    return Path.join(Path.resolve(Path.dirname(config.self_path || ''), config.storage, '.sinopia-db.json'));
  }

  /**
   * Fetch local packages.
   * @private
   * @return {Object}
   */
  _fetchLocalPackages(): LocalStorage {
    const database: StorageList = [];
    const emptyDatabase = { list: database, secret: '' };

    try {
      const dbFile = fs.readFileSync(this.path, 'utf8');

      if (_.isNil(dbFile)) {
        // readFileSync is platform specific, FreeBSD might return null
        return emptyDatabase;
      }

      const db = this._parseDatabase(dbFile);

      if (!db) {
        return emptyDatabase;
      }

      return db;
    } catch (err) {
      // readFileSync is platform specific, macOS, Linux and Windows thrown an error
      // Only recreate if file not found to prevent data loss
      if (err.code !== 'ENOENT') {
        this.locked = true;
        this.logger.error('Failed to read package database file, please check the error printed below:\n', `File Path: ${this.path}\n\n ${err.message}`);
      }
      return emptyDatabase;
    }
  }

  /**
   * Parse the local database.
   * @param {Object} dbFile
   * @private
   * @return {Object}
   */
  _parseDatabase(dbFile: any) {
    try {
      return JSON.parse(dbFile);
    } catch (err) {
      this.logger.error(`Package database file corrupted (invalid JSON), please check the error printed below.\nFile Path: ${this.path}`, err);
      this.locked = true;
    }
  }
}

export default LocalDatabase;
