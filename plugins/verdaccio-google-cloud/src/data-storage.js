// @flow

import Storage from '@google-cloud/storage';
import Datastore from '@google-cloud/datastore';

import GoogleCloudStorageHandler from './storage';
import StorageHelper from './storage-helper';
import type { ConfigMemory } from './storage-helper';
import type { Logger, Callback } from '@verdaccio/types';
import type { ILocalData } from '@verdaccio/local-storage';

const GOOGLE_OPTIONS: any = {
  projectId: process.env.GC_PROJECT_ID,
  keyFilename: process.env.GC_KEY_FILE
};

declare type GoogleDataStorage = {
  secret: string,
  storage: any,
  datastore: any
};

class GoogleCloudDatabase implements ILocalData {
  path: string;
  logger: Logger;
  data: GoogleDataStorage;
  bucketName: string;
  config: ConfigMemory;
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
  }

  getSecret(): Promise<any> {
    return Promise.resolve(this.data.secret);
  }

  setSecret(secret: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.data.secret = secret;
      resolve(null);
    });
  }

  add(name: string, cb: Callback): void {
    const datastore = this.data.datastore;
    const key = datastore.key(this.key);
    const data = {
      name: name
    };
    datastore
      .save({
        key: key,
        data: data
      })
      .then(() => cb(null))
      .catch(err => {
        cb(new Error(err));
      });
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

  remove(name: string, cb: Callback): void {
    const deletedItems = [];
    const sanityCheck = function(deletedItems: any) {
      if (typeof deletedItems === 'undefined' || deletedItems.length === 0 || deletedItems[0][0].indexUpdates === 0) {
        return new Error('not found');
      } else if (deletedItems[0][0].indexUpdates > 0) {
        return null;
      }
    };
    this.helper
      .getEntities(this.key)
      .then(async entities => {
        for (const item of entities) {
          if (item.name === name) {
            const deletedItem = await this.deleteItem(name, item);
            deletedItems.push(deletedItem);
          }
        }
        cb(sanityCheck(deletedItems));
      })
      .catch(err => {
        cb(new Error(err));
      });
  }

  get(cb: Callback) {
    const query = this.helper.datastore.createQuery(this.key);
    this.helper.runQuery(query).then(data => {
      const names = data[0].reduce((accumulator, task) => {
        accumulator.push(task.name);
        return accumulator;
      }, []);
      cb(null, names);
    });
  }

  sync() {
    // nothing to do
  }

  getPackageStorage(packageInfo: string): any {
    return new GoogleCloudStorageHandler(packageInfo, this.data.storage, this.data.datastore, this.helper, this.config, this.logger);
  }

  _createEmtpyDatabase(): GoogleDataStorage {
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
