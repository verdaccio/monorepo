// @flow

import LocalMemory from '../src/index';
import type { Logger, Config } from '@verdaccio/types';
import type { ILocalData } from '@verdaccio/local-storage';

const logger: Logger = {
  error: e => console.warn(e),
  info: e => console.warn(e),
  debug: e => console.warn(e),
  child: e => console.warn(e),
  http: e => console.warn(e),
  trace: e => console.warn(e)
};

const config: Config = {
  checkSecretKey: () => {}
};

describe('memory unit test .', () => {
  test('should create an instance', () => {
    const localMemory: ILocalData = new LocalMemory(config, logger);

    expect(localMemory).toBeDefined();
  });
});
