// @flow

import fs from 'fs';
import path from 'path';

import _ from 'lodash';
import mkdirp from 'mkdirp';
import createError from 'http-errors';
import type {HttpError} from 'http-errors';
import {UploadTarball, ReadTarball} from '@verdaccio/streams';
import {unlockFile, readFile} from '@verdaccio/file-locking';
import type {ILocalFS, Callback, Logger} from '@verdaccio/types';

const fileExist: string = 'EEXISTS';
const noSuchFile: string = 'ENOENT';

const fSError = function(message: string): HttpError {
  const err: HttpError = createError(409, message);
  return err;
};

const tempFile = function(str) {
  return `${str}.tmp${String(Math.random()).substr(2)}`;
};

const renameTmp = function(src, dst, _cb) {
   const cb = function(err) {
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

// fs
// module.exports.unlink = fs.unlink;
// module.exports.rmdir = fs.rmdir;


class LocalFS implements ILocalFS {

  path: string;
  logger: Logger;

   constructor(path: string, logger: Logger) {
     this.path = path;
     this.logger = logger;
   }

   unlink(fileName: string, callback: Callback) {
     return fs.unlink(this._getStorage(fileName), callback);
   }

   rmdir(dirPath: string, callback: Callback): void {
     fs.rmdir(this._getStorage(dirPath), callback);
   }

   createJSON(name: string, value: any, cb: Function) {
      this._createFile(this._getStorage(name), JSON.stringify(value, null, '\t'), cb);
   }

    updateJSON(name: string, value: any, cb: Function) {
      this._updateFile(this._getStorage(name), JSON.stringify(value, null, '\t'), cb);
    }

    writeJSON(name: string, value: any, cb: Function) {
      this._writeFile(this._getStorage(name), JSON.stringify(value, null, '\t'), cb);
    }

    readStorageFile(name: string): Promise<any> {
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

    lock_and_read(name: string, cb: Function) {
      readFile(this._getStorage(name), {lock: true}, function(err, res) {
        if (err) {
          return cb(err);
        }
        return cb(null, res);
      });
    }

    lockAndReadJSON(name: string, cb: Function) {
      readFile(this._getStorage(name), {
        lock: true,
        parse: true,
      }, function(err, res) {
        if (err) {
          return cb(err);
        }
        return cb(null, res);
      });
    }

    unlock_file(name: string, cb: Function) {
      unlockFile(this._getStorage(name), cb);
    }

    _createFile(name: string, contents: any, callback: Function) {
      fs.exists(name, (exists) => {
        if (exists) {
          return callback( fSError(fileExist) );
        }
        this._writeFile(name, contents, callback);
      });
    }

    _updateFile(name: string, contents: any, callback: Function) {
      this.logger.debug('_updateFile:pathName', name);
      fs.exists(name, (exists) => {
        if (!exists) {
          return callback( fSError(noSuchFile) );
        }
        this._writeFile(name, contents, callback);
      });
    }

    readJSON(name: string, cb: Function) {
      this.readStorageFile(this._getStorage(name)).then(function(res) {
        try {
          const data: any = JSON.parse(res.toString('utf8'));

          cb(null, data);
        } catch (err) {
          cb(err);
        }
      }, function(err) {
        return cb(err);
      });
    }

    createWriteStream(name: string): UploadTarball {
      const uploadStream = new UploadTarball();

      let _ended = 0;
      uploadStream.on('end', function() {
        _ended = 1;
      });

      const pathName: string = this._getStorage(name);

      fs.exists(pathName, function(exists) {
        if (exists) {
          return uploadStream.emit('error', fSError(fileExist));
        }

        const temporalName = `${name}.tmp-${String(Math.random()).replace(/^0\./, '')}`;
        const file = fs.createWriteStream(temporalName);
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
              fs.unlink(temporalName, function() {});
            });
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
      });
      return uploadStream;
    }

    createReadStream(name: string, readTarballStream: any, callback: Function = () => {}) {
      const pathName: string = this._getStorage(name);

      let readStream = fs.createReadStream(pathName);
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

      readTarballStream = new ReadTarball();
      readTarballStream.abort = function() {
        readStream.close();
      };
      return readTarballStream;
    }

    _getStorage(name: string = '') {
      const storagePath: string = path.join(this.path, name);

      return storagePath;
   }

    _writeFile(dest: string, data: any, cb: Function) {
      const createTempFile = (cb) => {
        const tempFilePath = tempFile(dest);

        fs.writeFile(tempFilePath, data, function(err) {
          if (err) {
            return cb(err);
          }
          renameTmp(tempFilePath, dest, cb);
        });
      };

      createTempFile((err) => {
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

}

export default LocalFS;
