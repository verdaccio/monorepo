import { Config } from '../configuration';
import { IBasicAuth } from './auth';
import { IPlugin } from './commons';
import { IStorageManager } from './storage';

export interface IPluginMiddleware<T> extends IPlugin<T> {
  register_middlewares(app: any, auth: IBasicAuth<T>, storage: IStorageManager<T>): void;
}
