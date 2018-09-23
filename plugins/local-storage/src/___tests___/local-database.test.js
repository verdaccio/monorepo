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
  });

  test('should create an instance', () => {
    const locaDatabase = new LocalDatabase(stuff.config, stuff.logger);

    expect(locaDatabase).toBeDefined();
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
});
