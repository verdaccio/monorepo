// @flow

import LocalMemory from '../src/index';
import config from './partials/config';
import pkgExample from './partials/pkg';
import MemoryHandler, { noSuchFile } from '../src/memory-handler';

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
      const localMemory: ILocalData = new LocalMemory(config, { logger });

      expect(localMemory).toBeDefined();
    });

    test('should create add a package', done => {
      const localMemory: ILocalData = new LocalMemory(config, { logger });
      localMemory.add('test', err => {
        expect(err).toBeNull();
        localMemory.get((err, data) => {
          expect(err).toBeNull();
          expect(data).toHaveLength(1);
          done();
        });
      });
    });

    test('should reach max limit', done => {
      config.limit = 2;
      const localMemory: ILocalData = new LocalMemory(config, { logger });

      localMemory.add('test1', err => {
        expect(err).toBeNull();
        localMemory.add('test2', err => {
          expect(err).toBeNull();
          localMemory.add('test3', err => {
            expect(err).not.toBeNull();
            expect(err.message).toMatch(/Storage memory has reached limit of limit packages/);
            done();
          });
        });
      });
    });

    test('should remove a package', done => {
      const pkgName: string = 'test';
      const localMemory: ILocalData = new LocalMemory(config, { logger });
      localMemory.add(pkgName, err => {
        expect(err).toBeNull();
        localMemory.remove(pkgName, err => {
          expect(err).toBeNull();
          localMemory.get((err, data) => {
            expect(err).toBeNull();
            expect(data).toHaveLength(0);
            done();
          });
        });
      });
    });
  });

  describe('MemoryHandler', () => {
    test('should create an MemoryHandler instance', () => {
      const memoryHandler = new MemoryHandler('test', pkgExample, logger);

      expect(memoryHandler).toBeDefined();
    });

    test('should save a package', done => {
      const localMemory: ILocalData = new LocalMemory(config, { logger });
      const pkgName: string = 'test';

      const handler = localMemory.getPackageStorage(pkgName);
      expect(handler).toBeDefined();

      if (handler) {
        handler.savePackage(pkgName, pkgExample, err => {
          expect(err).toBeNull();
          handler.readPackage(pkgName, (err, data) => {
            expect(err).toBeNull();
            expect(data).toEqual(pkgExample);
            done();
          });
        });
      }
    });

    test('should fails on read a package', done => {
      const localMemory: ILocalData = new LocalMemory(config, { logger });
      const pkgName: string = 'test';

      const handler = localMemory.getPackageStorage(pkgName);
      expect(handler).toBeDefined();

      if (handler) {
        handler.readPackage(pkgName, (err, data) => {
          expect(err).not.toBeNull();
          expect(err.code).toBe(noSuchFile);
          done();
        });
      }
    });

    test('should update a package', done => {
      const localMemory: ILocalData = new LocalMemory(config, { logger });
      const pkgName: string = 'test';

      const handler = localMemory.getPackageStorage(pkgName);
      expect(handler).toBeDefined();
      const onEnd = jest.fn();

      if (handler) {
        handler.savePackage(pkgName, pkgExample, err => {
          expect(err).toBeNull();

          handler.updatePackage(
            pkgName,
            (json, callback) => {
              expect(json).toBeDefined();
              expect(json.name).toBe(pkgExample.name);
              expect(callback).toBeDefined();
              callback();
            },
            (name, data, onEnd) => {
              expect(name).toBe(pkgName);
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

    test('should write a tarball', done => {
      const localMemory: ILocalData = new LocalMemory(config, { logger });
      const pkgName: string = 'test';
      const dataTarball: string = '12345';

      const handler = localMemory.getPackageStorage(pkgName);

      if (handler) {
        const stream = handler.writeTarball(pkgName);
        stream.on('data', data => {
          expect(data.toString()).toBe(dataTarball);
        });
        stream.on('open', () => {
          stream.done();
          stream.end();
        });
        stream.on('success', () => {
          done();
        });

        stream.write(dataTarball);
      }
    });

    test('should read a tarball', done => {
      const localMemory: ILocalData = new LocalMemory(config, { logger });
      const pkgName: string = 'test.tar.gz';
      const dataTarball: string = '12345';

      const handler = localMemory.getPackageStorage(pkgName);

      if (handler) {
        const stream = handler.writeTarball(pkgName);
        stream.on('open', () => {
          stream.done();
          stream.end();
        });
        stream.on('success', () => {
          const readStream = handler.readTarball(pkgName);
          readStream.on('data', data => {
            expect(data.toString()).toBe(dataTarball);
            done();
          });
        });
        stream.write(dataTarball);
      }
    });

    test('should abort read a tarball', done => {
      const localMemory: ILocalData = new LocalMemory(config, { logger });
      const pkgName: string = 'test2.tar.gz';
      const dataTarball: string = '12345';

      const handler = localMemory.getPackageStorage(pkgName);

      if (handler) {
        const stream = handler.writeTarball(pkgName);
        stream.on('open', () => {
          stream.done();
          stream.end();
        });
        stream.on('success', () => {
          const readStream = handler.readTarball(pkgName);
          readStream.on('data', data => {
            readStream.abort();
          });
          readStream.on('error', err => {
            expect(err).not.toBeNull();
            expect(err.message).toMatch(/read has been aborted/);
            done();
          });
        });
        stream.write(dataTarball);
      }
    });

    test('should fails read a tarball not found', done => {
      const localMemory: ILocalData = new LocalMemory(config, { logger });
      const pkgName: string = 'test2.tar.gz';
      const handler = localMemory.getPackageStorage(pkgName);

      if (handler) {
        const readStream = handler.readTarball('not-found');
        readStream.on('error', err => {
          expect(err).not.toBeNull();
          expect(err.message).toMatch(/no such package/);
          done();
        });
      }
    });

    test('should abort while write a tarball', done => {
      const localMemory: ILocalData = new LocalMemory(config, { logger });
      const pkgName: string = 'test-abort.tar.gz';
      const dataTarball: string = '12345';

      const handler = localMemory.getPackageStorage(pkgName);

      if (handler) {
        const stream = handler.writeTarball(pkgExample);
        stream.on('error', err => {
          expect(err).not.toBeNull();
          expect(err.message).toMatch(/transmision aborted/);
          done();
        });
        stream.on('open', () => {
          stream.abort();
        });

        stream.write(dataTarball);
      }
    });

    test('should delete a package', done => {
      const localMemory: ILocalData = new LocalMemory(config, { logger });
      const pkgName: string = 'test2';

      const handler: IPackageStorage = localMemory.getPackageStorage(pkgName);
      expect(handler).toBeDefined();
      if (handler) {
        handler.createPackage(pkgName, pkgExample, err => {
          expect(err).toBeNull();
          handler.deletePackage(pkgName, (err, data) => {
            expect(err).toBeNull();
            handler.readPackage(pkgName, (err, data) => {
              expect(err).not.toBeNull();
              expect(err.message).toMatch(/no such package/);
              done();
            });
          });
        });
      }
    });
  });
});
