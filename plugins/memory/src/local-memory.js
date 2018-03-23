// @flow

import MemoryHandler from './memory-handler';
import type { LocalStorage, Logger, Config } from '@verdaccio/types';
import type { ILocalData } from '@verdaccio/local-storage';

export type ConfigMemory = Config & { limit?: number };

const DEFAULT_LIMIT: number = 1000;
class LocalMemory implements ILocalData {
  path: string;
  limit: number;
  logger: Logger;
  data: LocalStorage;
  config: Config;
  locked: boolean;

  constructor(config: ConfigMemory, logger: Logger) {
    this.config = config;
    this.limit = config.limit || DEFAULT_LIMIT;
    this.logger = logger;
    this.data = this._createEmtpyDatabase();
    this.data.secret = config.checkSecretKey(this.data.secret);
  }

  add(name: string) {
    if (this.data.list.length < this.limit) {
      if (this.data.list.indexOf(name) === -1) {
        this.data.list.push(name);
      }
    } else {
      this.logger.info({ limit: this.limit }, 'Storage memory has reached limit of @{limit} packages');
      return new Error('Storage memory has reached limit of limit packages');
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

  getPackageStorage(packageInfo: string) {
    return new MemoryHandler(packageInfo, this.logger);
  }

  _createEmtpyDatabase(): LocalStorage {
    const list: any = [];
    const files: any = {};
    const emptyDatabase = {
      list,
      files,
      secret: ''
    };

    return emptyDatabase;
  }
}

export default LocalMemory;
