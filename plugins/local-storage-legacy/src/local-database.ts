import fs from 'fs';
import Path from 'path';

import buildDebug from 'debug';
import _ from 'lodash';
import async from 'async';
import mkdirp from 'mkdirp';
import {
  Callback,
  Config,
  IPackageStorage,
  IPluginStorage,
  LocalStorage,
  Logger,
  StorageList,
} from '@verdaccio/legacy-types';
import { getInternalError } from '@verdaccio/commons-api';

import LocalDriver, { noSuchFile } from './local-fs';
import { loadPrivatePackages } from './pkg-utils';
import TokenActions from './token';

const DEPRECATED_DB_NAME = '.sinopia-db.json';
const DB_NAME = '.verdaccio-db.json';

const debug = buildDebug('verdaccio:plugin:local-storage');

class LocalDatabase extends TokenActions implements IPluginStorage<{}> {
  public path: string;
  public logger: Logger;
  public data: LocalStorage;
  public config: Config;
  public locked: boolean;

  public constructor(config: Config, logger: Logger) {
    super(config);
    this.config = config;
    this.path = this._buildStoragePath(config);
    this.logger = logger;
    this.locked = false;
    this.data = this._fetchLocalPackages();
    this._sync();
  }

  public getSecret(): Promise<string> {
    return Promise.resolve(this.data.secret);
  }

  public setSecret(secret: string): Promise<Error | null> {
    return new Promise((resolve): void => {
      this.data.secret = secret;

      resolve(this._sync());
    });
  }

  public add(name: string, cb: Callback): void {
    if (this.data.list.indexOf(name) === -1) {
      this.data.list.push(name);

      debug('the private package %o has been added', name);
      cb(this._sync());
    } else {
      debug('the private package %o was not added', name);
      cb(null);
    }
  }

  public search(
    onPackage: Callback,
    onEnd: Callback,
    validateName: (name: string) => boolean
  ): void {
    const storages = this._getCustomPackageLocalStorages();
    debug(`search custom local packages: %o`, JSON.stringify(storages));
    const base = Path.dirname(this.config.self_path);
    const self = this;
    const storageKeys = Object.keys(storages);
    debug(`search base: %o keys: %o`, base, storageKeys);

    async.eachSeries(
      storageKeys,
      function (storage, cb) {
        const position = storageKeys.indexOf(storage);
        const base2 = Path.join(position !== 0 ? storageKeys[0] : '');
        const storagePath: string = Path.resolve(base, base2, storage);
        debug('search path: %o : %o', storagePath, storage);
        fs.readdir(storagePath, (err, files) => {
          if (err) {
            return cb(err);
          }

          async.eachSeries(
            files,
            function (file, cb) {
              debug('local-storage: [search] search file path: %o', file);
              if (storageKeys.includes(file)) {
                return cb();
              }

              if (file.match(/^@/)) {
                // scoped
                const fileLocation = Path.resolve(base, storage, file);
                debug('search scoped file location: %o', fileLocation);
                fs.readdir(fileLocation, function (err, files) {
                  if (err) {
                    return cb(err);
                  }

                  async.eachSeries(
                    files,
                    (file2, cb) => {
                      if (validateName(file2)) {
                        const packagePath = Path.resolve(base, storage, file, file2);

                        fs.stat(packagePath, (err, stats) => {
                          if (_.isNil(err) === false) {
                            return cb(err);
                          }
                          const item = {
                            name: `${file}/${file2}`,
                            path: packagePath,
                            time: stats.mtime.getTime(),
                          };
                          onPackage(item, cb);
                        });
                      } else {
                        cb();
                      }
                    },
                    cb
                  );
                });
              } else if (validateName(file)) {
                const base2 = Path.join(position !== 0 ? storageKeys[0] : '');
                const packagePath = Path.resolve(base, base2, storage, file);
                debug('search file location: %o', packagePath);
                fs.stat(packagePath, (err, stats) => {
                  if (_.isNil(err) === false) {
                    return cb(err);
                  }
                  onPackage(
                    {
                      name: file,
                      path: packagePath,
                      time: self.getTime(stats.mtime.getTime(), stats.mtime),
                    },
                    cb
                  );
                });
              } else {
                cb();
              }
            },
            cb
          );
        });
      },
      // @ts-ignore
      onEnd
    );
  }

  public remove(name: string, cb: Callback): void {
    this.get((err, data) => {
      if (err) {
        cb(getInternalError('error remove private package'));
        this.logger.error(
          { err },
          '[local-storage/remove]: remove the private package has failed @{err}'
        );
        debug('error on remove package %o', name);
      }

      const pkgName = data.indexOf(name);
      if (pkgName !== -1) {
        this.data.list.splice(pkgName, 1);

        debug('remove package %o has been removed', name);
      }

      cb(this._sync());
    });
  }

