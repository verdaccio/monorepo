// @flow

import createError from 'http-errors';

import { UploadTarball, ReadTarball } from '@verdaccio/streams';

import type { HttpError } from 'http-errors';
import type { StorageList, Package, Callback, Logger } from '@verdaccio/types';
import type { ILocalPackageManager } from '@verdaccio/local-storage';

export const noSuchFile: string = 'ENOENT';
export const fileExist: string = 'EEXISTS';

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

  constructor(name: string, storage: any, datastore: any, helper: any, config, any, logger: Logger) {
    this.name = name;
    this.datastore = datastore;
    this.storage = storage;
    this.logger = logger;
    this.helper = helper;
    this.config = config;
    this.key = 'VerdaccioMetadataStore';
  }

  async updatePackage(pkgFileName: string, updateHandler: Callback, onWrite: Callback, transformPackage: Function, onEnd: Callback): void {
    try {
      const storePkg = await this._getStorage(pkgFileName);

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
    } catch (err) {
      return onEnd(fSError(err.message, 500));
    }
  }

  async deletePackage(name: string, cb: Callback) {
    const storePkg = await this._getStorage(name);

    if (storePkg) {
      try {
        const storePkgData = storePkg[this.datastore.KEY];
        const deleted = await this.helper.deleteEntity(this.key, storePkgData.id);

        if (deleted[0].mutationResults && deleted[0].mutationResults.length > 0) {
          cb(null);
        } else {
          cb(fSError('something went wrong', 500));
        }
      } catch (err) {
        cb(fSError(err.message, 500));
      }
    } else {
      cb(noPackageFoundError());
    }
  }

  async removePackage(callback: Callback): void {
    // callback(null);
    // TODO: here we need to remove the json from data store and
    // remove all files from storage
    console.log('name', this.name);
    callback(null);
  }

  createPackage(name: string, value: Object, cb: Function): void {
    this.savePackage(name, value, cb);
  }

  async savePackage(name: string, value: Object, cb: Function): void {
    const datastore = this.datastore;
    const storePkg = await this._getStorage(name);
    const isExist = typeof storePkg !== 'undefined';
    const save = async (key, data, cb) => {
      const excludeFromIndexes = Object.keys(data);
      excludeFromIndexes.splice(0, 1);

      try {
        await datastore.save({
          key,
          excludeFromIndexes,
          data
        });
        cb(null);
      } catch (err) {
        cb(fSError(err.message, 500));
      }
    };

    const update = async (key, data, cb) => {
      const excludeFromIndexes = Object.keys(data);
      excludeFromIndexes.splice(0, 1);

      try {
        await this.helper.updateEntity(key, excludeFromIndexes, data);
        cb(null);
      } catch (err) {
        cb(fSError(err.message, 500));
      }
    };

    if (!isExist) {
      const keyFromDataStore = datastore.key(this.key);
      await save(keyFromDataStore, value, cb);
    } else {
      const storePkgData = storePkg[this.datastore.KEY];
      const keyFromDataStore = datastore.key([this.key, datastore.int(storePkgData.id)]);
      await update(keyFromDataStore, value, cb);
    }
  }

  async readPackage(name: string, cb: Function): void {
    const json = await this._getStorage(name);
    const isMissing = typeof json === 'undefined';

    try {
      cb(isMissing ? noPackageFoundError() : null, json);
    } catch (err) {
      cb(noPackageFoundError());
    }
  }

  async writeTarball(name: string) {

    // const uploadStream = new UploadTarball();
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
    // return uploadStream;
  }

  readTarball(name: string) {
    // const pathName = `/${name}`;
    // const readTarballStream = new ReadTarball();
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
    // return readTarballStream;
  }

  async _getStorage(name: string = ''): Package {
    const results = await this.helper.runQuery(this.helper.createQuery(this.key, name));

    if (results[0] && results[0].length > 0) {
      // console.log('aaa->', results[0].length);
      return results[0][0];
    }

    return;
  }
}

export default GoogleCloudStorageHandler;
