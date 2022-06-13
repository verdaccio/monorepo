import { Package } from '../manifest';
import { IPlugin } from './commons';

export interface IPluginStorageFilter<T> extends IPlugin<T> {
  filter_metadata(packageInfo: Package): Promise<Package>;
}
