// @flow

import fs from 'fs';
import path from 'path';

import _ from 'lodash';
import mkdirp from 'mkdirp';
import createError from 'http-errors';
import { HttpError } from 'http-errors';
import { UploadTarball, ReadTarball } from '@verdaccio/streams';
import { unlockFile, readFile } from '@verdaccio/file-locking';
import { Callback, Logger, Package, ILocalPackageManager, CallbackError, IUploadTarball } from '@verdaccio/types';

export const fileExist = 'EEXISTS';
export const noSuchFile = 'ENOENT';
export const resourceNotAvailable = 'EAGAIN';
export const pkgFileName = 'package.json';

type CallbackFS = NodeJS.ErrnoException | null;

export const fSError = function(message: string, code: number = 409): HttpError {
  const err: HttpError = createError(code, message);
  // $FlowFixMe
  err.code = message;

  return err;
};

export const ErrorCode = {
  get503: () => {
    return fSError('resource temporarily unavailable', 500);
  },
  get404: () => {
    return fSError('no such package available', 404);
  }
};

const tempFile = function(str) {
  return `${str}.tmp${String(Math.random()).substr(2)}`;
};

const renameTmp = function(src, dst, _cb) {
  const cb = err => {
    if (err) {
      fs.unlink(src, function() {});
    }
    _cb(err);
  };

  if (process.platform !== 'win32') {
    return fs.rename(src, dst, cb);
  }

  // windows can't remove opened file,
  // but it seem to be able to rename it
  const tmp = tempFile(dst);
  fs.rename(dst, tmp, function(err) {
    fs.rename(src, dst, cb);
    if (!err) {
      fs.unlink(tmp, () => {});
    }
  });
};

export type ILocalFSPackageManager = ILocalPackageManager & { path: string };

export default class LocalFS implements ILocalFSPackageManager {
  path: string;
  logger: Logger;

  constructor(path: string, logger: Logger) {
    this.path = path;
    this.logger = logger;
  }

  /**
    *  This function allows to update the package thread-safely
      Algorithm:
      1. lock package.json for writing
      2. read package.json
      3. updateFn(pkg, cb), and wait for cb
      4. write package.json.tmp
      5. move package.json.tmp package.json
      6. callback(err?)
    * @param {*} name
    * @param {*} updateHandler
    * @param {*} onWrite
    * @param {*} transformPackage
    * @param {*} onEnd
    */
  updatePackage(name: string, updateHandler: Callback, onWrite: Callback, transformPackage: Function, onEnd: Callback) {
    this._lockAndReadJSON(pkgFileName, (err, json) => {
      let locked = false;
      const self = this;
      // callback that cleans up lock first
      const unLockCallback = function(lockError: Error) {
        const _args = arguments;

        if (locked) {
          self._unlockJSON(pkgFileName, function() {
            // ignore any error from the unlock
            onEnd.apply(lockError, _args);
          });
        } else {
          onEnd(..._args);
        }
      };

      if (!err) {
        locked = true;
      }

      if (_.isNil(err) === false) {
        if (err.code === resourceNotAvailable) {
          return unLockCallback(ErrorCode.get503());
        } else if (err.code === noSuchFile) {
          return unLockCallback(ErrorCode.get404());
        } else {
          return unLockCallback(err);
        }
      }

      updateHandler(json, err => {
        if (err) {
          return unLockCallback(err);
        }
        onWrite(name, transformPackage(json), unLockCallback);
      });
    });
  }

  deletePackage(fileName: string, callback: (err: NodeJS.ErrnoException | null) => void) {
    return fs.unlink(this._getStorage(fileName), callback);
  }

  removePackage(callback: (err: NodeJS.ErrnoException | null) => void): void {
    fs.rmdir(this._getStorage('.'), callback);
  }

  createPackage(name: string, value: Package, cb: Function) {
    this._createFile(this._getStorage(pkgFileName), this._convertToString(value), cb);
  }

  savePackage(name: string, value: Package, cb: Function) {
    this._writeFile(this._getStorage(pkgFileName), this._convertToString(value), cb);
  }

