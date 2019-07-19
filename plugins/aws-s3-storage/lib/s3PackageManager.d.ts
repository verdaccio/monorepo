import { Callback, Logger, Package, ILocalPackageManager } from '@verdaccio/types';
import { S3Config } from './config';
export default class S3PackageManager implements ILocalPackageManager {
    config: S3Config;
    logger: Logger;
    private packageName;
    private s3;
    constructor(config: S3Config, packageName: string, logger: Logger);
    updatePackage(name: string, updateHandler: Callback, onWrite: Callback, transformPackage: Function, onEnd: Callback): void;
    private _getData;
    deletePackage(fileName: string, callback: Callback): void;
    removePackage(callback: Callback): void;
    createPackage(name: string, value: Package, callback: Function): void;
    savePackage(name: string, value: Package, callback: Function): void;
    readPackage(name: string, callback: Function): void;
    writeTarball(name: string): any;
    readTarball(name: string): any;
}
