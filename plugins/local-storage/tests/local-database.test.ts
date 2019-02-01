import fs from 'fs';
import path from 'path';
import { clone, assign } from 'lodash';
import { ILocalData, PluginOptions } from '@verdaccio/types';
import LocalDatabase from '../src/local-database';
import Config from './__mocks__/Config';
import logger from './__mocks__/Logger';

const optionsPlugin: PluginOptions<{}> = {
  logger,
  config: new Config()
};

let locaDatabase: ILocalData<{}>;

describe('Local Database', () => {
  beforeEach(() => {
    // FIXME: we have to mock properly here
    // $FlowFixMe
    fs.writeFileSync = jest.fn();
    locaDatabase = new LocalDatabase(optionsPlugin.config, optionsPlugin.logger);
    // clean database
    (locaDatabase as any)._sync();
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('should create an instance', () => {
    const locaDatabase = new LocalDatabase(optionsPlugin.config, optionsPlugin.logger);

    expect(optionsPlugin.logger.error).not.toHaveBeenCalled();
    expect(locaDatabase).toBeDefined();
  });

  test('should display log error if fails on load database', () => {
    jest.doMock('../src/pkg-utils.ts', () => {
      return {
        loadPrivatePackages: () => {
          throw Error();
        }
      };
    });

    const LocalDatabase = require('../src/local-database').default;
    new LocalDatabase(optionsPlugin.config, optionsPlugin.logger);

    expect(optionsPlugin.logger.error).toHaveBeenCalled();
    expect(optionsPlugin.logger.error).toHaveBeenCalledTimes(2);
  });

  describe('should create set secret', () => {
    test('should create get secret', async () => {
      const locaDatabase = new LocalDatabase(clone(optionsPlugin.config), optionsPlugin.logger);
      const secretKey = await locaDatabase.getSecret();

      expect(secretKey).toBeDefined();
      expect(typeof secretKey === 'string').toBeTruthy();
    });

    test('should create set secret', async () => {
      const locaDatabase = new LocalDatabase(clone(optionsPlugin.config), optionsPlugin.logger);

      await locaDatabase.setSecret(optionsPlugin.config.checkSecretKey());

      expect(optionsPlugin.config.secret).toBeDefined();
      expect(typeof optionsPlugin.config.secret === 'string').toBeTruthy();

      const fetchedSecretKey = await locaDatabase.getSecret();
      expect(optionsPlugin.config.secret).toBe(fetchedSecretKey);
    });
  });

  describe('getPackageStorage', () => {
    test('should get default storage', () => {
      const pkgName: string = 'someRandomePackage';
      const locaDatabase = new LocalDatabase(clone(optionsPlugin.config), optionsPlugin.logger);
      const storage = locaDatabase.getPackageStorage(pkgName);
      expect(storage).toBeDefined();

      if (storage) {
        expect(storage.path).toBe(path.join(__dirname, '__fixtures__', optionsPlugin.config.storage, pkgName));
      }
    });

    test('should use custom storage', () => {
      const pkgName: string = 'local-private-custom-storage';
      const locaDatabase = new LocalDatabase(clone(optionsPlugin.config), optionsPlugin.logger);
      const storage = locaDatabase.getPackageStorage(pkgName);

      expect(storage).toBeDefined();

      if (storage) {
        expect(storage.path).toBe(path.join(__dirname, '__fixtures__', optionsPlugin.config.storage, 'private_folder', pkgName));
      }
    });
  });

  describe('Database CRUD', () => {
    test('should add an item to database', done => {
      const pgkName = 'jquery';
      locaDatabase.get((err, data) => {
        expect(err).toBeNull();
        expect(data).toHaveLength(0);

        locaDatabase.add(pgkName, err => {
          expect(err).toBeNull();
          locaDatabase.get((err, data) => {
            expect(err).toBeNull();
            expect(data).toHaveLength(1);
            done();
          });
        });
      });
    });

    test('should remove an item to database', done => {
      const pgkName = 'jquery';
      locaDatabase.get((err, data) => {
        expect(err).toBeNull();
        expect(data).toHaveLength(0);
        locaDatabase.add(pgkName, err => {
          expect(err).toBeNull();
          locaDatabase.remove(pgkName, err => {
            expect(err).toBeNull();
            locaDatabase.get((err, data) => {
              expect(err).toBeNull();
              expect(data).toHaveLength(0);
              done();
            });
          });
        });
      });
    });
  });

  describe('search', () => {
    const onPackageMock = jest.fn((item, cb) => cb());
    const validatorMock = jest.fn(() => true);
    const callSearch = (db, numberTimesCalled, cb) => {
      db.search(
        onPackageMock,
        function onEnd() {
          expect(onPackageMock).toHaveBeenCalledTimes(numberTimesCalled);
          expect(validatorMock).toHaveBeenCalledTimes(numberTimesCalled);
          cb();
        },
        validatorMock
      );
    };

    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetModules();
      jest.doMock('../src/pkg-utils.ts', () => {
        return {
          loadPrivatePackages: () => {
            return {
              list: [],
              secret: ''
            };
          }
        };
      });
    });

    test('should find scoped packages', done => {
      const nonScopedPackages = ['@pkg1/test'];
      jest.doMock('fs', () => {
        return {
          existsSync: () => true,
          stat: (storePath, cb) =>
            cb(null, {
              mtime: new Date()
            }),
          readdir: function(storePath, cb) {
            // here we want to limit to one store
            return cb(null, storePath.match('test-storage') ? nonScopedPackages : []);
          }
        };
      });

      const LocalDatabase = require('../src/local-database').default;
      const db = new LocalDatabase(optionsPlugin.config, optionsPlugin.logger);

      callSearch(db, 1, done);
    });

    test('should find non scoped packages', done => {
      const nonScopedPackages = ['pkg1', 'pkg2'];
      jest.doMock('fs', () => {
        return {
          existsSync: () => true,
          stat: (storePath, cb) =>
            cb(null, {
              mtime: new Date()
            }),
          readdir: function(storePath, cb) {
            // here we want to limit to one store
            return cb(null, storePath.match('test-storage') ? nonScopedPackages : []);
          }
        };
      });

      const LocalDatabase = require('../src/local-database').default;
      const db = new LocalDatabase(
        assign({}, optionsPlugin.config, {
          // clean up this, it creates noise
          packages: {}
        }),
        optionsPlugin.logger
      );

      callSearch(db, 2, done);
    });

    test('should fails on read the storage', done => {
      jest.doMock('fs', () => {
        return {
          existsSync: () => true,
          stat: (storePath, cb) =>
            cb(null, {
              mtime: new Date()
            }),
          readdir: function(storePath, cb) {
            // read directory fails here for some reason
            return cb(Error('fails'), null);
          }
        };
      });

      const LocalDatabase = require('../src/local-database').default;
      const db = new LocalDatabase(
        assign({}, optionsPlugin.config, {
          // clean up this, it creates noise
          packages: {}
        }),
        optionsPlugin.logger
      );

      callSearch(db, 0, done);
    });
  });
});
