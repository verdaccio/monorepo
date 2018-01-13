// @flow

import createError from 'http-errors';

// $FlowFixMe
import MemoryFileSystem from 'memory-fs';
import {UploadTarball, ReadTarball} from '@verdaccio/streams';

import type {HttpError} from 'http-errors';
import type {StorageList, Package, Callback, Logger} from '@verdaccio/types';
import type {ILocalPackageManager} from '@verdaccio/local-storage';

const fs = new MemoryFileSystem();
const noSuchFile: string = 'ENOENT';
export const fileExist: string = 'EEXISTS';

const fSError = function(message: string, code: number = 404): HttpError {
  const err: HttpError = createError(code, message);
  // $FlowFixMe
  err.code = message;

  return err;
};

const ErrorCode = {
  get404: (customMessage) => {
    return fSError('no such package available', 404);
  },
};

const noPackageFoundError = function() {
  const err = new Error('no such package');
  // $FlowFixMe
  err.code = noSuchFile;
  return err;
};

class MemoryHandler implements ILocalPackageManager {

  data: any;
  name: string;
  path: StorageList;
  logger: Logger;

   constructor(packageName: string, data: StorageList, logger: Logger) {
     this.data = data;
     this.name = packageName;
     this.logger = logger;
   }

   updatePackage(
    name: string,
    updateHandler: Callback,
    onWrite: Callback,
    transformPackage: Function,
    onEnd: Callback) {
      const json = this._getStorage(name);

      updateHandler(json, (err) => {
        if (err) {
          return onEnd(err);
        }
        onWrite(name, transformPackage(json), onEnd);
      });
   }

   deletePackage(pkgName: string, callback: Callback) {
     delete this.data[pkgName];
     callback(null);
   }

   removePackage(callback: Callback): void {
      callback(null);
   }

   createPackage(name: string, value: any, cb: Function): void {
     this.savePackage(name, value, cb);
   }

   savePackage(name: string, value: any, cb: Function): void {
      this.data[name] = JSON.parse(JSON.stringify(value));
      cb(null);
    }

    readPackage(name: string, cb: Function): void {
      const json = this._getStorage(name);

      cb(typeof json === 'undefined' ? noPackageFoundError() : null, json);
    }

    writeTarball(name: string): stream$PassThrough {

      const uploadStream = new UploadTarball();
      const temporalName = `/${name}`;

      fs.exists(temporalName, function(exists) {
        if (exists) {
          return uploadStream.emit('error', fSError(fileExist));
        }

        try {
          const file = fs.createWriteStream(temporalName);

          uploadStream.pipe(file);

          uploadStream.done = function() {
            const onEnd = function() {
              uploadStream.emit('success');
            };

            uploadStream.on('end', onEnd);
          };

          uploadStream.abort = function() {
            file.end();
          };

        } catch(err) {
          uploadStream.emit('error', err);
        }
      });

      return uploadStream;
    }

    readTarball(name: string, readTarballStream: any, callback: Function = () => {}): stream$PassThrough  {
      const pathName: string = this._getStorage(name);

        const readStream = fs.createReadStream(pathName);

        readStream.on('error', function(err) {
          readTarballStream.emit('error', err);
        });

        readStream.on('open', function(fd) {
          fs.fstat(fd, function(err, stats) {
            if (err) {
              return readTarballStream.emit('error', err);
            }
            readTarballStream.emit('content-length', stats.size);
            readTarballStream.emit('open');
            readStream.pipe(readTarballStream);
          });
        });

        readTarballStream = new ReadTarball();

        readTarballStream.abort = function() {
          readStream.close();
        };

        return readTarballStream;
    }

  _getStorage(name: string = ''): Package {
      return this.data[name];
   }

}

export default MemoryHandler;
