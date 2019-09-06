import createError, { HttpError } from 'http-errors';

import MemoryFileSystem from 'memory-fs';
import { UploadTarball, ReadTarball } from '@verdaccio/streams';
import { Callback, Logger, IPackageStorageManager, IUploadTarball, IReadTarball } from '@verdaccio/types';

export const noSuchFile = 'ENOENT';
export const fileExist = 'EEXISTS';

const fSError = function(message: string, code = 404): HttpError {
  const err: HttpError = createError(code, message);

  err.code = message;

  return err;
};

const noPackageFoundError = function(message = 'no such package'): HttpError {
  const err: HttpError = createError(404, message);

  err.code = noSuchFile;
  return err;
};

const fs = new MemoryFileSystem();

class MemoryHandler implements IPackageStorageManager {
  private data: any;
  private name: string;
  private path: string;
  public logger: Logger;

  public constructor(packageName: string, data: any, logger: Logger) {
    // this is not need it
    this.data = data;
    this.name = packageName;
    this.logger = logger;
    this.path = '/';
  }

  public updatePackage(
    pkgFileName: string,
    updateHandler: Callback,
    onWrite: Callback,
    transformPackage: Function,
    onEnd: Callback
  ): void {
    let json = this._getStorage(pkgFileName);

    try {
      json = JSON.parse(json);
    } catch (err) {
      return onEnd(err);
    }

    updateHandler(json, (err: any) => {
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

  public deletePackage(pkgName: string, callback: Callback): void {
    delete this.data[pkgName];
    callback(null);
  }

  public removePackage(callback: Callback): void {
    callback(null);
  }

  public createPackage(name: string, value: Record<string, any>, cb: Function): void {
    this.savePackage(name, value, cb);
  }

  public savePackage(name: string, value: Record<string, any>, cb: Function): void {
    try {
      const json: string = JSON.stringify(value, null, '\t');

      this.data[name] = json;
    } catch (err) {
      cb(fSError(err.message, 500));
    }

    cb(null);
  }

  public readPackage(name: string, cb: Function): void {
    const json = this._getStorage(name);
    const isJson = typeof json === 'undefined';

    try {
      cb(isJson ? noPackageFoundError() : null, JSON.parse(json));
    } catch (err) {
      cb(noPackageFoundError());
    }
  }

  public writeTarball(name: string): IUploadTarball {
    const uploadStream: IUploadTarball = new UploadTarball({});
    const temporalName = `/${name}`;

    process.nextTick(function() {
      fs.exists(temporalName, function(exists) {
        if (exists) {
          return uploadStream.emit('error', fSError(fileExist));
        }

        try {
          const file = fs.createWriteStream(temporalName);

          uploadStream.pipe(file);

          uploadStream.done = function(): void {
            const onEnd = function(): void {
              uploadStream.emit('success');
            };

            uploadStream.on('end', onEnd);
          };

          uploadStream.abort = function(): void {
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

  public readTarball(name: string): IReadTarball {
    const pathName = `/${name}`;

    const readTarballStream: IReadTarball = new ReadTarball({});

    process.nextTick(function() {
      fs.exists(pathName, function(exists) {
        if (!exists) {
          readTarballStream.emit('error', noPackageFoundError());
        } else {
          const readStream = fs.createReadStream(pathName);

          readTarballStream.emit('content-length', fs.data[name].length);
          readTarballStream.emit('open');
          readStream.pipe(readTarballStream);
          readStream.on('error', (error: any) => {
            readTarballStream.emit('error', error);
          });

          readTarballStream.abort = function(): void {
            readStream.destroy(fSError('read has been aborted', 400));
          };
        }
      });
    });

    return readTarballStream;
  }

  private _getStorage(name = ''): string {
    return this.data[name];
  }
}

export default MemoryHandler;
