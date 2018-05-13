// @flow

import createError from 'http-errors';

import { UploadTarball, ReadTarball } from '@verdaccio/streams';

import type { HttpError } from 'http-errors';
import type { IUploadTarball, IReadTarball } from '@verdaccio/streams';
import type { StorageList, Package, Callback, Logger } from '@verdaccio/types';
import type { ILocalPackageManager } from '@verdaccio/local-storage';
import type { ConfigGoogleStorage } from '../types';

export const noSuchFile: string = 'ENOENT';
export const fileExist: string = 'EEXISTS';

declare type StorageType = Package | void;

const fSError = function(message: string, code: number = 404): HttpError {
  const err: HttpError = createError(code, message);
  // $FlowFixMe
  err.code = message;

  return err;
};

const noPackageFoundError = function(message = 'no such package') {
  const err: HttpError = createError(404, message);
  // $FlowFixMe
  err.code = noSuchFile;
  return err;
};

class GoogleCloudStorageHandler implements ILocalPackageManager {
  datastore: any;
  storage: any;
  path: StorageList;
  logger: Logger;
  key: string;
  helper: any;
  name: string;
  config: ConfigGoogleStorage;

  constructor(name: string, storage: any, datastore: any, helper: any, config: ConfigGoogleStorage, logger: Logger) {
    this.name = name;
    this.datastore = datastore;
    this.storage = storage;
    this.logger = logger;
    this.helper = helper;
    this.config = config;
    this.key = 'VerdaccioMetadataStore';
  }

  updatePackage(pkgFileName: string, updateHandler: Callback, onWrite: Callback, transformPackage: Function, onEnd: Callback): void {
    this._getStorage(pkgFileName)
      .then(storePkg => {
        if (typeof storePkg === 'undefined') {
          return onEnd(noPackageFoundError());
        }

        updateHandler(storePkg, err => {
          if (err) {
            return onEnd(err);
          }
          try {
            onWrite(pkgFileName, transformPackage(storePkg), onEnd);
          } catch (err) {
            return onEnd(fSError(err.message, 500));
          }
        });
      })
      .catch(err => {
        return onEnd(fSError(err.message, 500));
      });
  }

  deletePackage(name: string, cb: Callback): void {
    // FIXME: this should remove a tarball
    this._getStorage(name).then(storePkg => {
      if (storePkg) {
        const storePkgData = storePkg[this.datastore.KEY];
        this.helper
          .deleteEntity(this.key, storePkgData.id)
          .then(deleted => {
            if (deleted[0].mutationResults && deleted[0].mutationResults.length > 0) {
              cb(null);
            } else {
              cb(fSError('something went wrong', 500));
            }
          })
          .catch(err => {
            cb(fSError(err.message, 500));
          });
      } else {
        cb(noPackageFoundError());
      }
    });
    cb(null);
  }

  removePackage(callback: Callback): void {
    // callback(null);
    // TODO: here we need to remove tarballs from data store and
    // remove all files from storage
    // console.log('name', this.name);
    callback(null);
  }

  createPackage(name: string, value: Object, cb: Function): void {
    this.savePackage(name, value, cb);
  }

  savePackage(name: string, value: Object, cb: Function): void {
    this._savePackage(name, value)
      .then(() => {
        cb(null);
      })
      .catch(err => cb(err));
  }

  _savePackage(name: string, value: Object) {
    return new Promise(async (resolve, reject) => {
      const datastore = this.datastore;
      const storePkg: StorageType = await this._getStorage(name);

      const save = async (key, data, resolve, reject) => {
        const excludeFromIndexes = Object.keys(data);
        excludeFromIndexes.splice(0, 1);

        try {
          await datastore.save({
            key,
            excludeFromIndexes,
            data
          });
          resolve(null);
        } catch (err) {
          reject(fSError(err.message, 500));
        }
      };

      const update = async (key, data, resolve, reject) => {
        const excludeFromIndexes = Object.keys(data);
        excludeFromIndexes.splice(0, 1);

        try {
          await this.helper.updateEntity(key, excludeFromIndexes, data);
          resolve(null);
        } catch (err) {
          reject(fSError(err.message, 500));
        }
      };

      if (typeof storePkg === 'undefined') {
        const keyFromDataStore = datastore.key(this.key);
        await save(keyFromDataStore, value, resolve, reject);
        resolve();
      } else {
        const storePkgData = storePkg[this.datastore.KEY];
        const keyFromDataStore = datastore.key([this.key, datastore.int(storePkgData.id)]);
        await update(keyFromDataStore, value, resolve, reject);
        resolve();
      }
    });
  }

  readPackage(name: string, cb: Function): void {
    this._readPackage(name)
      .then(json => {
        cb(null, json);
      })
      .catch(err => {
        cb(err);
      });
  }

  async _readPackage(name: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const json = await this._getStorage(name);
      const isMissing = typeof json === 'undefined';

      try {
        isMissing ? reject(noPackageFoundError()) : resolve(json);
      } catch (err) {
        reject(noPackageFoundError());
      }
    });
  }

  writeTarball(name: string): IUploadTarball {
    const uploadStream: IUploadTarball = new UploadTarball();
    try {
      const file = this._getBucket().file(`${this.name}/${name}`);
      const fileStream = file.createWriteStream();
      uploadStream.done = function() {
        uploadStream.on('end', function() {
          fileStream.on('response', () => {
            uploadStream.emit('success');
          });
        });
      };

      fileStream._destroy = function(err) {
        // this is an error when user is not authenticated
        // [BadRequestError: Could not authenticate request
        //  getaddrinfo ENOTFOUND www.googleapis.com www.googleapis.com:443]
        if (err) {
          uploadStream.emit('error', fSError(err.message, 400));
          fileStream.emit('close');
        }
      };

      fileStream.on('open', () => {
        uploadStream.emit('open');
      });

      fileStream.on('error', err => {
        fileStream.end();
        uploadStream.emit('error', fSError(err, 400));
      });

      uploadStream.abort = function() {
        fileStream.destroy(fSError('transmision aborted', 400));
      };

      uploadStream.pipe(fileStream);
    } catch (err) {
      uploadStream.emit('error', err);
    }
    return uploadStream;
  }

  readTarball(name: string): IReadTarball {
    const readTarballStream: IReadTarball = new ReadTarball();
    const file = this._getBucket().file(`${this.name}/${name}`);
    const fileStream = file.createReadStream();

    readTarballStream.abort = function() {
      fileStream.destroy(fSError('transmision aborted', 400));
    };

    fileStream
      .on('error', function(err) {
        if (err.code === 404) {
          readTarballStream.emit('error', noPackageFoundError());
        } else {
          readTarballStream.emit('error', fSError(err.message, 400));
        }
      })
      .on('response', function(response) {
        const size = response.headers['content-length'];
        const { statusCode } = response;

        if (size) {
          readTarballStream.emit('open');
        }

        if (parseInt(size, 10) === 0) {
          readTarballStream.emit('error', fSError('file content empty', 500));
        } else if (parseInt(size, 10) > 0 && statusCode === 200) {
          readTarballStream.emit('content-length', response.headers['content-length']);
        }
      })
      .on('end', function() {
        readTarballStream.emit('end');
      })
      .pipe(readTarballStream);
    return readTarballStream;
  }

  async _getStorage(name: string = ''): Promise<StorageType> {
    const results = await this.helper.runQuery(this.helper.createQuery(this.key, name));

    if (results[0] && results[0].length > 0) {
      return results[0][0];
    }

    return;
  }

  _getBucket(): mixed {
    return this.storage.bucket(this.config.bucket);
  }
}

export default GoogleCloudStorageHandler;
