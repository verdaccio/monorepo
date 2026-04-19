import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import rm from 'rmdir-sync';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ILocalPackageManager, Logger, Package } from '@verdaccio/legacy-types';

import LocalDriver, { fSError, fileExist, noSuchFile, resourceNotAvailable } from '../src/local-fs';
import pkg from './__fixtures__/pkg';

let localTempStorage: string;
const pkgFileName = 'package.json';

const logger: Logger = {
  error: () => vi.fn(),
  info: () => vi.fn(),
  debug: () => vi.fn(),
  warn: () => vi.fn(),
  child: () => vi.fn(),
  http: () => vi.fn(),
  trace: () => vi.fn(),
};

beforeAll(() => {
  localTempStorage = path.join('./_storage');
  rm(localTempStorage);
});

describe.skip('Local FS test', () => {
  describe('savePackage() group', () => {
    test('savePackage()', () => {
      const data = {};
      const localFs = new LocalDriver(path.join(localTempStorage, 'first-package'), logger);

      return new Promise<void>((resolve) => {
        localFs.savePackage('pkg.1.0.0.tar.gz', data as Package, (err) => {
          expect(err).toBeNull();
          resolve();
        });
      });
    });
  });

  describe('readPackage() group', () => {
    test('readPackage() success', () => {
      const localFs: ILocalPackageManager = new LocalDriver(
        path.join(import.meta.dirname, '__fixtures__/readme-test'),
        logger
      );

      return new Promise<void>((resolve) => {
        localFs.readPackage(pkgFileName, (err) => {
          expect(err).toBeNull();
          resolve();
        });
      });
    });

    test('readPackage() fails', () => {
      const localFs: ILocalPackageManager = new LocalDriver(
        path.join(import.meta.dirname, '__fixtures__/readme-testt'),
        logger
      );

      return new Promise<void>((resolve) => {
        localFs.readPackage(pkgFileName, (err) => {
          expect(err).toBeTruthy();
          resolve();
        });
      });
    });

    test('readPackage() fails corrupt', () => {
      const localFs: ILocalPackageManager = new LocalDriver(
        path.join(import.meta.dirname, '__fixtures__/readme-test-corrupt'),
        logger
      );

      return new Promise<void>((resolve) => {
        localFs.readPackage('corrupt.js', (err) => {
          expect(err).toBeTruthy();
          resolve();
        });
      });
    });
  });

  describe('createPackage() group', () => {
    test('createPackage()', () => {
      const localFs = new LocalDriver(path.join(localTempStorage, 'createPackage'), logger);

      return new Promise<void>((resolve) => {
        localFs.createPackage(path.join(localTempStorage, 'package5'), pkg, (err) => {
          expect(err).toBeNull();
          resolve();
        });
      });
    });

    test('createPackage() fails by fileExist', () => {
      const localFs = new LocalDriver(path.join(localTempStorage, 'createPackage'), logger);

      return new Promise<void>((resolve) => {
        localFs.createPackage(path.join(localTempStorage, 'package5'), pkg, (err) => {
          expect(err).not.toBeNull();
          expect(err.code).toBe(fileExist);
          resolve();
        });
      });
    });

    describe('deletePackage() group', () => {
      test('deletePackage()', () => {
        const localFs = new LocalDriver(path.join(localTempStorage, 'createPackage'), logger);

        return new Promise<void>((resolve) => {
          // verdaccio removes the package.json instead the package name
          localFs.deletePackage('package.json', (err) => {
            expect(err).toBeNull();
            resolve();
          });
        });
      });
    });
  });

  describe('removePackage() group', () => {
    beforeEach(() => {
      mkdirp.sync(path.join(localTempStorage, '_toDelete'));
    });

    test('removePackage() success', () => {
      const localFs: ILocalPackageManager = new LocalDriver(
        path.join(localTempStorage, '_toDelete'),
        logger
      );
      return new Promise<void>((resolve) => {
        localFs.removePackage((error) => {
          expect(error).toBeNull();
          resolve();
        });
      });
    });

    test('removePackage() fails', () => {
      const localFs: ILocalPackageManager = new LocalDriver(
        path.join(localTempStorage, '_toDelete_fake'),
        logger
      );
      return new Promise<void>((resolve) => {
        localFs.removePackage((error) => {
          expect(error).toBeTruthy();
          expect(error.code).toBe('ENOENT');
          resolve();
        });
      });
    });
  });

  describe('readTarball() group', () => {
    test('readTarball() success', () => {
      const localFs: ILocalPackageManager = new LocalDriver(
        path.join(import.meta.dirname, '__fixtures__/readme-test'),
        logger
      );
      const readTarballStream = localFs.readTarball('test-readme-0.0.0.tgz');

      return new Promise<void>((resolve) => {
        readTarballStream.on('error', function (err) {
          expect(err).toBeNull();
        });

        readTarballStream.on('content-length', function (content) {
          expect(content).toBe(352);
        });

        readTarballStream.on('end', function () {
          resolve();
        });

        readTarballStream.on('data', function (data) {
          expect(data).toBeDefined();
        });
      });
    });

    test('readTarball() fails', () => {
      const localFs: ILocalPackageManager = new LocalDriver(
        path.join(import.meta.dirname, '__fixtures__/readme-test'),
        logger
      );
      const readTarballStream = localFs.readTarball('file-does-not-exist-0.0.0.tgz');

      return new Promise<void>((resolve) => {
        readTarballStream.on('error', function (err) {
          expect(err).toBeTruthy();
          resolve();
        });
      });
    });
  });

  describe('writeTarball() group', () => {
    beforeEach(() => {
      const writeTarballFolder: string = path.join(localTempStorage, '_writeTarball');
      rm(writeTarballFolder);
      mkdirp.sync(writeTarballFolder);
    });

    test('writeTarball() success', () => {
      const newFileName = 'new-readme-0.0.0.tgz';
      const readmeStorage: ILocalPackageManager = new LocalDriver(
        path.join(import.meta.dirname, '__fixtures__/readme-test'),
        logger
      );
      const writeStorage: ILocalPackageManager = new LocalDriver(
        path.join(import.meta.dirname, '../_storage'),
        logger
      );
      const readTarballStream = readmeStorage.readTarball('test-readme-0.0.0.tgz');
      const writeTarballStream = writeStorage.writeTarball(newFileName);

      return new Promise<void>((resolve) => {
        writeTarballStream.on('error', function (err) {
          expect(err).toBeNull();
          resolve();
        });

        writeTarballStream.on('success', function () {
          const fileLocation: string = path.join(import.meta.dirname, '../_storage', newFileName);

          expect(fs.existsSync(fileLocation)).toBe(true);
          resolve();
        });

        readTarballStream.on('end', function () {
          writeTarballStream.done();
        });

        writeTarballStream.on('end', function () {
          resolve();
        });

        writeTarballStream.on('data', function (data) {
          expect(data).toBeDefined();
        });

        readTarballStream.on('error', function (err) {
          expect(err).toBeNull();
          resolve();
        });

        readTarballStream.pipe(writeTarballStream);
      });
    });

    test('writeTarball() abort', () => {
      const newFileLocationFolder: string = path.join(localTempStorage, '_writeTarball');
      const newFileName = 'new-readme-abort-0.0.0.tgz';
      const readmeStorage: ILocalPackageManager = new LocalDriver(
        path.join(import.meta.dirname, '__fixtures__/readme-test'),
        logger
      );
      const writeStorage: ILocalPackageManager = new LocalDriver(newFileLocationFolder, logger);
      const readTarballStream = readmeStorage.readTarball('test-readme-0.0.0.tgz');
      const writeTarballStream = writeStorage.writeTarball(newFileName);

      return new Promise<void>((resolve) => {
        writeTarballStream.on('error', function (err) {
          expect(err).toBeTruthy();
          resolve();
        });

        writeTarballStream.on('data', function (data) {
          expect(data).toBeDefined();
          writeTarballStream.abort();
        });

        readTarballStream.pipe(writeTarballStream);
      });
    });
  });

  describe('updatePackage() group', () => {
    const updateHandler = vi.fn((name, cb) => {
      cb();
    });
    const onWrite = vi.fn((name, data, cb) => {
      cb();
    });
    const transform = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
      vi.resetModules();
    });

    test('updatePackage() success', async () => {
      vi.doMock('@verdaccio/file-locking', () => {
        return {
          readFile: (name, _options, cb): any => cb(null, { name }),
          unlockFile: (_something, cb): any => cb(null),
        };
      });

      const { default: LocalDriver } = await import('../src/local-fs');
      const localFs: ILocalPackageManager = new LocalDriver(
        path.join(import.meta.dirname, '__fixtures__/update-package'),
        logger
      );

      return new Promise<void>((resolve) => {
        localFs.updatePackage('updatePackage', updateHandler, onWrite, transform, () => {
          expect(transform).toHaveBeenCalledTimes(1);
          expect(updateHandler).toHaveBeenCalledTimes(1);
          expect(onWrite).toHaveBeenCalledTimes(1);
          resolve();
        });
      });
    });

    describe('updatePackage() failures handler', () => {
      test('updatePackage() whether locking fails', async () => {
        vi.doMock('@verdaccio/file-locking', () => {
          return {
            readFile: (name, _options, cb): any => cb(Error('whateverError'), { name }),
            unlockFile: (_something, cb): any => cb(null),
          };
        });
        const { default: LocalDriver } = await import('../src/local-fs');
        const localFs: ILocalPackageManager = new LocalDriver(
          path.join(import.meta.dirname, '__fixtures__/update-package'),
          logger
        );

        return new Promise<void>((resolve) => {
          localFs.updatePackage('updatePackage', updateHandler, onWrite, transform, (err) => {
            expect(err).not.toBeNull();
            expect(transform).toHaveBeenCalledTimes(0);
            expect(updateHandler).toHaveBeenCalledTimes(0);
            expect(onWrite).toHaveBeenCalledTimes(0);
            resolve();
          });
        });
      });

      test('updatePackage() unlock a missing package', async () => {
        vi.doMock('@verdaccio/file-locking', () => {
          return {
            readFile: (name, _options, cb): any => cb(fSError(noSuchFile, 404), { name }),
            unlockFile: (_something, cb): any => cb(null),
          };
        });
        const { default: LocalDriver } = await import('../src/local-fs');
        const localFs: ILocalPackageManager = new LocalDriver(
          path.join(import.meta.dirname, '__fixtures__/update-package'),
          logger
        );

        return new Promise<void>((resolve) => {
          localFs.updatePackage('updatePackage', updateHandler, onWrite, transform, (err) => {
            expect(err).not.toBeNull();
            expect(transform).toHaveBeenCalledTimes(0);
            expect(updateHandler).toHaveBeenCalledTimes(0);
            expect(onWrite).toHaveBeenCalledTimes(0);
            resolve();
          });
        });
      });

      test('updatePackage() unlock a resource non available', async () => {
        vi.doMock('@verdaccio/file-locking', () => {
          return {
            readFile: (name, _options, cb): any => cb(fSError(resourceNotAvailable, 503), { name }),
            unlockFile: (_something, cb): any => cb(null),
          };
        });
        const { default: LocalDriver } = await import('../src/local-fs');
        const localFs: ILocalPackageManager = new LocalDriver(
          path.join(import.meta.dirname, '__fixtures__/update-package'),
          logger
        );

        return new Promise<void>((resolve) => {
          localFs.updatePackage('updatePackage', updateHandler, onWrite, transform, (err) => {
            expect(err).not.toBeNull();
            expect(transform).toHaveBeenCalledTimes(0);
            expect(updateHandler).toHaveBeenCalledTimes(0);
            expect(onWrite).toHaveBeenCalledTimes(0);
            resolve();
          });
        });
      });

      test('updatePackage() if updateHandler fails', async () => {
        vi.doMock('@verdaccio/file-locking', () => {
          return {
            readFile: (name, _options, cb): any => cb(null, { name }),
            unlockFile: (_something, cb): any => cb(null),
          };
        });

        const { default: LocalDriver } = await import('../src/local-fs');
        const localFs: ILocalPackageManager = new LocalDriver(
          path.join(import.meta.dirname, '__fixtures__/update-package'),
          logger
        );
        const updateHandler = vi.fn((_name, cb) => {
          cb(fSError('something wrong', 500));
        });

        return new Promise<void>((resolve) => {
          localFs.updatePackage('updatePackage', updateHandler, onWrite, transform, (err) => {
            expect(err).not.toBeNull();
            expect(transform).toHaveBeenCalledTimes(0);
            expect(updateHandler).toHaveBeenCalledTimes(1);
            expect(onWrite).toHaveBeenCalledTimes(0);
            resolve();
          });
        });
      });
    });
  });
});
