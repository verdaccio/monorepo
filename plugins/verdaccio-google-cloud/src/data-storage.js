// @flow

import Storage from '@google-cloud/storage';
import Datastore from '@google-cloud/datastore';

import GoogleCloudStorageHandler from './storage';
import StorageHelper from './storage-helper';
import type { Logger, Callback } from '@verdaccio/types';
import type { ILocalData } from '@verdaccio/local-storage';
import type { ConfigGoogleStorage, GoogleCloudOptions, GoogleDataStorage } from '../types';

declare type GoogleDataStorage = {
  secret: string,
  storage: any,
  datastore: any
};

class GoogleCloudDatabase implements ILocalData {
  helper: any;
  path: string;
  logger: Logger;
  data: GoogleDataStorage;
  locked: boolean;
  config: ConfigGoogleStorage;
  kind: string;
  bucketName: string;
  keyFilename: string;
  GOOGLE_OPTIONS: GoogleCloudOptions;

  constructor(config: ConfigGoogleStorage, options: any) {
    if (!config) {
      throw new Error('google cloud storage missing config. Add `store.google-cloud` to your config file');
    }
    this.config = config;
    this.logger = options.logger;
    this.kind = config.kind || 'VerdaccioDataStore';
    // if (!this.keyFilename) {
    //   throw new Error('Google Storage requires a a key file');
    // }
    this.bucketName = config.bucket;
    if (!this.bucketName) {
      throw new Error('Google Cloud Storage requires a bucket name, please define one.');
    }
    this.data = this._createEmtpyDatabase();
    this.helper = new StorageHelper(this.data.datastore, this.data.storage);
  }

  _getGoogleOptions(config: ConfigGoogleStorage): GoogleCloudOptions {
    const GOOGLE_OPTIONS: GoogleCloudOptions = {};

    if (!config.projectId || typeof config.projectId !== 'string') {
      throw new Error('Google Cloud Storage requires a ProjectId.');
    }

    GOOGLE_OPTIONS.projectId = config.projectId || process.env.GOOGLE_CLOUD_VERDACCIO_PROJECT_ID;

    const keyFileName = config.keyFilename || process.env.GOOGLE_CLOUD_VERDACCIO_KEY;
    if (keyFileName) {
      GOOGLE_OPTIONS.keyFilename = keyFileName;
      this.logger.warn('Using credentials in a file might be un-secure and is recommended for local development');
    }
    // const GOOGLE_OPTIONS: GoogleCloudOptions = {
    //   projectId: 'verdaccio-01',
    //   keyFilename: './verdaccio-01-56f693e3aab0.json'
    // };
    this.logger.warn({ content: JSON.stringify(GOOGLE_OPTIONS) }, 'Google storage settings: @{content}');
    return GOOGLE_OPTIONS;
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
      const key = datastore.key([this.kind, datastore.int(item.id)]);
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
      } else {
        return new Error('this should not happen');
      }
    };
    this.helper
      .getEntities(this.kind)
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
    const query = this.helper.datastore.createQuery(this.kind);
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
    const datastore = new Datastore(this._getGoogleOptions(this.config));
    const storage = new Storage(this._getGoogleOptions(this.config));

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
