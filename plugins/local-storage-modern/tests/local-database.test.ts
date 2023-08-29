import fs from 'fs';
import path from 'path';



import LocalDatabase from '../src/local-database';
import { ILocalFSPackageManager } from '../src/local-fs';
import * as pkgUtils from '../src/pkg-utils';

import config from './config';
import logger from './__mocks__/Logger';

const optionsPlugin = {
  logger,
  config,
};

let locaDatabase;
let loadPrivatePackages;

describe('Local Database', () => {
  beforeEach(() => {
    const writeMock = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    loadPrivatePackages = jest
      .spyOn(pkgUtils, 'loadPrivatePackages')
      .mockReturnValue({ list: [], secret: '' });
    locaDatabase = new LocalDatabase(optionsPlugin.config, optionsPlugin.logger);
    (locaDatabase as LocalDatabase).clean();
    writeMock.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    test('should add an item to database', (done) => {
      const pgkName = 'jquery';
      locaDatabase.get((err, data) => {
        expect(err).toBeNull();
        expect(data).toHaveLength(0);

        locaDatabase.add(pgkName, (err) => {
          expect(err).toBeNull();
          locaDatabase.get((err, data) => {
            expect(err).toBeNull();
            expect(data).toHaveLength(1);
            done();
          });
        });
      });
    });

    test('should remove an item to database', (done) => {
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
              done();
            });
          });
        });
      });
    });
  });
});
