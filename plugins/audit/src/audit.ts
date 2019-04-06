import request from 'request';
import express, {Request, Response} from 'express';

import { Logger, IPluginMiddleware, IBasicAuth, IStorageManager, PluginOptions, Plugin, Config } from '@verdaccio/types';

export interface ConfigAudit extends Config {
    enabled: boolean
}

export default class ProxyAudit extends Plugin<ConfigAudit> implements IPluginMiddleware<ConfigAudit> {
  enabled: boolean;
  logger: Logger;

  constructor(config: ConfigAudit, options: PluginOptions<ConfigAudit>) {
    super(config, options);
    this.enabled = config.enabled || false;
    this.logger = options.logger;
  }

  register_middlewares(app: any, auth: IBasicAuth<ConfigAudit>, storage: IStorageManager<ConfigAudit>) {
    const fetchAudit = (req: Request, res: Response) => {
      const headers = req.headers;
      headers.host = 'https://registry.npmjs.org/';

      const requestOptions = {
        url: 'https://registry.npmjs.org/-/npm/v1/security/audits',
        method: req.method,
        proxy: auth.config.https_proxy,
        req,
        strictSSL: true
      };

      req.pipe(request(requestOptions)).pipe(res);
    };

    const handleAudit = (req: Request, res: Response) => {
      if (this.enabled) {
        fetchAudit(req, res);
      } else {
        res.status(500).end();
      }
    };

    /* eslint new-cap:off */
    const router = express.Router();
    /* eslint new-cap:off */
    router.post('/audits', handleAudit);

    router.post('/audits/quick', handleAudit);

    app.use('/-/npm/v1/security', router);
  }
}
