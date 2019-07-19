import { Logger, IPluginMiddleware, IBasicAuth, IStorageManager, PluginOptions } from '@verdaccio/types';
import { ConfigAudit } from './types';
export default class ProxyAudit implements IPluginMiddleware<ConfigAudit> {
    enabled: boolean;
    logger: Logger;
    constructor(config: ConfigAudit, options: PluginOptions<ConfigAudit>);
    register_middlewares(app: any, auth: IBasicAuth<ConfigAudit>, storage: IStorageManager<ConfigAudit>): void;
}
