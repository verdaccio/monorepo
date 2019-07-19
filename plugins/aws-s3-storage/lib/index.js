"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _commonsApi = require("@verdaccio/commons-api");

var _awsSdk = require("aws-sdk");

var _s3PackageManager = _interopRequireDefault(require("./s3PackageManager"));

var _s3Errors = require("./s3Errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class S3Database {
  constructor(config, options) {
    _defineProperty(this, "logger", void 0);

    _defineProperty(this, "config", void 0);

    _defineProperty(this, "s3", void 0);

    _defineProperty(this, "_localData", void 0);

    this.logger = options.logger; // copy so we don't mutate

    if (!config) {
      throw new Error('s3 storage missing config. Add `store.s3-storage` to your config file');
    }

    this.config = Object.assign({}, config.store['aws-s3-storage']);

    if (!this.config.bucket) {
      throw new Error('s3 storage requires a bucket');
    }

    const configKeyPrefix = this.config.keyPrefix;
    this._localData = null;
    this.config.keyPrefix = configKeyPrefix != null ? configKeyPrefix.endsWith('/') ? configKeyPrefix : `${configKeyPrefix}/` : '';
    this.logger.debug({
      config: JSON.stringify(this.config, null, 4)
    }, 's3: configuration: @{config}');
    this.s3 = new _awsSdk.S3({
      endpoint: this.config.endpoint,
      region: this.config.region,
      s3ForcePathStyle: this.config.s3ForcePathStyle,
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey
    });
  }

  async getSecret() {
    return Promise.resolve((await this._getData()).secret);
  }

  async setSecret(secret) {
    (await this._getData()).secret = secret;
    await this._sync();
  }

  add(name, callback) {
    this.logger.debug({
      name
    }, 's3: [add] private package @{name}');

    this._getData().then(async data => {
      if (data.list.indexOf(name) === -1) {
        data.list.push(name);
        this.logger.trace({
          name
        }, 's3: [add] @{name} has been added');

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

  async search(onPackage, onEnd, validateName) {
    this.logger.debug('s3: [search]');
    const storage = await this._getData();
    const storageInfoMap = storage.list.map(this._fetchPackageInfo.bind(this, onPackage));
    this.logger.debug({
      l: storageInfoMap.length
    }, 's3: [search] storageInfoMap length is @{l}');
    await Promise.all(storageInfoMap);
    onEnd();
  }

  async _fetchPackageInfo(onPackage, packageName) {
    const {
      bucket,
      keyPrefix
    } = this.config;
    this.logger.debug({
      packageName
    }, 's3: [_fetchPackageInfo] @{packageName}');
    this.logger.trace({
      keyPrefix,
      bucket
    }, 's3: [_fetchPackageInfo] bucket: @{bucket} prefix: @{keyPrefix}');
    return new Promise(resolve => {
      this.s3.headObject({
        Bucket: bucket,
        Key: `${keyPrefix + packageName}/package.json`
      }, (err, response) => {
        if (err) {
          this.logger.debug({
            err
          }, 's3: [_fetchPackageInfo] error: @{err}');
          return resolve();
        }

        if (response.LastModified) {
          const {
            LastModified
          } = response;
          this.logger.trace({
            LastModified
          }, 's3: [_fetchPackageInfo] LastModified: @{LastModified}');
          return onPackage({
            name: packageName,
            path: packageName,
            time: LastModified.getTime()
          }, resolve);
        }

        resolve();
      });
    });
  }

  remove(name, callback) {
    this.logger.debug({
      name
    }, 's3: [remove] @{name}');
    this.get(async (err, data) => {
      if (err) {
        this.logger.error({
          err
        }, 's3: [remove] error: @{err}');
        callback((0, _commonsApi.getInternalError)('something went wrong on remove a package'));
      }

      const pkgName = data.indexOf(name);

      if (pkgName !== -1) {
        const data = await this._getData();
        data.list.splice(pkgName, 1);
        this.logger.debug({
          pkgName
        }, 's3: [remove] sucessfully removed @{pkgName}');
      }

      try {
        this.logger.trace('s3: [remove] starting sync');
        await this._sync();
        this.logger.trace('s3: [remove] finish sync');
        callback(null);
      } catch (err) {
        this.logger.error({
          err
        }, 's3: [remove] sync error: @{err}');
        callback(err);
      }
    });
  }

  get(callback) {
    this.logger.debug('s3: [get]');

    this._getData().then(data => callback(null, data.list));
  } // Create/write database file to s3


  async _sync() {
    await new Promise((resolve, reject) => {
      const {
        bucket,
        keyPrefix
      } = this.config;
      this.logger.debug({
        keyPrefix,
        bucket
      }, 's3: [_sync] bucket: @{bucket} prefix: @{keyPrefix}');
      this.s3.putObject({
        Bucket: this.config.bucket,
        Key: `${this.config.keyPrefix}verdaccio-s3-db.json`,
        Body: JSON.stringify(this._localData)
      }, (err, data) => {
        if (err) {
          this.logger.error({
            err
          }, 's3: [_sync] error: @{err}');
          reject(err);
          return;
        }

        this.logger.debug('s3: [_sync] sucess');
        resolve();
      });
    });
  } // returns an instance of a class managing the storage for a single package


  getPackageStorage(packageName) {
    this.logger.debug({
      packageName
    }, 's3: [getPackageStorage] @{packageName}');
    return new _s3PackageManager.default(this.config, packageName, this.logger);
  }

  async _getData() {
    if (!this._localData) {
      this._localData = await new Promise((resolve, reject) => {
        const {
          bucket,
          keyPrefix
        } = this.config;
        this.logger.debug({
          keyPrefix,
          bucket
        }, 's3: [_getData] bucket: @{bucket} prefix: @{keyPrefix}');
        this.logger.trace('s3: [_getData] get database object');
        this.s3.getObject({
          Bucket: bucket,
          Key: `${keyPrefix}verdaccio-s3-db.json`
        }, (err, response) => {
          if (err) {
            const s3Err = (0, _s3Errors.convertS3Error)(err);
            this.logger.error({
              s3Err
            }, 's3: [_getData] err: @{err}');

            if ((0, _s3Errors.is404Error)(s3Err)) {
              this.logger.error('s3: [_getData] err 404 create new database');
              resolve({
                list: [],
                secret: ''
              });
            } else {
              reject(err);
            }

            return;
          } // @ts-ignore


          const body = response.Body.toString();
          const data = JSON.parse(body);
          this.logger.trace({
            body
          }, 's3: [_getData] get data @{body}');
          resolve(data);
        });
      });
    } else {
      this.logger.trace('s3: [_getData] already exist');
    }

    return this._localData;
  }

}

exports.default = S3Database;