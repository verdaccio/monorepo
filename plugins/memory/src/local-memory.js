// @flow

import MemoryHandler from './memory-handler';
import type {StorageList, LocalStorage, Logger, Config} from '@verdaccio/types';
import type {ILocalPackageManager, ILocalData} from '@verdaccio/local-storage';


 class LocalMemory implements ILocalData {

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
    this.logger = logger;
    this.data = this._fetchLocalPackages();
  }

  add(name: string) {
    if (this.data.list.indexOf(name) === -1) {
      this.data.list.push(name);
    }
  }

  remove(name: string) {
    const i = this.data.list.indexOf(name);
    if (i !== -1) {
      this.data.list.splice(i, 1);
    }
  }

  get() {
    return this.data.list;
  }

  sync() {
    // nothing to do
  }

  getPackageStorage(packageInfo: string, packagePath: string): ILocalPackageManager {
    return new MemoryHandler(this.data.list, this.logger);
  }

  /**
   * Fetch local packages.
   * @private
   * @return {Object}
   */
  _fetchLocalPackages(): LocalStorage {
    const database: StorageList = [];
    const emptyDatabase = {list: database, secret: ''};

    return emptyDatabase;
  }

}

export default LocalMemory;
