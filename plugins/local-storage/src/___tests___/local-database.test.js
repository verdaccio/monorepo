// @flow
import fs from 'fs';
import path from 'path';
import { clone } from 'lodash';
import type { ILocalData } from '@verdaccio/local-storage';
import LocalDatabase from '../local-database';
import Config from './__mocks__/Config';
import logger from './__mocks__/Logger';

const stuff = {
  logger,
  config: new Config()
};

let locaDatabase: ILocalData;

describe('Local Database', () => {
  beforeEach(() => {
    // FIXME: we have to mock properly here
    // $FlowFixMe
    fs.writeFileSync = jest.fn();
    locaDatabase = new LocalDatabase(stuff.config, stuff.logger);
    // clean database
    locaDatabase._sync();
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('should create an instance', () => {
    const locaDatabase = new LocalDatabase(stuff.config, stuff.logger);

    expect(stuff.logger.error).not.toHaveBeenCalled();
    expect(locaDatabase).toBeDefined();
  });

  test('should display log error if fails on load database', () => {
    jest.doMock('../utils.js', () => {
      return {
        loadPrivatePackages: () => {
          throw Error();
        }
      };
    });

    const LocalDatabase = require('../local-database').default;
    new LocalDatabase(stuff.config, stuff.logger);

    expect(stuff.logger.error).toHaveBeenCalled();
    expect(stuff.logger.error).toHaveBeenCalledTimes(2);
  });

  describe('should create set secret', () => {
    test('should create get secret', async () => {
      const locaDatabase = new LocalDatabase(clone(stuff.config), stuff.logger);
      const secretKey = await locaDatabase.getSecret();

      expect(secretKey).toBeDefined();
      expect(typeof secretKey === 'string').toBeTruthy();
    });

    test('should create set secret', async () => {
      const locaDatabase = new LocalDatabase(clone(stuff.config), stuff.logger);

      await locaDatabase.setSecret(stuff.config.checkSecretKey());

      expect(stuff.config.secret).toBeDefined();
      expect(typeof stuff.config.secret === 'string').toBeTruthy();

      const fetchedSecretKey = await locaDatabase.getSecret();
      expect(stuff.config.secret).toBe(fetchedSecretKey);
    });
  });

  describe('getPackageStorage', () => {
    test('should get default storage', () => {
      const pkgName: string = 'someRandomePackage';
      const locaDatabase = new LocalDatabase(clone(stuff.config), stuff.logger);
      const storage = locaDatabase.getPackageStorage(pkgName);
      expect(storage).toBeDefined();

      if (storage) {
        expect(storage.path).toBe(path.join(__dirname, '__fixtures__', stuff.config.storage, pkgName));
      }
    });

    test('should use custom storage', () => {
      const pkgName: string = 'local-private-custom-storage';
      const locaDatabase = new LocalDatabase(clone(stuff.config), stuff.logger);
      const storage = locaDatabase.getPackageStorage(pkgName);

      expect(storage).toBeDefined();

      if (storage) {
        expect(storage.path).toBe(path.join(__dirname, '__fixtures__', stuff.config.storage, 'private_folder', pkgName));
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
    let find;
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetModules();
      find = 0;
      jest.doMock('../utils.js', () => {
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

      const LocalDatabase = require('../local-database').default;
      const db = new LocalDatabase(stuff.config, stuff.logger);

      db.search(
        function onPackage(results, cb) {
          expect(results.name).toBeDefined();
          expect(results.path).toBeDefined();
          expect(results.time).toBeDefined();
          find++;
          cb();
        },
        function onEnd() {
          expect(find).toBe(1);
          done();
        },
        function validator() {
          return true;
        }
      );
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

      const LocalDatabase = require('../local-database').default;
      const db = new LocalDatabase(stuff.config, stuff.logger);

      db.search(
        function onPackage(results, cb) {
          expect(results.name).toBeDefined();
          expect(results.path).toBeDefined();
          expect(results.time).toBeDefined();
          find++;
          cb();
        },
        function onEnd() {
          expect(find).toBe(2);
          done();
        },
        function validator() {
          return true;
        }
      );
    });
  });
});
