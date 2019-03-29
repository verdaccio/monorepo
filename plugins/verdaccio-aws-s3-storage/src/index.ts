import { LocalStorage, Logger, Config, Callback, IPluginStorage, PluginOptions } from '@verdaccio/types';
import { S3 } from 'aws-sdk';
import { S3Config } from './config';
import S3PackageManager from './s3PackageManager';
import { convertS3Error, is404Error } from './s3Errors';

export default class S3Database implements IPluginStorage<S3Config> {
  logger: Logger;
  config: S3Config;
  s3: S3;
  _localData: LocalStorage | null;

  constructor(config: Config, options: PluginOptions<S3Config>) {
    this.logger = options.logger;
    // copy so we don't mutate
    if (!config) {
      throw new Error('s3 storage missing config. Add `store.s3-storage` to your config file');
    }
    this.config = Object.assign({}, config.store['s3-storage']);
    if (!this.config.bucket) {
      throw new Error('s3 storage requires a bucket');
    }
    const configKeyPrefix = this.config.keyPrefix;
    this._localData = null;
    this.config.keyPrefix = configKeyPrefix != null ? (configKeyPrefix.endsWith('/') ? configKeyPrefix : `${configKeyPrefix}/`) : '';
    this.s3 = new S3({
      endpoint: this.config.endpoint,
      region: this.config.region,
      s3ForcePathStyle: this.config.s3ForcePathStyle
    });
  }

  async getSecret(): Promise<any> {
    return Promise.resolve((await this._getData()).secret);
  }

  async setSecret(secret: string): Promise<any> {
    (await this._getData()).secret = secret;
    await this._sync();
  }

  add(name: string, callback: Callback) {
    this._getData().then(async data => {
      if (data.list.indexOf(name) === -1) {
        data.list.push(name);
        try {
          await this._sync();
          callback(null);
        } catch (err) {
          callback(err);
        }
      } else {
        callback(null);
      }
    });
  }

  async search(onPackage: Function, onEnd: Function, validateName: Function) {
    const storage = await this._getData();
    const storageInfoMap = storage.list.map(this._fetchPackageInfo.bind(this, onPackage));
    await Promise.all(storageInfoMap);
    onEnd();
  }

  async _fetchPackageInfo(onPackage: Function, packageName: string) {
    return new Promise(resolve => {
      this.s3.headObject(
        {
          Bucket: this.config.bucket,
          Key: `${this.config.keyPrefix + packageName}/package.json`
        },
        (err, response) => {
          if (err) {
            return resolve();
          }
          if (response.LastModified) {
            return onPackage(
              {
                name: packageName,
                path: packageName,
                time: response.LastModified.getTime()
              },
              resolve
            );
          }
          resolve();
        }
      );
    });
  }

  remove(name: string, callback: Callback) {
    this.get(async (err, data) => {
      if (err) {
        callback(new Error('error on get'));
      }

      const pkgName = data.indexOf(name);
      if (pkgName !== -1) {
        const data = await this._getData();
        data.list.splice(pkgName, 1);
      }

      try {
        await this._sync();
        callback(null);
      } catch (err) {
        callback(err);
      }
    });
  }

  get(callback: Callback) {
    this._getData().then(data => callback(null, data.list));
  }

  // Create/write database file to s3
  async _sync() {
    await new Promise((resolve, reject) => {
      this.s3.putObject(
        {
          Bucket: this.config.bucket,
          Key: `${this.config.keyPrefix}verdaccio-s3-db.json`,
          Body: JSON.stringify(this._localData)
        },
        (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
  }

  // returns an instance of a class managing the storage for a single package
  getPackageStorage(packageName: string): S3PackageManager {
    return new S3PackageManager(this.config, packageName, this.logger);
  }

  async _getData(): Promise<LocalStorage> {
    if (!this._localData) {
      this._localData = await new Promise((resolve, reject) => {
        this.s3.getObject(
          {
            Bucket: this.config.bucket,
            Key: `${this.config.keyPrefix}verdaccio-s3-db.json`
          },
          (err, response) => {
            if (err) {
              const s3Err = convertS3Error(err);
              if (is404Error(s3Err)) {
                resolve({ list: [], secret: '' });
              } else {
                reject(err);
              }
              return;
            }
            //@ts-ignore
            const data = JSON.parse(response.Body.toString());
            resolve(data);
          }
        );
      });
    }
    //@ts-ignore
    return this._localData;
  }
}
