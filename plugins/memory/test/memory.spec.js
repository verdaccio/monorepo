// @flow

import LocalMemory from '../src/index';
import type { Logger, Config } from '@verdaccio/types';
import type { ILocalData, IPackageStorage } from '@verdaccio/local-storage';

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

  test('should save a package', done => {
    const localMemory: ILocalData = new LocalMemory(config, logger);

    const handler: IPackageStorage = localMemory.getPackageStorage('test');
    expect(handler).toBeDefined();

    handler.savePackage('test', { a: 1 }, err => {
      expect(err).toBeNull();
      handler.readPackage('test', (err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual({ a: 1 });
        done();
      });
    });
  });

  test.skip('should delete a package', done => {
    const localMemory: ILocalData = new LocalMemory(config, logger);

    const handler: IPackageStorage = localMemory.getPackageStorage('test2');
    expect(handler).toBeDefined();

    handler.savePackage('test2', { a: 1 }, err => {
      expect(err).toBeNull();
      handler.readPackage('test', (err, data) => {
        expect(err).toBeNull();
        expect(JSON.parse(data)).toEqual({ a: 1 });
        done();
      });
    });
  });
});
