// @flow

import LocalMemory from '../src/index';
import type { Logger } from '@verdaccio/types';
import type { ILocalData, IPackageStorage } from '@verdaccio/local-storage';
import config from './partials/config';
import pkgExample from './partials/pkg';

const logger: Logger = {
  error: e => console.warn(e),
  info: e => console.warn(e),
  debug: e => console.warn(e),
  child: e => console.warn(e),
  warn: e => console.warn(e),
  http: e => console.warn(e),
  trace: e => console.warn(e)
};

describe('memory unit test .', () => {
  test('should create an instance', () => {
    const localMemory: ILocalData = new LocalMemory(config, logger);

    expect(localMemory).toBeDefined();
  });

  test('should save a package', done => {
    const localMemory: ILocalData = new LocalMemory(config, logger);

    const handler = localMemory.getPackageStorage('test');
    expect(handler).toBeDefined();

    if (handler) {
      handler.savePackage('test', pkgExample, err => {
        expect(err).toBeNull();
        handler.readPackage('test', (err, data) => {
          expect(err).toBeNull();
          expect(data).toEqual(pkgExample);
          done();
        });
      });
    }
  });

  test('should delete a package', done => {
    const localMemory: ILocalData = new LocalMemory(config, logger);

    const handler: IPackageStorage = localMemory.getPackageStorage('test2');
    expect(handler).toBeDefined();
    if (handler) {
      handler.createPackage('test2', pkgExample, err => {
        expect(err).toBeNull();
        handler.deletePackage('test2', (err, data) => {
          expect(err).toBeNull();
          handler.readPackage('test', (err, data) => {
            expect(err).not.toBeNull();
            expect(err.message).toMatch(/package not found/);
            done();
          });
        });
      });
    }
  });
});
