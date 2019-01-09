// @flow

import express from 'express';
import request from 'request';
import type { Logger, IPluginMiddleware, IBasicAuth, IStorageManager } from '@verdaccio/types';
import type { ConfigAudit, $RequestExtend, $ResponseExtend } from '../types';

export default class ProxyAudit implements IPluginMiddleware {
  enabled: boolean;
  logger: Logger;

  constructor(config: ConfigAudit, options: any) {
    this.enabled = config.enabled || false;
  }

  register_middlewares(app: any, auth: IBasicAuth, storage: IStorageManager) {
    const fetchAudit = (req: $RequestExtend, res: $ResponseExtend) => {
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

    const handleAudit = (req: $RequestExtend, res: $ResponseExtend) => {
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
