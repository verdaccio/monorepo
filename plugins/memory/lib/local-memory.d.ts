import MemoryHandler from './memory-handler';
import { Logger, Callback, Config, IPluginStorage } from '@verdaccio/types';
export declare type ConfigMemory = Config & {
    limit?: number;
};
export interface MemoryLocalStorage {
    files: any;
    secret: string;
    list: any;
}
declare class LocalMemory implements IPluginStorage<ConfigMemory> {
    path: string;
    limit: number;
    logger: Logger;
    data: MemoryLocalStorage;
    config: ConfigMemory;
    constructor(config: ConfigMemory, options: any);
    getSecret(): Promise<any>;
    setSecret(secret: string): Promise<any>;
    add(name: string, cb: Callback): void;
    search(onPackage: Callback, onEnd: Callback, validateName: any): void;
    remove(name: string, cb: Callback): void;
    get(cb: Callback): void;
    sync(): void;
    getPackageStorage(packageInfo: string): MemoryHandler;
    _createEmtpyDatabase(): MemoryLocalStorage;
}
export default LocalMemory;
