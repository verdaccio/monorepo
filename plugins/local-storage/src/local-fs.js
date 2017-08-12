// @flow

import fs from 'fs';
import path from 'path';

import mkdirp from 'mkdirp';
import createError from 'http-errors';
import type {HttpError} from 'http-errors';
import {UploadTarball, ReadTarball} from '@verdaccio/streams';
import {unlockFile, readFile} from '@verdaccio/file-locking';
import type {ILocalFS, Callback} from '@verdaccio/types';

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

   constructor(path: string) {
     this.path = path;
   }

   unlink(fileName: string, callback: Callback) {
     return fs.unlink(fileName, callback);
   }

   rmdir(dirPath: string, callback: Callback): void {
     fs.rmdir(dirPath, callback);
   }

   _getStorage(name: string) {
     return path.join(this.path, name || '');
   }

   createJSON(name: string, value: any, cb: Function) {
      this.createFile(this._getStorage(name), JSON.stringify(value, null, '\t'), cb);
   }

    updateJSON(name: string, value: any, cb: Function) {
      this.updateFile(this._getStorage(name), JSON.stringify(value, null, '\t'), cb);
    }

    writeJSON(name: string, value: any, cb: Function) {
      this.writeFile(this._getStorage(name), JSON.stringify(value, null, '\t'), cb);
    }

    readStorageFile(name: string): Promise<any> {
      return new Promise((resolve, reject) => {
        fs.readFile(this._getStorage(name), (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    }

    lock_and_read(name: string, cb: Function) {
      readFile(name, {lock: true}, function(err, res) {
        if (err) {
          return cb(err);
        }
        return cb(null, res);
      });
    }

    lockAndReadJSON(name: string, cb: Function) {
      readFile(name, {
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
      unlockFile(name, cb);
    }

    createFile(name: string, contents: any, callback: Function) {
      fs.exists(name, (exists) => {
        if (exists) {
          return callback( fSError(fileExist) );
        }
        this.writeFile(name, contents, callback);
      });
    }

    updateFile(name: string, contents: any, callback: Function) {
      fs.exists(name, (exists) => {
        if (!exists) {
          return callback( fSError(noSuchFile) );
        }
        this.writeFile(name, contents, callback);
      });
    }

    readJSON(name: string, cb: Function) {
      this.readStorageFile(name).then(function(res) {
        let args = [];
        try {
          args = [null, JSON.parse(res.toString('utf8'))];
        } catch (err) {
          args = [err];
        }
        cb(...args);
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

      fs.exists(name, function(exists) {
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
              renameTmp(temporalName, name, function(err) {
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
      let readStream = fs.createReadStream(name);
      readStream.on('error', function(err) {
        readTarballStream.emit('error', err);
      });
      readStream.on('open', function(fd) {
        fs.fstat(fd, function(err, stats) {
          if (err) return readTarballStream.emit('error', err);
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


    writeFile(dest: string, data: any, cb: Function) {
      const createTempFile = function(cb) {
        const tempFilePath = tempFile(dest);
        fs.writeFile(tempFilePath, data, function(err) {
          if (err) {
            return cb(err);
          }
          renameTmp(tempFilePath, dest, cb);
        });
      };

      createTempFile(function(err) {
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
