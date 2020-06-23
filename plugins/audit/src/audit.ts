import util from 'util';

import request from 'request';
import express, { Request, Response } from 'express';
import { Logger, IPluginMiddleware, IBasicAuth, PluginOptions } from '@verdaccio/types';

import { ConfigAudit } from './types';

// FUTURE: we should be able to overwrite this
export const REGISTRY_DOMAIN = 'https://registry.npmjs.org';
export const AUDIT_ENDPOINT = `/-/npm/v1/security/audits`;

export default class ProxyAudit implements IPluginMiddleware<ConfigAudit> {
  public enabled: boolean;
  public logger: Logger;
  public strict_ssl: boolean;

  public constructor(config: ConfigAudit, options: PluginOptions<ConfigAudit>) {
    this.enabled = config.enabled || false;
    this.strict_ssl = config.strict_ssl !== undefined ? config.strict_ssl : true;
    this.logger = options.logger;
  }

  public register_middlewares(app: any, auth: IBasicAuth<ConfigAudit>): void {
    const fetchAudit = (req: Request, res: Response & { report_error?: Function }): void => {
      const headers = req.headers;
      headers.host = 'https://registry.npmjs.org/';

      const requestOptions = {
        url: `${REGISTRY_DOMAIN}${AUDIT_ENDPOINT}`,
        method: req.method,
        proxy: auth?.config?.https_proxy,
        req,
        strictSSL: this.strict_ssl,
      };

      req
        .pipe(request(requestOptions))
        .on('error', err => {
          if (typeof res.report_error === 'function') {
            return res.report_error(err);
          }
          this.logger.error(err);
          return res.status(500).end();
        })
        .pipe(res);
    };

    const handleAudit = (req: Request, res: Response): void => {
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
