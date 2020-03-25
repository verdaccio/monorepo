import { VerdaccioError, getBadRequest, getInternalError, getConflict, getNotFound } from '@verdaccio/commons-api';
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

const fs = new MemoryFileSystem();

export type DataHandler = {
  [key: string]: string;
};

class MemoryHandler implements IPackageStorageManager {
  private data: DataHandler;
  private name: string;
  private path: string;
  public logger: Logger;

  public constructor(packageName: string, data: DataHandler, logger: Logger) {
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

    updateHandler(pkg, (err: VerdaccioError) => {
      if (err) {
        return onEnd(err);
      }
      try {
        onWrite(pkgFileName, transformPackage(pkg), onEnd);
      } catch (err) {
        return onEnd(getInternalError('error on parse packument'));
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

  public createPackage(name: string, value: Package, cb: CallbackAction): void {
    this.savePackage(name, value, cb);
  }

  public savePackage(name: string, value: Package, cb: CallbackAction): void {
    try {
      const json: string = JSON.stringify(value, null, '\t');

      this.data[name] = json;
    } catch (err) {
      cb(getInternalError(err.message));
    }

    cb(null);
  }

  public readPackage(name: string, cb: ReadPackageCallback): void {
    const json = this._getStorage(name);
    const isJson = typeof json === 'undefined';

    try {
      cb(isJson ? getNotFound() : null, JSON.parse(json));
    } catch (err) {
      cb(getNotFound());
    }
  }

  public writeTarball(name: string): IUploadTarball {
    const uploadStream: IUploadTarball = new UploadTarball({});
    const temporalName = `/${name}`;

    process.nextTick(function () {
      fs.stat(temporalName, function (fileError, stats) {
        if (!fileError && stats) {
          return uploadStream.emit('error', getConflict());
        }

        try {
          const file = fs.createWriteStream(temporalName);

          uploadStream.pipe(file);

          uploadStream.done = function (): void {
            const onEnd = function (): void {
              uploadStream.emit('success');
            };

            uploadStream.on('end', onEnd);
          };

          uploadStream.abort = function (): void {
            uploadStream.emit('error', getBadRequest('transmision aborted'));
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

    process.nextTick(function () {
      fs.stat(pathName, function (fileError, stats) {
        if (fileError && !stats) {
          return readTarballStream.emit('error', getNotFound());
        }

        try {
          const readStream = fs.createReadStream(pathName);

          const contentLength: number = (fs.data[name] && fs.data[name].length) || 0;
          readTarballStream.emit('content-length', contentLength);
          readTarballStream.emit('open');
          readStream.pipe(readTarballStream);
          readStream.on('error', (error: VerdaccioError) => {
            readTarballStream.emit('error', error);
          });

          readTarballStream.abort = function (): void {
            readStream.destroy(getBadRequest('read has been aborted'));
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