  readPackage(name: string, cb: Function) {
    this._readStorageFile(this._getStorage(pkgFileName)).then(
      function(res) {
        try {
          const data: any = JSON.parse(res.toString('utf8'));

          cb(null, data);
        } catch (err) {
          cb(err);
        }
      },
      function(err) {
        return cb(err);
      }
    );
  }

  writeTarball(name: string): IUploadTarball {
    const uploadStream = new UploadTarball({});

    let _ended = 0;
    uploadStream.on('end', function() {
      _ended = 1;
    });

    const pathName: string = this._getStorage(name);

    fs.exists(pathName, exists => {
      if (exists) {
        uploadStream.emit('error', fSError(fileExist));
      } else {
        const temporalName = path.join(this.path, `${name}.tmp-${String(Math.random()).replace(/^0\./, '')}`);
        const file = fs.createWriteStream(temporalName);
        const removeTempFile = () => fs.unlink(temporalName, function() {});
        let opened = false;
        uploadStream.pipe(file);

        uploadStream.done = function() {
          const onend = function() {
            file.on('close', function() {
              renameTmp(temporalName, pathName, function(err) {
                if (err) {
                  uploadStream.emit('error', err);
                } else {
                  uploadStream.emit('success');
                }
              });
            });
            file.end();
          };
          if (_ended) {
            onend();
          } else {
            uploadStream.on('end', onend);
          }
        };

        uploadStream.abort = function() {
          if (opened) {
            opened = false;
            file.on('close', function() {
              removeTempFile();
            });
          } else {
            // if the file does not recieve any byte never is opened and has to be removed anyway.
            removeTempFile();
          }
          file.end();
        };

        file.on('open', function() {
          opened = true;
          // re-emitting open because it's handled in storage.js
          uploadStream.emit('open');
        });

        file.on('error', function(err) {
          uploadStream.emit('error', err);
        });
      }
    });

    return uploadStream;
  }

  readTarball(name: string) {
    const pathName: string = this._getStorage(name);
    const readTarballStream = new ReadTarball({});

    const readStream = fs.createReadStream(pathName);

    readStream.on('error', function(err) {
      readTarballStream.emit('error', err);
    });

    readStream.on('open', function(fd) {
      fs.fstat(fd, function(err, stats) {
        if (_.isNil(err) === false) {
          return readTarballStream.emit('error', err);
        }
        readTarballStream.emit('content-length', stats.size);
        readTarballStream.emit('open');
        readStream.pipe(readTarballStream);
      });
    });

    readTarballStream.abort = function() {
      readStream.close();
    };

    return readTarballStream;
  }

  _createFile(name: string, contents: any, callback: Function) {
    fs.exists(name, exists => {
      if (exists) {
        return callback(fSError(fileExist));
      }
      this._writeFile(name, contents, callback);
    });
  }

  _readStorageFile(name: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile(name, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  _convertToString(value: Package): string {
    return JSON.stringify(value, null, '\t');
  }

  _getStorage(fileName: string = '') {
    const storagePath: string = path.join(this.path, fileName);

    return storagePath;
  }

  _writeFile(dest: string, data: string, cb: Function) {
    const createTempFile = cb => {
      const tempFilePath = tempFile(dest);

      fs.writeFile(tempFilePath, data, err => {
        if (err) {
          return cb(err);
        }
        renameTmp(tempFilePath, dest, cb);
      });
    };

    createTempFile(err => {
      if (err && err.code === noSuchFile) {
        mkdirp(path.dirname(dest), function(err) {
          if (err) {
            return cb(err);
          }
          createTempFile(cb);
        });
      } else {
        cb(err);
      }
    });
  }

  _lockAndReadJSON(name: string, cb: Function) {
    const fileName: string = this._getStorage(name);

    readFile(
      fileName,
      {
        lock: true,
        parse: true
      },
      function(err, res) {
        if (err) {
          return cb(err);
        }
        return cb(null, res);
      }
    );
  }

  _unlockJSON(name: string, cb: Function) {
    unlockFile(this._getStorage(name), cb);
  }
}
