import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import { assign } from 'lodash';
import path from 'path';

import type { ILocalData, PluginOptions } from '@verdaccio/legacy-types';
import { Token } from '@verdaccio/legacy-types';

import LocalDatabase from '../src/local-database';
import type { ILocalFSPackageManager } from '../src/local-fs';
import * as pkgUtils from '../src/pkg-utils';
import * as remoteSearch from '../src/remote-search';
import * as utils from '../src/utils';
// FIXME: remove this mocks imports
import Config from './__mocks__/Config';
import logger from './__mocks__/Logger';

const optionsPlugin: PluginOptions<{}> = {
  logger,
  config: new Config(),
};

let locaDatabase: ILocalData<{}>;
let loadPrivatePackages;

describe('Local Database', () => {
  beforeEach(() => {
    const writeMock = vi.spyOn(fs, 'writeFileSync').mockImplementation();
    loadPrivatePackages = vi
      .spyOn(pkgUtils, 'loadPrivatePackages')
      .mockReturnValue({ list: [], secret: '' });
    locaDatabase = new LocalDatabase(optionsPlugin.config, optionsPlugin.logger);
    (locaDatabase as LocalDatabase).clean();
    writeMock.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should create an instance', () => {
    expect(optionsPlugin.logger.error).not.toHaveBeenCalled();
    expect(locaDatabase).toBeDefined();
  });

  test('should display log error if fails on load database', () => {
    loadPrivatePackages.mockImplementation(() => {
      throw Error();
    });

    new LocalDatabase(optionsPlugin.config, optionsPlugin.logger);

    expect(optionsPlugin.logger.error).toHaveBeenCalled();
    expect(optionsPlugin.logger.error).toHaveBeenCalledTimes(2);
  });

  describe('should create set secret', () => {
    test('should create get secret', async () => {
      const secretKey = await locaDatabase.getSecret();

      expect(secretKey).toBeDefined();
      expect(typeof secretKey === 'string').toBeTruthy();
    });

    test('should create set secret', async () => {
      await locaDatabase.setSecret(optionsPlugin.config.checkSecretKey(''));

      expect(optionsPlugin.config.secret).toBeDefined();
      expect(typeof optionsPlugin.config.secret === 'string').toBeTruthy();

      const fetchedSecretKey = await locaDatabase.getSecret();
      expect(optionsPlugin.config.secret).toBe(fetchedSecretKey);
    });
  });

  describe('getPackageStorage', () => {
    test('should get default storage', () => {
      const pkgName = 'someRandomePackage';
      const storage = locaDatabase.getPackageStorage(pkgName);
      expect(storage).toBeDefined();

      if (storage) {
        const storagePath = path.normalize((storage as ILocalFSPackageManager).path).toLowerCase();
        expect(storagePath).toBe(
          path
            .normalize(
              path.join(__dirname, '__fixtures__', optionsPlugin.config.storage || '', pkgName)
            )
            .toLowerCase()
        );
      }
    });

    test('should use custom storage', () => {
      const pkgName = 'local-private-custom-storage';
      const storage = locaDatabase.getPackageStorage(pkgName);

      expect(storage).toBeDefined();

      if (storage) {
        const storagePath = path.normalize((storage as ILocalFSPackageManager).path).toLowerCase();
        expect(storagePath).toBe(
          path
            .normalize(
              path.join(
                __dirname,
                '__fixtures__',
                optionsPlugin.config.storage || '',
                'private_folder',
                pkgName
              )
            )
            .toLowerCase()
        );
      }
    });
  });

  describe('Database CRUD', () => {
    test('should add an item to database', () => {
      return new Promise<void>((resolve) => {
        const pgkName = 'jquery';
        locaDatabase.get((err, data) => {
          expect(err).toBeNull();
          expect(data).toHaveLength(0);

          locaDatabase.add(pgkName, (err) => {
            expect(err).toBeNull();
            locaDatabase.get((err, data) => {
              expect(err).toBeNull();
              expect(data).toHaveLength(1);
              resolve();
            });
          });
        });
      });
    });

    test('should remove an item to database', () => {
      return new Promise<void>((resolve) => {
        const pgkName = 'jquery';
        locaDatabase.get((err, data) => {
          expect(err).toBeNull();
          expect(data).toHaveLength(0);
          locaDatabase.add(pgkName, (err) => {
            expect(err).toBeNull();
            locaDatabase.remove(pgkName, (err) => {
              expect(err).toBeNull();
              locaDatabase.get((err, data) => {
                expect(err).toBeNull();
                expect(data).toHaveLength(0);
                resolve();
              });
            });
          });
        });
      });
    });
  });

  describe('search', () => {
    const callSearch = (db, numberTimesCalled): Promise<void> => {
      const onPackageMock = vi.fn((item, cb) => cb());
      const validatorMock = vi.fn(() => true);
      return new Promise<void>((resolve) => {
        db.search(
          onPackageMock,
          function onEnd() {
            expect(onPackageMock).toHaveBeenCalledTimes(numberTimesCalled);
            expect(validatorMock).toHaveBeenCalledTimes(numberTimesCalled);
            resolve();
          },
          validatorMock
        );
      });
    };

    test('should find scoped packages', () => {
      const scopedPackages = ['@pkg1/test'];
      const stats = { mtime: new Date() };
      vi.spyOn(fs, 'stat').mockImplementation((_, cb) => cb(null, stats as fs.Stats));
      vi.spyOn(fs, 'readdir').mockImplementation((storePath, cb) =>
        cb(null, storePath.match('test-storage') ? scopedPackages : [])
      );

      return callSearch(locaDatabase, 1);
    });

    test('should find non scoped packages', () => {
      const nonScopedPackages = ['pkg1', 'pkg2'];
      const stats = { mtime: new Date() };
      vi.spyOn(fs, 'stat').mockImplementation((_, cb) => cb(null, stats as fs.Stats));
      vi.spyOn(fs, 'readdir').mockImplementation((storePath, cb) =>
        cb(null, storePath.match('test-storage') ? nonScopedPackages : [])
      );

      const db = new LocalDatabase(
        assign({}, optionsPlugin.config, {
          packages: {},
        }),
        optionsPlugin.logger
      );

      return callSearch(db, 2);
    });

    test('should fails on read the storage', () => {
      const spyInstance = vi
        .spyOn(fs, 'readdir')
        .mockImplementation((_, cb) => cb(Error('fails'), null));

      const db = new LocalDatabase(
        assign({}, optionsPlugin.config, {
          packages: {},
        }),
        optionsPlugin.logger
      );

      const result = callSearch(db, 0);
      spyInstance.mockRestore();
      return result;
    });
  });

  describe('searchAsync', () => {
    const simpleConfig = assign({}, optionsPlugin.config, { packages: {} });

    test('should return SearchItem[] for local packages', async () => {
      const db = new LocalDatabase(simpleConfig, optionsPlugin.logger);
      const mockPackages = [
        { name: 'pkg1', path: '/storage/pkg1' },
        { name: 'pkg2', path: '/storage/pkg2' },
      ];
      const mockStats = { mtime: new Date('2024-01-01') } as fs.Stats;

      vi.spyOn(utils, 'findPackages').mockResolvedValue(mockPackages);
      vi.spyOn(utils, 'getFileStats').mockResolvedValue(mockStats);

      const results = await db.searchAsync({
        text: 'pkg',
        quality: 0,
        popularity: 0,
        maintenance: 0,
      });

      expect(results).toHaveLength(2);
      expect(results[0].package.name).toBe('pkg1');
      expect(results[0].score.final).toBe(1);
      expect(results[0].verdaccioPkgCached).toBe(true);
    });

    test('should filter results by query text', async () => {
      const db = new LocalDatabase(simpleConfig, optionsPlugin.logger);
      const mockPackages = [
        { name: 'lodash', path: '/storage/lodash' },
        { name: 'express', path: '/storage/express' },
      ];
      const mockStats = { mtime: new Date() } as fs.Stats;

      vi.spyOn(utils, 'findPackages').mockResolvedValue(mockPackages);
      vi.spyOn(utils, 'getFileStats').mockResolvedValue(mockStats);

      const results = await db.searchAsync({
        text: 'lodash',
        quality: 0,
        popularity: 0,
        maintenance: 0,
      });

      expect(results).toHaveLength(1);
      expect(results[0].package.name).toBe('lodash');
    });

    test('should apply pagination', async () => {
      const db = new LocalDatabase(simpleConfig, optionsPlugin.logger);
      const mockPackages = Array.from({ length: 30 }, (_, i) => ({
        name: `pkg-${i}`,
        path: `/storage/pkg-${i}`,
      }));
      const mockStats = { mtime: new Date() } as fs.Stats;

      vi.spyOn(utils, 'findPackages').mockResolvedValue(mockPackages);
      vi.spyOn(utils, 'getFileStats').mockResolvedValue(mockStats);

      const results = await db.searchAsync({
        text: 'pkg',
        from: 5,
        size: 10,
        quality: 0,
        popularity: 0,
        maintenance: 0,
      });

      expect(results).toHaveLength(10);
      expect(results[0].package.name).toBe('pkg-5');
    });

    test('should mark private packages correctly', async () => {
      const db = new LocalDatabase(simpleConfig, optionsPlugin.logger);
      const mockPackages = [{ name: 'my-private-pkg', path: '/storage/my-private-pkg' }];
      const mockStats = { mtime: new Date() } as fs.Stats;

      vi.spyOn(utils, 'findPackages').mockResolvedValue(mockPackages);
      vi.spyOn(utils, 'getFileStats').mockResolvedValue(mockStats);

      // Add the package to the private list
      db.add('my-private-pkg', () => {});

      const results = await db.searchAsync({
        text: 'my-private',
        quality: 0,
        popularity: 0,
        maintenance: 0,
      });

      expect(results).toHaveLength(1);
      expect(results[0].verdaccioPrivate).toBe(true);
      expect(results[0].verdaccioPkgCached).toBe(false);
    });

    test('should handle errors gracefully', async () => {
      const db = new LocalDatabase(simpleConfig, optionsPlugin.logger);
      vi.spyOn(utils, 'findPackages').mockRejectedValue(new Error('ENOENT'));

      const results = await db.searchAsync({
        text: 'pkg',
        quality: 0,
        popularity: 0,
        maintenance: 0,
      });

      expect(results).toHaveLength(0);
    });
  });

  describe('searchWithUplinks', () => {
    const simpleConfig = assign({}, optionsPlugin.config, { packages: {} });

    test('should return only local results when remoteSearch is disabled', async () => {
      const db = new LocalDatabase(simpleConfig, optionsPlugin.logger);
      const mockPackages = [{ name: 'local-pkg', path: '/storage/local-pkg' }];
      const mockStats = { mtime: new Date() } as fs.Stats;

      vi.spyOn(utils, 'findPackages').mockResolvedValue(mockPackages);
      vi.spyOn(utils, 'getFileStats').mockResolvedValue(mockStats);
      const uplinkSpy = vi.spyOn(remoteSearch, 'searchUplinks');

      const results = await db.searchWithUplinks({
        text: 'local',
        quality: 0,
        popularity: 0,
        maintenance: 0,
      });

      expect(results).toHaveLength(1);
      expect(results[0].package.name).toBe('local-pkg');
      expect(uplinkSpy).not.toHaveBeenCalled();
    });

    test('should merge local and remote results when remoteSearch is enabled', async () => {
      const db = new LocalDatabase(
        assign({}, simpleConfig, {
          remoteSearch: true,
          packages: { '*': { proxy: ['npmjs'] } },
        }),
        optionsPlugin.logger
      );

      const mockPackages = [{ name: 'local-pkg', path: '/storage/local-pkg' }];
      const mockStats = { mtime: new Date() } as fs.Stats;

      vi.spyOn(utils, 'findPackages').mockResolvedValue(mockPackages);
      vi.spyOn(utils, 'getFileStats').mockResolvedValue(mockStats);
      vi.spyOn(remoteSearch, 'searchUplinks').mockResolvedValue([
        {
          package: { name: 'remote-pkg' },
          verdaccioPrivate: false,
          verdaccioPkgCached: false,
          score: { final: 0.8, detail: { quality: 0.8, popularity: 0.8, maintenance: 0.8 } },
        },
      ]);

      const results = await db.searchWithUplinks({
        text: '',
        quality: 0,
        popularity: 0,
        maintenance: 0,
      });

      expect(results).toHaveLength(2);
      expect(results[0].package.name).toBe('local-pkg');
      expect(results[1].package.name).toBe('remote-pkg');
    });

    test('should deduplicate: local wins over remote', async () => {
      const db = new LocalDatabase(
        assign({}, simpleConfig, {
          remoteSearch: true,
          packages: { '*': { proxy: ['npmjs'] } },
        }),
        optionsPlugin.logger
      );

      const mockPackages = [{ name: 'shared-pkg', path: '/storage/shared-pkg' }];
      const mockStats = { mtime: new Date() } as fs.Stats;

      vi.spyOn(utils, 'findPackages').mockResolvedValue(mockPackages);
      vi.spyOn(utils, 'getFileStats').mockResolvedValue(mockStats);
      vi.spyOn(remoteSearch, 'searchUplinks').mockResolvedValue([
        {
          package: { name: 'shared-pkg' },
          verdaccioPrivate: false,
          verdaccioPkgCached: false,
          score: { final: 0.5, detail: { quality: 0.5, popularity: 0.5, maintenance: 0.5 } },
        },
      ]);

      const results = await db.searchWithUplinks({
        text: '',
        quality: 0,
        popularity: 0,
        maintenance: 0,
      });

      expect(results).toHaveLength(1);
      expect(results[0].package.name).toBe('shared-pkg');
      expect(results[0].score.final).toBe(1);
    });
  });
});
