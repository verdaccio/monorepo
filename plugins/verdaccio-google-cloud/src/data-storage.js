// @flow

import Storage from '@google-cloud/storage';
import Datastore from '@google-cloud/datastore';

import GoogleCloudStorageHandler from './storage';
import StorageHelper from './storage-helper';
import type { LocalStorage, Logger, Config } from '@verdaccio/types';
import type { ILocalData } from '@verdaccio/local-storage';

export type ConfigMemory = Config & { limit?: number };

// FIXME: temporary
const GOOGLE_OPTIONS: any = {
  projectId: process.env.GC_PROJECT_ID,
  keyFilename: process.env.GC_KEY_FILE
};

class GoogleCloudDatabase implements ILocalData {
  path: string;
  logger: Logger;
  data: LocalStorage;
  config: Config;
  locked: boolean;
  datastore: any;
  key: string;
  helper: any;

  constructor(config: ConfigMemory, options: any) {
    this.config = config;
    this.logger = options.logger;
    this.key = config.metadataDatabaseKey || 'VerdaccioDataStore';
    this.bucketName = config.bucketName || 'verdaccio-plugin';
    this.data = this._createEmtpyDatabase();
    this.helper = new StorageHelper(this.data.datastore, this.data.storage);
    // this.data.secret = config.checkSecretKey(this.data.secret);
  }

  async add(name: string) {
    const datastore = this.data.datastore;
    const key = datastore.key(this.key);
    const data = {
      name: name
    };
    try {
      await datastore.save({
        key: key,
        data: data
      });
      return null;
    } catch (err) {
      return new Error(err);
    }
  }

  async deleteItem(name: string, item: any) {
    try {
      const datastore = this.data.datastore;
      const key = datastore.key([this.key, datastore.int(item.id)]);
      const deleted = await datastore.delete(key);
      return deleted;
    } catch (err) {
      return new Error(err);
    }
  }

  async remove(name: string) {
    const deletedItems = [];
    const entities = await this.helper.getEntities(this.key);
    for (const item of entities) {
      if (item.name === name) {
        const deletedItem = await this.deleteItem(name, item);
        deletedItems.push(deletedItem);
      }
    }

    function sanityCheck(deletedItems: any) {
      if (typeof deletedItems === 'undefined' || deletedItems.length === 0 || deletedItems[0][0].indexUpdates === 0) {
        return new Error('not found');
      } else if (deletedItems[0][0].indexUpdates > 0) {
        return null;
      }
    }

    return sanityCheck(deletedItems);
  }

  async get() {
    const query = this.helper.datastore.createQuery(this.key);
    const data = await this.helper.runQuery(query);
    const names = data[0].reduce((accumulator, task) => {
      accumulator.push(task.name);
      return accumulator;
    }, []);
    return names;
  }

  sync() {
    // nothing to do
  }

  getPackageStorage(packageInfo: string) {
    return new GoogleCloudStorageHandler(packageInfo, this.data.storage, this.data.datastore, this.helper, this.config, this.logger);
  }

  _createEmtpyDatabase(): LocalStorage {
    const datastore = new Datastore(GOOGLE_OPTIONS);
    const storage = new Storage(GOOGLE_OPTIONS);

    const list: any = [];
    const files: any = {};
    const emptyDatabase = {
      datastore,
      storage,
      list,
      files,
      secret: ''
    };

    return emptyDatabase;
  }

  // async createBucket(storage) {
  //   await storage.createBucket(this.bucketName);
  // }
}

export default GoogleCloudDatabase;
