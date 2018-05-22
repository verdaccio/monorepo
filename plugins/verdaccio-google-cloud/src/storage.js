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
export const pkgFileName = 'package.json';

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

const packageAlreadyExist = function(name, message = `${name} package already exist`) {
  const err: HttpError = createError(409, message);
  // $FlowFixMe
  err.code = fileExist;

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
      .then(
        storePkg => {
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
        },
        err => {
          onEnd(fSError(err.message, 500));
        }
      )
      .catch(err => {
        return onEnd(fSError(err.message, 500));
      });
  }

  deletePackage(fileName: string, cb: Callback): void {
    // this method should be able to remove package.json and a tarball
    // if name === package.json we want to remove
    if (fileName === pkgFileName) {
      this._getStorage(this.name).then(
        storePkg => {
          if (storePkg) {
            const storePkgData = storePkg[this.datastore.KEY];
            this.helper
              .deleteEntity(this.key, storePkgData.id)
              .then(deleted => {
                if (deleted[0].mutationResults && deleted[0].mutationResults.length > 0) {
                  return cb(null);
                } else {
                  return cb(fSError('something went wrong', 500));
                }
              })
              .catch(err => {
                return cb(fSError(err.message, 500));
              });
          } else {
            return cb(noPackageFoundError());
          }
        },
        err => {
          return cb(noPackageFoundError(err.message));
        }
      );
    } else {
      this._removeBucketFile(fileName).then(
        () => {
          cb(null);
        },
        err => {
          return cb(noPackageFoundError(err.message));
        }
      );
    }
  }

  async _removeBucketFile(name: string) {
    const file = this._getBucket().file(`${this.name}/${name}`);
    const apiResponse = await file.delete();
    const finalResponse = apiResponse[0];

    return finalResponse;
  }

  removePackage(callback: Callback): void {
    // remove all files from storage
    const file = this._getBucket().file(`${this.name}`);
    file.delete().then(
      () => {
        callback(null);
      },
      err => {
        console.log('removePackage:error', err);
        callback(fSError(err.message, 500));
      }
    );
  }

  createPackage(name: string, value: Object, cb: Function): void {
    this._readPackage(name).then(
      () => {
        cb(packageAlreadyExist(name));
      },
      err => {
        if (err.code === noSuchFile) {
          // we care only whether package do not exist and create it.
          this.savePackage(name, value, cb);
        }
      }
    );
  }

  savePackage(name: string, value: Object, cb: Function): void {
    this._savePackage(name, value)
      .then(() => {
        cb(null);
      })
      .catch(err => {
        return cb(err);
      });
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
        if (isMissing) {
          reject(noPackageFoundError());
        } else {
          resolve(json);
        }
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

  _getBucket(): any {
    return this.storage.bucket(this.config.bucket);
  }
}

export default GoogleCloudStorageHandler;
