// @flow

// $FlowFixMe
import {ReadableStream, WritableStream} from 'memory-streams';
import type {StorageList, Package, Callback, Logger} from '@verdaccio/types';
import type {ILocalPackageManager} from '@verdaccio/local-storage';

class MemoryHandler implements ILocalPackageManager {

  data: any;
  path: StorageList;
  logger: Logger;

   constructor(data: StorageList, logger: Logger) {
     this.data = data;
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
     callback();
   }

   removePackage(callback: Callback): void {
      callback();
   }

   createPackage(name: string, value: any, cb: Function) {
     this.savePackage(name, value, cb);
   }

   savePackage(name: string, value: any, cb: Function) {
      this.data[name] = value;
      cb();
    }

    readPackage(name: string, cb: Function) {
      cb(this._getStorage(name));
    }

    writeTarball(name: string) {
      const writer = new WritableStream();

      writer.write(this._getStorage(name));

      return writer;
    }

    readTarball(name: string, readTarballStream: any, callback: Function = () => {}) {
      const json = this._getStorage(name);
      const readStream = new ReadableStream(JSON.stringify(json));

      return readStream;
    }

  _getStorage(name: string = ''): Package {
      return this.data[name];
   }

}

export default MemoryHandler;
