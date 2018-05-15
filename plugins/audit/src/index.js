// @flow

import type { Logger } from '@verdaccio/types';
import type { ConfigAudit } from '../types';

export default class ProxyAudit {
  enabled: boolean;
  logger: Logger;

  constructor(config: ConfigAudit, options: any) {
    this.enabled = config.enabled;
    this.logger = options.logger;
  }

  register_middlewares() {
      // todo
  }
}
