// @flow

import createError from 'http-errors';

// $FlowFixMe
import MemoryFileSystem from 'memory-fs';
import { UploadTarball, ReadTarball } from '@verdaccio/streams';

import type { HttpError } from 'http-errors';
import type { Callback, Logger } from '@verdaccio/types';
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

const fs = new MemoryFileSystem();

class MemoryHandler implements ILocalPackageManager {
  data: any;
  name: string;
  path: string;
  logger: Logger;

  constructor(packageName: string, data: any, logger: Logger) {
    // this is not need it
    this.data = data;
    this.name = packageName;
    this.logger = logger;
  }

  updatePackage(pkgFileName: string, updateHandler: Callback, onWrite: Callback, transformPackage: Function, onEnd: Callback): void {
    let json = this._getStorage(pkgFileName);

    try {
      json = JSON.parse(json);
    } catch (err) {
      return onEnd(err);
    }

    updateHandler(json, err => {
      if (err) {
        return onEnd(err);
      }
      try {
        onWrite(pkgFileName, transformPackage(json), onEnd);
      } catch (err) {
        return onEnd(fSError('error on parse', 500));
      }
    });
  }

  deletePackage(pkgName: string, callback: Callback) {
    delete this.data[pkgName];
    callback(null);
  }

  removePackage(callback: Callback): void {
    callback(null);
  }

  createPackage(name: string, value: Object, cb: Function): void {
    this.savePackage(name, value, cb);
  }

  savePackage(name: string, value: Object, cb: Function): void {
    try {
      const json: string = JSON.stringify(value, null, '\t');

      this.data[name] = json;
    } catch (err) {
      cb(fSError(err.message, 500));
    }

    cb(null);
  }

  readPackage(name: string, cb: Function): void {
    const json = this._getStorage(name);
    const isJson = typeof json === 'undefined';

    try {
      cb(isJson ? noPackageFoundError() : null, JSON.parse(json));
    } catch (err) {
      cb(noPackageFoundError());
    }
  }

  writeTarball(name: string) {
    const uploadStream = new UploadTarball();
    const temporalName = `/${name}`;

    process.nextTick(function() {
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
            uploadStream.emit('error', fSError('transmision aborted', 400));
            file.end();
          };

          uploadStream.emit('open');
        } catch (err) {
          uploadStream.emit('error', err);
        }
      });
    });

    return uploadStream;
  }

  readTarball(name: string) {
    const pathName = `/${name}`;

    const readTarballStream = new ReadTarball();

    process.nextTick(function() {
      fs.exists(pathName, function(exists) {
        if (!exists) {
          readTarballStream.emit('error', noPackageFoundError());
        } else {
          const readStream = fs.createReadStream(pathName);

          readTarballStream.emit('content-length', fs.data[name].length);
          readTarballStream.emit('open');
          readStream.pipe(readTarballStream);
          readStream.on('error', error => {
            readTarballStream.emit('error', error);
          });

          readTarballStream.abort = function() {
            readStream.destroy(fSError('read has been aborted', 400));
          };
        }
      });
    });

    return readTarballStream;
  }

  _getStorage(name: string = ''): string {
    return this.data[name];
  }
}

export default MemoryHandler;
