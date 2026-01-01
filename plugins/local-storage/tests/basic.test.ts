// FIXME: remove this mocks imports
// @ts-expect-error
import { access, constants } from 'fs/promises';
import path from 'path';

import { fileUtils } from '@verdaccio/core';
import { Config as ConfigType } from '@verdaccio/types';

import LocalStorage from '../src/index';
import Config from './__mocks__/Config';
import logger from './__mocks__/Logger';
import { getConfig, getDefaultConfig } from './__mocks__/utils';

describe('Basic Tests', () => {
  test('basic instance', () => {
    const config = new Config();
    const instance = new LocalStorage(config as ConfigType, logger);
    expect(instance).toBeDefined();
  });

  test('check if file is created', async () => {
    const config = new Config();
    const storageTemp = await fileUtils.createTempStorageFolder('test-1');
    // @ts-expect-error
    config.storage = storageTemp;
    const instance = new LocalStorage(config as ConfigType, logger);
    expect(instance).toBeDefined();
    return new Promise((resolve) => {
      // @ts-expect-error
      instance.getPackageStorage('pk1')?.createPackage('pk1', { name: 'pk1' }, (err) => {
        access(path.join(storageTemp, 'pk1'), constants.R_OK | constants.W_OK).then(() => {
          resolve(true);
        });
      });
    });
  });

  describe('search', () => {
    test('search no results', async () => {
      const config = new Config();
      const storageTemp = await fileUtils.createTempStorageFolder('test-1');
      // @ts-expect-error
      config.storage = storageTemp;
      const instance = new LocalStorage(config as ConfigType, logger);
      expect(instance).toBeDefined();
      return new Promise((resolve) => {
        // @ts-expect-error
        instance.search({ text: 'pk1' }).then((items) => {
          expect(items).toEqual([]);
          resolve(true);
        });
      });
    });
    test('search a non scoped package', async () => {
      const config = new Config();
      const storageTemp = await fileUtils.createTempStorageFolder('test-1');
      // @ts-expect-error
      config.storage = storageTemp;
      const instance = new LocalStorage(config as ConfigType, logger);
      expect(instance).toBeDefined();
      return new Promise((resolve) => {
        // @ts-expect-error
        instance.getPackageStorage('pk1')?.createPackage('pk1', { name: 'pk1' }, (err) => {
          // @ts-expect-error
          instance.search({ text: 'pk1' }).then((items) => {
            expect(items).toEqual([
              {
                package: { name: 'pk1' },
                verdaccioPrivate: false,
                verdaccioPkgCached: true,
                score: {
                  final: 1,
                  detail: {
                    maintenance: 0,
                    popularity: 1,
                    quality: 1,
                  },
                },
              },
            ]);
            resolve(true);
          });
        });
      });
    });

    test('search a scoped package', async () => {
      const config = new Config();
      const storageTemp = await fileUtils.createTempStorageFolder('test-1');
      // @ts-expect-error
      config.storage = storageTemp;
      const instance = new LocalStorage(config as ConfigType, logger);
      expect(instance).toBeDefined();
      return new Promise((resolve) => {
        instance
          .getPackageStorage('@scope/pk1')
          // @ts-expect-error
          ?.createPackage('@scope/pk1', { name: '@scope/pk1' }, (err) => {
            // @ts-expect-error
            instance.search({ text: '@scope/pk1' }).then((items) => {
              expect(items).toEqual([
                {
                  package: { name: '@scope/pk1', scoped: '@scope' },
                  verdaccioPrivate: false,
                  verdaccioPkgCached: true,
                  score: {
                    final: 1,
                    detail: {
                      maintenance: 0,
                      popularity: 1,
                      quality: 1,
                    },
                  },
                },
              ]);
              resolve(true);
            });
          });
      });
    });

    test('search a scoped package in a storage folder', async () => {
      const storageTemp = await fileUtils.createTempStorageFolder('test-1');
      const configuration = getDefaultConfig(storageTemp);
      configuration.configPath = storageTemp;
      const config = getConfig(configuration);

      config.storage = storageTemp;

      const instance = new LocalStorage(config as ConfigType, logger);
      expect(instance).toBeDefined();
      return new Promise((resolve) => {
        instance
          .getPackageStorage('@scope/pk1')
          // @ts-expect-error
          ?.createPackage('@scope/pk1', { name: '@scope/pk1' }, (err) => {
            // @ts-expect-error
            instance.search({ text: '@scope/pk1' }).then((items) => {
              expect(items).toEqual([
                {
                  package: { name: '@scope/pk1', scoped: '@scope' },
                  verdaccioPrivate: false,
                  verdaccioPkgCached: true,
                  score: {
                    final: 1,
                    detail: {
                      maintenance: 0,
                      popularity: 1,
                      quality: 1,
                    },
                  },
                },
              ]);
              resolve(true);
            });
          });
      });
    });

    test('search a non scoped package in a storage folder', async () => {
      const storageTemp = await fileUtils.createTempStorageFolder('test-1');
      const configuration = getDefaultConfig(storageTemp);
      configuration.configPath = storageTemp;
      const config = getConfig(configuration);

      config.storage = storageTemp;

      const instance = new LocalStorage(config as ConfigType, logger);
      expect(instance).toBeDefined();
      return new Promise((resolve) => {
        instance
          .getPackageStorage('pk1')
          // @ts-expect-error
          ?.createPackage('pk1', { name: 'pk1' }, (err) => {
            // @ts-expect-error
            instance.search({ text: 'pk1' }).then((items) => {
              expect(items).toEqual([
                {
                  package: { name: 'pk1' },
                  verdaccioPrivate: false,
                  verdaccioPkgCached: true,
                  score: {
                    final: 1,
                    detail: {
                      maintenance: 0,
                      popularity: 1,
                      quality: 1,
                    },
                  },
                },
              ]);
              resolve(true);
            });
          });
      });
    });
  });
});
