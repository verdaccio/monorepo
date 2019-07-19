import { Callback, Logger, IPackageStorageManager, IUploadTarball, IReadTarball } from '@verdaccio/types';
export declare const noSuchFile = "ENOENT";
export declare const fileExist = "EEXISTS";
declare class MemoryHandler implements IPackageStorageManager {
    data: any;
    name: string;
    path: string;
    logger: Logger;
    constructor(packageName: string, data: any, logger: Logger);
    updatePackage(pkgFileName: string, updateHandler: Callback, onWrite: Callback, transformPackage: Function, onEnd: Callback): void;
    deletePackage(pkgName: string, callback: Callback): void;
    removePackage(callback: Callback): void;
    createPackage(name: string, value: Record<string, any>, cb: Function): void;
    savePackage(name: string, value: Record<string, any>, cb: Function): void;
    readPackage(name: string, cb: Function): void;
    writeTarball(name: string): IUploadTarball;
    readTarball(name: string): IReadTarball;
    _getStorage(name?: string): string;
}
export default MemoryHandler;
