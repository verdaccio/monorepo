import fs from 'fs';
import Path from 'path';

import buildDebug from 'debug';
import _ from 'lodash';
import { errorUtils, fileUtils, pluginUtils, searchUtils } from '@verdaccio/core';
import mkdirp from 'mkdirp';
import { Callback, Config, Logger, StorageList } from '@verdaccio/types';

import LocalDriver, { noSuchFile } from './local-fs';
import { loadPrivatePackages, LocalStorage } from './pkg-utils';
import TokenActions from './token';
import { searchOnStorage } from './dir-utils';
import { _dbGenPath } from './utils';

const DB_NAME = process.env.VERDACCIO_STORAGE_NAME ?? fileUtils.Files.DatabaseName;

const debug = buildDebug('verdaccio:plugin:local-storage');

class LocalDatabase extends TokenActions {
  public path: string;
  public logger: Logger;
  public data: LocalStorage;
  public config: Config;
  public locked: boolean;

  public constructor(config: Config, logger: Logger) {
    super(config);
    this.config = config;
    // this.path = this._buildStoragePath(config);
    this.path = _dbGenPath(DB_NAME, config);
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

  /**
   * Filter and only match those values that the query define.
   **/
  public async filterByQuery(results: searchUtils.SearchItemPkg[], query: searchUtils.SearchQuery) {
    // FUTURE: apply new filters, keyword, version, ...
    return results.filter((item: searchUtils.SearchItemPkg) => {
      return item?.name?.match(query.text) !== null;
    }) as searchUtils.SearchItemPkg[];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getScore(_pkg: searchUtils.SearchItemPkg): Promise<searchUtils.Score> {
    // TODO: there is no particular reason to predefined scores
    // could be improved by using
    return Promise.resolve({
      final: 1,
      detail: {
        maintenance: 0,
        popularity: 1,
        quality: 1,
      },
    });
  }

  public async search(query: searchUtils.SearchQuery): Promise<searchUtils.SearchItem[]> {
    const results: searchUtils.SearchItem[] = [];
    const storages = this._getCustomPackageLocalStorages();
    const storagePath = this.getStoragePath();
    const packagesOnStorage = await this.filterByQuery(
      await searchOnStorage(storagePath, storages as Map<string, string>),
      query
    );
    debug('packages found %o', packagesOnStorage.length);
    for (let storage of packagesOnStorage) {
      // check if package is listed on the cache private database
      const isPrivate = (this.data as LocalStorage).list.includes(storage.name);
      const score = await this.getScore(storage);
      results.push({
        package: storage,
        verdaccioPrivate: isPrivate,
        verdaccioPkgCached: !isPrivate,
        score,
      });
    }
    return results;
  }

  public remove(name: string, cb: Callback): void {
    this.get((err, data) => {
      if (err) {
        cb(errorUtils.getInternalError('error remove private package'));
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

  public getPackageStorage(packageName: string) {
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

  private getBaseConfigPath(): string {
    return Path.dirname(this.config.configPath);
  }

  /**
   * The field storage could be absolute or relative.
   * If relative, it will be resolved against the config path.
   * If absolute, it will be returned as is.
   **/
  private getStoragePath() {
    const { storage } = this.config;
    if (typeof storage !== 'string') {
      throw new TypeError('storage field is mandatory');
    }

    const storagePath = Path.isAbsolute(storage)
      ? storage
      : Path.normalize(Path.join(this.getBaseConfigPath(), storage));
    debug('storage path %o', storagePath);
    return storagePath;
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
