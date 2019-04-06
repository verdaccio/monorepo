import ProxyAudit, { ConfigAudit } from '../src/index';

import { Logger } from '@verdaccio/types';

// @ts-ignore
const config: ConfigAudit = {
  enabled: true
};

const logger: Logger = {
  error: e => console.warn(e),
  info: e => console.warn(e),
  debug: e => console.warn(e),
  child: e => console.warn(e),
  warn: e => {},
  http: e => console.warn(e),
  trace: e => console.warn(e)
};

describe('Audit plugin', () => {
  test('should test audit', () => {
    // @ts-ignore
      const audit = new ProxyAudit(config, { logger, config: undefined });
    expect(audit).toBeDefined();
  });
});
