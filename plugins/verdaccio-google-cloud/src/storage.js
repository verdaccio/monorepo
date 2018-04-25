// @flow

import createError from 'http-errors';

import { UploadTarball, ReadTarball } from '@verdaccio/streams';

import type { HttpError } from 'http-errors';
import type { IUploadTarball, IReadTarball } from '@verdaccio/streams';
import type { StorageList, Package, Callback, Logger } from '@verdaccio/types';
import type { ILocalPackageManager } from '@verdaccio/local-storage';
import type { ConfigMemory } from './storage-helper';

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
  config: ConfigMemory;

  constructor(name: string, storage: any, datastore: any, helper: any, config: any, logger: Logger) {
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
  }

  removePackage(callback: Callback): void {
    // callback(null);
    // TODO: here we need to remove the json from data store and
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
    // const temporalName = `/${name}`;
    // process.nextTick(function() {
    //   fs.exists(temporalName, function(exists) {
    //     if (exists) {
    //       return uploadStream.emit('error', fSError(fileExist));
    //     }
    //     try {
    //       const file = fs.createWriteStream(temporalName);
    //       uploadStream.pipe(file);
    //       uploadStream.done = function() {
    //         const onEnd = function() {
    //           uploadStream.emit('success');
    //         };
    //         uploadStream.on('end', onEnd);
    //       };
    //       uploadStream.abort = function() {
    //         uploadStream.emit('error', fSError('transmision aborted', 400));
    //         file.end();
    //       };
    //       uploadStream.emit('open');
    //     } catch (err) {
    //       uploadStream.emit('error', err);
    //     }
    //   });
    // });
    return uploadStream;
  }

  readTarball(name: string): IReadTarball {
    // const pathName = `/${name}`;
    const readTarballStream: IReadTarball = new ReadTarball();
    // process.nextTick(function() {
    //   fs.exists(pathName, function(exists) {
    //     if (!exists) {
    //       readTarballStream.emit('error', noPackageFoundError());
    //     } else {
    //       const readStream = fs.createReadStream(pathName);
    //       readTarballStream.emit('content-length', fs.data[name].length);
    //       readTarballStream.emit('open');
    //       readStream.pipe(readTarballStream);
    //       readStream.on('error', error => {
    //         readTarballStream.emit('error', error);
    //       });
    //       readTarballStream.abort = function() {
    //         readStream.destroy(fSError('read has been aborted', 400));
    //       };
    //     }
    //   });
    // });
    return readTarballStream;
  }

  async _getStorage(name: string = ''): Promise<StorageType> {
    const results = await this.helper.runQuery(this.helper.createQuery(this.key, name));

    if (results[0] && results[0].length > 0) {
      // console.log('aaa->', results[0].length);
      return results[0][0];
    }

    return;
  }
}

export default GoogleCloudStorageHandler;
