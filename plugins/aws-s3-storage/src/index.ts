import {
  LocalStorage,
  Logger,
  Config,
  Callback,
  IPluginStorage,
  PluginOptions,
  Token,
  TokenFilter,
} from '@verdaccio/types';
import { getInternalError, VerdaccioError, getServiceUnavailable } from '@verdaccio/commons-api';
import { S3 } from 'aws-sdk';
import s3ls from 's3-ls';

import { S3Config } from './config';
import S3PackageManager from './s3PackageManager';
import { convertS3Error, is404Error } from './s3Errors';

export default class S3Database implements IPluginStorage<S3Config> {
  public logger: Logger;
  public config: S3Config;
  private s3: S3;
  private _localData: LocalStorage | null;

  public constructor(config: Config, options: PluginOptions<S3Config>) {
    this.logger = options.logger;
    // copy so we don't mutate
    if (!config) {
      throw new Error('s3 storage missing config. Add `store.s3-storage` to your config file');
    }
    this.config = Object.assign({}, config.store['aws-s3-storage']);
    if (!this.config.bucket) {
      throw new Error('s3 storage requires a bucket');
    }
    const configKeyPrefix = this.config.keyPrefix;
    this._localData = null;
    this.config.keyPrefix =
      configKeyPrefix != null ? (configKeyPrefix.endsWith('/') ? configKeyPrefix : `${configKeyPrefix}/`) : '';

    this.logger.debug({ config: JSON.stringify(this.config, null, 4) }, 's3: configuration: @{config}');

    this.s3 = new S3({
      endpoint: this.config.endpoint,
      region: this.config.region,
      s3ForcePathStyle: this.config.s3ForcePathStyle,
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
    });
  }

  public async getSecret(): Promise<string> {
    return Promise.resolve((await this._getData()).secret);
  }

  public async setSecret(secret: string): Promise<void> {
    (await this._getData()).secret = secret;
    await this._sync();
  }

  public add(name: string, callback: Callback): void {
    this.logger.debug({ name }, 's3: [add] private package @{name}');
    // s3 backend doesn't need explicitly add a package
    callback(null);
  }

  public async search(onPackage: Function, onEnd: Function): Promise<void> {
    this.logger.debug('s3: [search]');
    const packageList = await this._getPackageList();
    const storageInfoMap = packageList.map(this._fetchPackageInfo.bind(this, onPackage));
    this.logger.debug({ l: storageInfoMap.length }, 's3: [search] storageInfoMap length is @{l}');
    await Promise.all(storageInfoMap);
    onEnd();
  }

  private async _fetchPackageInfo(onPackage: Function, packageName: string): Promise<void> {
    const { bucket, keyPrefix } = this.config;
    this.logger.debug({ packageName }, 's3: [_fetchPackageInfo] @{packageName}');
    this.logger.trace({ keyPrefix, bucket }, 's3: [_fetchPackageInfo] bucket: @{bucket} prefix: @{keyPrefix}');
    return new Promise((resolve): void => {
      this.s3.headObject(
        {
          Bucket: bucket,
          Key: `${keyPrefix + packageName}/package.json`,
        },
        (err, response) => {
          if (err) {
            this.logger.debug({ err }, 's3: [_fetchPackageInfo] error: @{err}');
            return resolve();
          }
          if (response.LastModified) {
            const { LastModified } = response;
            this.logger.trace({ LastModified }, 's3: [_fetchPackageInfo] LastModified: @{LastModified}');
            return onPackage(
              {
                name: packageName,
                path: packageName,
                time: LastModified.getTime(),
              },
              resolve
            );
          }
          resolve();
        }
      );
    });
  }

  public remove(name: string, callback: Callback): void {
    this.logger.debug({ name }, 's3: [remove] @{name}');
    // s3 backend doesn't need explicitly remove a package
    callback(null);
  }

  public get(callback: Callback): void {
    this.logger.debug('s3: [get]');
    this._getPackageList().then(list => callback(null, list));
  }

  // Create/write database file to s3
  private async _sync(): Promise<void> {
    await new Promise((resolve, reject): void => {
      const { bucket, keyPrefix } = this.config;
      this.logger.debug({ keyPrefix, bucket }, 's3: [_sync] bucket: @{bucket} prefix: @{keyPrefix}');
      this.s3.putObject(
        {
          Bucket: this.config.bucket,
          Key: `${this.config.keyPrefix}verdaccio-s3-db.json`,
          Body: JSON.stringify(this._localData),
        },
        err => {
          if (err) {
            this.logger.error({ err }, 's3: [_sync] error: @{err}');
            reject(err);
            return;
          }
          this.logger.debug('s3: [_sync] sucess');
          resolve();
        }
      );
    });
  }

  // returns an instance of a class managing the storage for a single package
  public getPackageStorage(packageName: string): S3PackageManager {
    this.logger.debug({ packageName }, 's3: [getPackageStorage] @{packageName}');

    return new S3PackageManager(this.config, packageName, this.logger);
  }

  private async _getData(): Promise<LocalStorage> {
    if (!this._localData) {
      this._localData = await new Promise((resolve, reject): void => {
        const { bucket, keyPrefix } = this.config;
        this.logger.debug({ keyPrefix, bucket }, 's3: [_getData] bucket: @{bucket} prefix: @{keyPrefix}');
        this.logger.trace('s3: [_getData] get database object');
        this.s3.getObject(
          {
            Bucket: bucket,
            Key: `${keyPrefix}verdaccio-s3-db.json`,
          },
          (err, response) => {
            if (err) {
              const s3Err: VerdaccioError = convertS3Error(err);
              this.logger.error({ s3Err }, 's3: [_getData] err: @{err}');
              if (is404Error(s3Err)) {
                this.logger.error('s3: [_getData] err 404 create new database');
                resolve({ list: [], secret: '' });
              } else {
                reject(err);
              }
              return;
            }

            const body = response.Body ? response.Body.toString() : '';
            const data = JSON.parse(body);
            this.logger.trace({ body }, 's3: [_getData] get data @{body}');
            resolve(data);
          }
        );
      });
    } else {
      this.logger.trace('s3: [_getData] already exist');
    }

    return this._localData as LocalStorage;
  }

  private async _getPackageList(): Promise<any> {
    const { bucket, keyPrefix } = this.config;
    const listPath = keyPrefix.endsWith('/') ? keyPrefix : '/';
    this.logger.debug({ keyPrefix, bucket }, 's3: [_getPackageList] bucket: @{bucket} prefix: @{keyPrefix} listPath: @{listPath}');
    const lister = s3ls({ bucket, s3: this.s3 });
    const { files, folders } = await lister.ls(listPath);
    // folders: ['prefix/package-a/', 'prefix/package-b/', ...]
    if (!folders) return [];
    else return folders.map(function(folder) {
      return folder.split('/').slice(-2)[0];
    })
  }

  public saveToken(token: Token): Promise<void> {
    this.logger.warn({ token }, 'save token has not been implemented yet @{token}');

    return Promise.reject(getServiceUnavailable('[saveToken] method not implemented'));
  }

  public deleteToken(user: string, tokenKey: string): Promise<void> {
    this.logger.warn({ tokenKey, user }, 'delete token has not been implemented yet @{user}');

    return Promise.reject(getServiceUnavailable('[deleteToken] method not implemented'));
  }

  public readTokens(filter: TokenFilter): Promise<Token[]> {
    this.logger.warn({ filter }, 'read tokens has not been implemented yet @{filter}');

    return Promise.reject(getServiceUnavailable('[readTokens] method not implemented'));
  }
}
