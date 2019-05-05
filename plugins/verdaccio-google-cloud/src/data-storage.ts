import { Storage } from '@google-cloud/storage';
import Datastore from '@google-cloud/datastore';

import GoogleCloudStorageHandler from './storage';
import StorageHelper from './storage-helper';
import { Logger, Callback, IPluginStorage } from '@verdaccio/types';
import { VerdaccioConfigGoogleStorage, GoogleCloudOptions, GoogleDataStorage } from './types';

class GoogleCloudDatabase implements IPluginStorage<VerdaccioConfigGoogleStorage> {
  helper: any;
  path: string | undefined;
  logger: Logger;
  data: GoogleDataStorage;
  locked: boolean | undefined;
  config: VerdaccioConfigGoogleStorage;
  kind: string;
  bucketName: string;
  keyFilename: string | undefined;
  GOOGLE_OPTIONS: GoogleCloudOptions | undefined;

  constructor(config: VerdaccioConfigGoogleStorage, options: any) {
    if (!config) {
      throw new Error('google cloud storage missing config. Add `store.google-cloud` to your config file');
    }
    this.config = config;
    this.logger = options.logger;
    this.kind = config.kind || 'VerdaccioDataStore';
    // if (!this.keyFilename) {
    //   throw new Error('Google Storage requires a a key file');
    // }
    if (!config.bucket) {
      throw new Error('Google Cloud Storage requires a bucket name, please define one.');
    }
    this.bucketName = config.bucket;
    this.data = this._createEmptyDatabase();
    this.helper = new StorageHelper(this.data.datastore, this.data.storage);
  }

  _getGoogleOptions(config: VerdaccioConfigGoogleStorage): GoogleCloudOptions {
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

    this.logger.warn({ content: JSON.stringify(GOOGLE_OPTIONS) }, 'Google storage settings: @{content}');
    return GOOGLE_OPTIONS;
  }

  search(onPackage: Callback, onEnd: Callback, validateName: any): void {
    onEnd();
  }

  getSecret(): Promise<any> {
    const key = this.data.datastore.key(['Secret', 'secret']);
    return this.data.datastore.get(key).then((results: any) => results[0] && results[0].secret);
  }

  setSecret(secret: string): Promise<any> {
    const key = this.data.datastore.key(['Secret', 'secret']);
    const entity = {
      key,
      data: { secret }
    };
    return this.data.datastore.upsert(entity);
  }

  add(name: string, cb: Callback): void {
    const datastore = this.data.datastore;
    const key = datastore.key([this.kind, name]);
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

  async _deleteItem(name: string, item: any) {
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
    const deletedItems: any = [];
    const sanityCheck = (deletedItems: any) => {
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
      .then(async (entities: any) => {
        for (const item of entities) {
          if (item.name === name) {
            const deletedItem = await this._deleteItem(name, item);
            deletedItems.push(deletedItem);
          }
        }
        cb(sanityCheck(deletedItems));
      })
      .catch((err: any) => {
        cb(new Error(err));
      });
  }

  get(cb: Callback) {
    const query = this.helper.datastore.createQuery(this.kind);
    this.helper.runQuery(query).then((data: any) => {
      const names = data[0].reduce((accumulator: any, task: any) => {
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

  _createEmptyDatabase(): GoogleDataStorage {
    const options = this._getGoogleOptions(this.config);
    const datastore = new Datastore(options);
    const storage = new Storage(options);

    const list: any = [];
    const files: any = {};
    const emptyDatabase = {
      datastore,
      storage,
      list, // not used
      files, // not used
      secret: ''
    };

    return emptyDatabase;
  }

  // async createBucket(storage) {
  //   await storage.createBucket(this.bucketName);
  // }
}

export default GoogleCloudDatabase;
