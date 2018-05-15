// @flow
import ProxyAudit from '../src/index';

import type { Logger } from '@verdaccio/types';

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
    expect(1).toBeDefined();
  });
});
