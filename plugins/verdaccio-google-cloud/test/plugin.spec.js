// @flow

import GoogleCloudDatabase from '../src/index';
import config from './partials/config';
import pkgExample from './partials/pkg';
import { generatePackage } from './partials/utils.helpers';

import type { Logger } from '@verdaccio/types';
import type { ILocalData, ILocalPackageManager } from '@verdaccio/local-storage';

const logger: Logger = {
  error: e => console.warn(e),
  info: e => console.warn(e),
  debug: e => console.warn(e),
  child: e => console.warn(e),
  warn: e => console.warn(e),
  http: e => console.warn(e),
  trace: e => console.warn(e)
};

describe('Google Cloud Storage', () => {
  // jest.setTimeout(1000000);
  describe('GoogleCloudDatabase', () => {
    test('should create an instance', () => {
      const cloudDatabase: ILocalData = new GoogleCloudDatabase(config, { logger });

      expect(cloudDatabase).toBeDefined();
    });

    test('should create an Entity', () => {
      const cloudDatabase: ILocalData = new GoogleCloudDatabase(config, { logger });
      cloudDatabase.add(pkgExample.name, err => {
        expect(err).toBeNull();
        cloudDatabase.get((err, results) => {
          expect(err).toBeNull();
          expect(results).toHaveLength(1);
          expect(results[0]).toBe(pkgExample.name);
        });
      });
    });

    test('should delete an entity', () => {
      const cloudDatabase: ILocalData = new GoogleCloudDatabase(config, { logger });

      cloudDatabase.remove(pkgExample.name, (err, result) => {
        expect(err).not.toBeNull();
        expect(result).toBeNull();
      });
    });

    test('should fails on detele remove an entity', () => {
      const cloudDatabase: ILocalData = new GoogleCloudDatabase(config, { logger });

      cloudDatabase.remove('fakeName', err => {
        expect(err).not.toBeNull();
        expect(err.message).toMatch(/not found/);
      });
    });
  });

  describe('GoogleCloudStorageHandler', () => {
    test('should create an instance', done => {
      const cloudDatabase = new GoogleCloudDatabase(config, { logger });
      const store: ILocalPackageManager = cloudDatabase.getPackageStorage('newInstance');
      store.savePackage(pkgExample.name, pkgExample, err => {
        expect(err).toBeNull();
        done();
      });
    });

    describe.skip('GoogleCloudStorageHandler:writeFile', () => {
      const cloudDatabase: ILocalData = new GoogleCloudDatabase(config, { logger });
      const store = cloudDatabase.getPackageStorage(pkgExample.name);
      expect(store).not.toBeNull();
    });

    describe('GoogleCloudStorageHandler:delete', () => {
      test('should delete an instance', done => {
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(config, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        expect(store).not.toBeNull();
        if (store) {
          store.deletePackage(pkgExample.name, err => {
            expect(err).toBeNull();
            done();
          });
        }
      });

      test('should fail on delete an instance', done => {
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(config, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        expect(store).not.toBeNull();
        if (store) {
          store.deletePackage('404Name', err => {
            expect(err).not.toBeNull();
            done();
          });
        }
      });

      test('should remove an entire package', done => {
        const cloudDatabase = new GoogleCloudDatabase(config, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        expect(store).not.toBeNull();
        if (store) {
          store.removePackage(err => {
            expect(err).toBeNull();
            done();
          });
        }
      });
    });

    describe('GoogleCloudStorageHandler:read', () => {
      test('should read a package', done => {
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(config, { logger });
        const store = cloudDatabase.getPackageStorage('');
        const pkg = generatePackage('readPkgTest');
        expect(store).not.toBeNull();
        if (store) {
          store.savePackage(pkg.name, pkg, err => {
            expect(err).toBeNull();

            store.readPackage(pkg.name, function onResponse(err, pkgJson) {
              expect(err).toBeNull();
              expect(pkgJson.name).toBe(pkg.name);
              done();
            });
          });
        }
      });

      test('should fails read a missing package', done => {
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(config, { logger });
        const store = cloudDatabase.getPackageStorage('');
        expect(store).not.toBeNull();
        if (store) {
          store.readPackage('missing404Pkg', function onResponse(err, pkgJson) {
            expect(err).not.toBeNull();
            expect(err.code).toBe('ENOENT');
            expect(err.message).toBe('no such package');
            done();
          });
        }
      });
    });

    describe('GoogleCloudStorageHandler:update', () => {
      test('should update an instance', done => {
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(config, { logger });
        const store = cloudDatabase.getPackageStorage('');
        const pkg = generatePackage('updatePkg');
        expect(store).not.toBeNull();
        if (store) {
          store.savePackage(pkg.name, pkg, err => {
            expect(err).toBeNull();

            store.deletePackage(pkg.name, err => {
              expect(err).toBeNull();
              done();
            });
          });
        }
      });

      test('should update and transform an instance', done => {
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(config, { logger });
        const store = cloudDatabase.getPackageStorage('');
        const pkg = generatePackage('updateTransPkg');

        expect(store).not.toBeNull();
        if (store) {
          store.createPackage(pkg.name, pkg, err => {
            expect(err).toBeNull();

            store.updatePackage(
              pkg.name,
              function handleUpdate(data, cb) {
                cb();
              },
              function writePackage(name, json, cb) {
                expect(json.test).toBe('test');
                cb(null);
              },
              function transformation(json) {
                json.test = 'test';
                return json;
              },
              function onEnd(err) {
                expect(err).toBeNull();
                done();
              }
            );
          });
        }
      });

      test('should fails on update due unknown package', done => {
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(config, { logger });
        const store = cloudDatabase.getPackageStorage('');
        expect(store).not.toBeNull();
        if (store) {
          store.updatePackage('fake404', () => {}, () => {}, () => {}, function onEnd(err) {
            expect(err).not.toBeNull();
            expect(err.code).toBe('ENOENT');
            expect(err.message).toBe('no such package');
            done();
          });
        }
      });

      test('should fails on update on fails updateHandler', done => {
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(config, { logger });
        const store = cloudDatabase.getPackageStorage('');
        expect(store).not.toBeNull();
        if (store) {
          store.updatePackage('fake404', () => {}, () => {}, () => {}, function onEnd(err) {
            expect(err).not.toBeNull();
            expect(err.code).toBe('ENOENT');
            expect(err.message).toBe('no such package');
            done();
          });
        }
      });
    });
  });
});
