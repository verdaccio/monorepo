// @flow

import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import request from 'request';
import type { Logger } from '@verdaccio/types';
import type { ConfigAudit, $RequestExtend, $ResponseExtend } from '../types';

export default class ProxyAudit {
  enabled: boolean;
  logger: Logger;

  constructor(config: ConfigAudit, options: any) {
    this.enabled = config.enabled || false;
  }

  register_middlewares(app: any, auth: any, storage: any) {
    const fetchAudit = (req: $RequestExtend, res: $ResponseExtend) => {
      const requestCallback = function(err, _res, body) {
        if (err) {
          res.status(500).end();
        }
        res.send(body);
      };

      const headers = req.headers;
      headers.host = 'https://registry.npmjs.org/';
      const fetchAu = request(
        {
          url: 'https://registry.npmjs.org/-/npm/v1/security/audits',
          method: 'POST',
          req,
          body: JSON.stringify(req.body),
          gzip: true,
          strictSSL: true
        },
        requestCallback
      );

      return fetchAu;
    };
    /* eslint new-cap:off */
    const router = express.Router();
    /* eslint new-cap:off */
    router.use(compression());
    router.use(bodyParser.json({ strict: false, limit: '50mb' }));
    router.post('/audits', (req: $RequestExtend, res: $ResponseExtend) => {
      if (this.enabled) {
        fetchAudit(req, res);
      } else {
        res.status(500).end();
      }
    });

    app.use('/-/npm/v1/security', router);
  }
}
