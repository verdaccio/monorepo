import createError, { HttpError } from 'http-errors';
import MemoryFileSystem from 'memory-fs';
import { UploadTarball, ReadTarball } from '@verdaccio/streams';
import {
  Callback,
  Logger,
  IPackageStorageManager,
  IUploadTarball,
  IReadTarball,
  CallbackAction,
  StorageUpdateCallback,
  StorageWriteCallback,
  PackageTransformer,
  Package,
  ReadPackageCallback,
} from '@verdaccio/types';

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
    updateHandler: StorageUpdateCallback,
    onWrite: StorageWriteCallback,
    transformPackage: PackageTransformer,
    onEnd: CallbackAction
  ): void {
    const json: string = this._getStorage(pkgFileName);
    let pkg: Package;

    try {
      pkg = JSON.parse(json) as Package;
    } catch (err) {
      return onEnd(err);
    }

    updateHandler(pkg, (err: any) => {
      if (err) {
        return onEnd(err);
      }
      try {
        onWrite(pkgFileName, transformPackage(pkg), onEnd);
      } catch (err) {
        return onEnd(fSError('error on parse', 500));
      }
    });
  }

  public deletePackage(pkgName: string, callback: Callback): void {
    delete this.data[pkgName];
    callback(null);
  }

  public removePackage(callback: CallbackAction): void {
    callback(null);
  }

  public createPackage(name: string, value: Record<string, any>, cb: CallbackAction): void {
    this.savePackage(name, value, cb);
  }

  public savePackage(name: string, value: Record<string, any>, cb: CallbackAction): void {
    try {
      const json: string = JSON.stringify(value, null, '\t');

      this.data[name] = json;
    } catch (err) {
      cb(fSError(err.message, 500));
    }

    cb(null);
  }

  public readPackage(name: string, cb: ReadPackageCallback): void {
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
      fs.stat(temporalName, function(fileError, stats) {
        if (!fileError && stats) {
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
      fs.stat(pathName, function(fileError, stats) {
        if (fileError && !stats) {
          return readTarballStream.emit('error', noPackageFoundError());
        }

        try {
          const readStream = fs.createReadStream(pathName);

          const contentLength: number = (fs.data[name] && fs.data[name].length) || 0;
          readTarballStream.emit('content-length', contentLength);
          readTarballStream.emit('open');
          readStream.pipe(readTarballStream);
          readStream.on('error', (error: any) => {
            readTarballStream.emit('error', error);
          });

          readTarballStream.abort = function(): void {
            readStream.destroy(fSError('read has been aborted', 400));
          };
        } catch (err) {
          readTarballStream.emit('error', err);
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
