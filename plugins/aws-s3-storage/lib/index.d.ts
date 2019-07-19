import { Logger, Config, Callback, IPluginStorage, PluginOptions } from '@verdaccio/types';
import { S3Config } from './config';
import S3PackageManager from './s3PackageManager';
export default class S3Database implements IPluginStorage<S3Config> {
    logger: Logger;
    config: S3Config;
    private s3;
    private _localData;
    constructor(config: Config, options: PluginOptions<S3Config>);
    getSecret(): Promise<string>;
    setSecret(secret: string): Promise<void>;
    add(name: string, callback: Callback): void;
    search(onPackage: Function, onEnd: Function, validateName: Function): Promise<void>;
    private _fetchPackageInfo;
    remove(name: string, callback: Callback): void;
    get(callback: Callback): void;
    private _sync;
    getPackageStorage(packageName: string): S3PackageManager;
    private _getData;
}