  /**
   * Return all database elements.
   * @return {Array}
   */
  public get(cb: Callback): void {
    const list = this.data.list;
    const totalItems = this.data.list.length;

    cb(null, list);

    debug('get full list of packages (%o) has been fetched', totalItems);
  }

  public getPackageStorage(packageName: string): IPackageStorage {
    const packageAccess = this.config.getMatchedPackagesSpec(packageName);

    const packagePath: string = this._getLocalStoragePath(
      packageAccess ? packageAccess.storage : undefined
    );
    debug('storage path selected: ', packagePath);

    if (_.isString(packagePath) === false) {
      debug('the package %o has no storage defined ', packageName);
      return;
    }

    const packageStoragePath: string = Path.join(
      Path.resolve(Path.dirname(this.config.self_path || ''), packagePath),
      packageName
    );

    debug('storage absolute path: ', packageStoragePath);

    return new LocalDriver(packageStoragePath, this.logger);
  }

  public clean(): void {
    this._sync();
  }

  private getTime(time: number, mtime: Date): number | Date {
    return time ? time : mtime;
  }

  private _getCustomPackageLocalStorages(): object {
    const storages = {};

    // add custom storage if exist
    if (this.config.storage) {
      storages[this.config.storage] = true;
    }

    const { packages } = this.config;

    if (packages) {
      const listPackagesConf = Object.keys(packages || {});

      listPackagesConf.map((pkg) => {
        const storage = packages[pkg].storage;
        if (storage) {
          storages[storage] = false;
        }
      });
    }

    return storages;
  }

  /**
   * Syncronize {create} database whether does not exist.
   * @return {Error|*}
   */
  private _sync(): Error | null {
    debug('sync database started');

    if (this.locked) {
      this.logger.error(
        'Database is locked, please check error message printed during startup to ' +
          'prevent data loss.'
      );
      return new Error(
        'Verdaccio database is locked, please contact your administrator to checkout ' +
          'logs during verdaccio startup.'
      );
    }
    // Uses sync to prevent ugly race condition
    try {
      // https://www.npmjs.com/package/mkdirp#mkdirpsyncdir-opts
      const folderName = Path.dirname(this.path);
      mkdirp.sync(folderName);
      debug('sync folder %o created succeed', folderName);
    } catch (err) {
      debug('sync create folder has failed with error: %o', err);
      return null;
    }

    try {
      fs.writeFileSync(this.path, JSON.stringify(this.data));
      debug('sync write succeed');

      return null;
    } catch (err: any) {
      debug('sync failed %o', err);

      return err;
    }
  }

  /**
   * Verify the right local storage location.
   * @param {String} path
   * @return {String}
   * @private
   */
  private _getLocalStoragePath(storage: string | void): string {
    const globalConfigStorage = this.config ? this.config.storage : undefined;
    if (_.isNil(globalConfigStorage)) {
      throw new Error('global storage is required for this plugin');
    } else {
      if (_.isNil(storage) === false && _.isString(storage)) {
        return Path.join(globalConfigStorage as string, storage as string);
      }

      return globalConfigStorage as string;
    }
  }

  /**
   * Build the local database path.
   * @param {Object} config
   * @return {string|String|*}
   * @private
   */
  private _buildStoragePath(config: Config): string {
    const sinopiadbPath: string = this._dbGenPath(DEPRECATED_DB_NAME, config);
    try {
      fs.accessSync(sinopiadbPath, fs.constants.F_OK);
      // @ts-ignore
      process.emitWarning('Database name deprecated!', {
        code: 'VERCODE01',
        detail: `Please rename database name from ${DEPRECATED_DB_NAME} to ${DB_NAME}`,
      });
      return sinopiadbPath;
    } catch (err: any) {
      if (err.code === noSuchFile) {
        return this._dbGenPath(DB_NAME, config);
      }

      throw err;
    }
  }

  /**
   * Fetch local packages.
   * @private
   * @return {Object}
   */
  private _fetchLocalPackages(): LocalStorage {
    const list: StorageList = [];
    const emptyDatabase = { list, secret: '' };

    try {
      return loadPrivatePackages(this.path, this.logger);
    } catch (err: any) {
      // readFileSync is platform specific, macOS, Linux and Windows thrown an error
      // Only recreate if file not found to prevent data loss
      if (err.code !== noSuchFile) {
        this.locked = true;
        this.logger.error(
          'Failed to read package database file, please check the error printed below:\n',
          `File Path: ${this.path}\n\n ${err.message}`
        );
      }

      return emptyDatabase;
    }
  }
}

export default LocalDatabase;
