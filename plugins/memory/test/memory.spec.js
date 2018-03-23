// @flow

import LocalMemory from '../src/index';
import config from './partials/config';
import pkgExample from './partials/pkg';
import MemoryHandler from '../src/memory-handler';

import type { Logger } from '@verdaccio/types';
import type { ILocalData, IPackageStorage } from '@verdaccio/local-storage';

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
  describe('LocalMemory', () => {
    test('should create an LocalMemory instance', () => {
      const localMemory: ILocalData = new LocalMemory(config, logger);

      expect(localMemory).toBeDefined();
    });

    test('should create add a package', () => {
      const localMemory: ILocalData = new LocalMemory(config, logger);
      localMemory.add('test');

      expect(localMemory.get()).toHaveLength(1);
    });

    test('should reach max limit', () => {
      config.limit = 2;
      const localMemory: ILocalData = new LocalMemory(config, logger);
      expect(localMemory.add('test1')).toBeUndefined();
      expect(localMemory.add('test2')).toBeUndefined();
      expect(localMemory.add('test3')).not.toBeNull();
    });

    test('should remove a package', () => {
      const localMemory: ILocalData = new LocalMemory(config, logger);
      localMemory.add('test');
      localMemory.remove('test');

      expect(localMemory.get()).toHaveLength(0);
    });
  });

  describe('MemoryHandler', () => {
    test('should create an MemoryHandler instance', () => {
      const memoryHandler: ILocalPackageManager = new MemoryHandler('test', pkgExample, logger);

      expect(memoryHandler).toBeDefined();
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

    test('should update a package', done => {
      const localMemory: ILocalData = new LocalMemory(config, logger);

      const handler = localMemory.getPackageStorage('test');
      expect(handler).toBeDefined();
      const onEnd = jest.fn();

      if (handler) {
        handler.savePackage('test', pkgExample, err => {
          expect(err).toBeNull();

          handler.updatePackage(
            'test',
            (json, callback) => {
              expect(json).toBeDefined();
              expect(json.name).toBe(pkgExample.name);
              expect(callback).toBeDefined();
              callback();
            },
            (name, data, onEnd) => {
              expect(name).toBe('test');
              expect(data.name).toBe(pkgExample.name);
              onEnd();
              expect(onEnd).toBeCalled();
              done();
            },
            data => {
              expect(data).toBeDefined();
              return data;
            },
            onEnd
          );
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
});
