// @flow
import fs from 'fs';
import path from 'path';
import GoogleCloudDatabase from '../src/index';
import storageConfig from './partials/config';
import pkgExample from './partials/pkg';
import { generatePackage } from './partials/utils.helpers';

import type { Logger } from '@verdaccio/types';
import type { ILocalData, ILocalPackageManager } from '@verdaccio/local-storage';

const logger: Logger = {
  error: e => console.warn(e),
  info: e => console.warn(e),
  debug: e => console.warn(e),
  child: e => console.warn(e),
  warn: e => {},
  http: e => console.warn(e),
  trace: e => console.warn(e)
};

describe('Google Cloud Storage', () => {
  describe('Google Cloud DataStore', () => {
    // **** DataStore

    describe('should test create instances', () => {
      test('should create an instance properly', () => {
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });

        expect(cloudDatabase).toBeDefined();
      });

      test('should create an instance fails bucket name invalid', () => {
        expect(function() {
          // storageConfig.bucket = undefined;
          new GoogleCloudDatabase(Object.assign({}, storageConfig, { bucket: undefined }), { logger });
        }).toThrow(new Error('Google Cloud Storage requires a bucket name, please define one.'));
      });

      test('should create an instance fails projectId invalid', () => {
        expect(function() {
          // storageConfig.projectId = undefined;
          new GoogleCloudDatabase(Object.assign({}, storageConfig, { projectId: undefined }), { logger });
        }).toThrow(new Error('Google Cloud Storage requires a ProjectId.'));
      });
    });

    describe('DataStore basic calls', () => {
      test('should create an Entity', () => {
        // ** add, remove, get, getPackageStorage

        const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
        cloudDatabase.add(pkgExample.name, err => {
          expect(err).toBeNull();
          cloudDatabase.get((err, results) => {
            expect(results).not.toBeNull();
            expect(err).toBeNull();
            expect(results).toHaveLength(1);
            expect(results[0]).toBe(pkgExample.name);
          });
        });
      });

      // test('should delete an entity', () => {
      //   const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
      //
      //   cloudDatabase.remove(pkgExample.name, (err, result) => {
      //     expect(err).toBeNull();
      //     expect(result).not.toBeNull();
      //   });
      // });
      //
      // test('should fails on delete remove an entity', () => {
      //   const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
      //
      //   cloudDatabase.remove('fakeName', err => {
      //     expect(err).not.toBeNull();
      //     expect(err.message).toMatch(/not found/);
      //   });
      // });

      test('should get a new instance package storage', () => {
        const cloudDatabase = new GoogleCloudDatabase(storageConfig, { logger });
        const store: ILocalPackageManager = cloudDatabase.getPackageStorage('newInstance');
        expect(store).not.toBeNull();
        expect(store).toBeDefined();
      });
    });

    // FIXME: missing, getSecret, setSecret
  });

  /// **** Storage

  describe('Google Cloud Storage', () => {
    describe('GoogleCloudStorageHandler:delete', () => {
      test('should delete an instance', done => {
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        expect(store).not.toBeNull();
        if (store) {
          store.deletePackage(pkgExample.name, err => {
            expect(err).toBeNull();
            done();
          });
        }
      });

      //FIX LATER
      test.skip('should fail on delete an instance', done => {
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
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
        const cloudDatabase = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        expect(store).not.toBeNull();
        if (store) {
          store.removePackage(err => {
            // FIXME: we need to implement removePackage
            // expect(err).toBeNull();
            done();
          });
        }
      });
    });

    describe('GoogleCloudStorageHandler:read', () => {
      const packageName: string = 'readPkgTest';
      beforeEach(done => {
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage('');
        const pkg = generatePackage(packageName);
        expect(store).not.toBeNull();
        if (store) {
          store.savePackage(pkg.name, pkg, err => {
            expect(err).toBeNull();
            done();
          });
        }
      });

      test('should read a package', done => {
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(packageName);
        const pkg = generatePackage(packageName);
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
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
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
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
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
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
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
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
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
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
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

    describe('GoogleCloudStorageHandler:: writeFile', () => {
      const tarballFile = path.join(__dirname, '/partials/test-pkg/', 'test-pkg-1.0.0.tgz');

      test('should write a tarball successfully push data', done => {
        const bufferFile = fs.readFileSync(tarballFile);
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        expect(store).not.toBeNull();
        const writeTarballStream = store.writeTarball('test-pkg-1.0.0.tgz');

        writeTarballStream.on('error', function(err) {
          done.fail(err);
        });

        writeTarballStream.on('success', function() {
          done();
        });

        writeTarballStream.end(bufferFile);
        writeTarballStream.done();
      });

      test('should write a abort successfully push data', done => {
        const bufferFile = fs.readFileSync(tarballFile);
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        expect(store).not.toBeNull();
        const writeTarballStream = store.writeTarball('test-pkg-1.0.0.tgz');

        writeTarballStream.on('error', function(err) {
          expect(err).not.toBeNull();
          expect(err.message).toMatch(/transmision aborted/);
          done();
        });

        writeTarballStream.on('data', data => {
          expect(data).toBeDefined();
          writeTarballStream.abort();
        });

        writeTarballStream.on('success', function() {
          done.fail(new Error('success should not be called'));
        });

        writeTarballStream.end(bufferFile);
        writeTarballStream.done();
      });
    });

    describe.only('GoogleCloudStorageHandler:: readFile', () => {
      test('should read a tarball successfully', done => {
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        expect(store).not.toBeNull();
        const readTarballStream = store.readTarball('test-pkg-1.0.0.tgz');
        let isOpen = false;

        readTarballStream.on('data', data => {
          expect(data).toBeDefined();
        });

        readTarballStream.on('open', function() {
          isOpen = true;
        });

        readTarballStream.on('content-length', contentLength => {
          expect(contentLength).toBeDefined();
        });

        readTarballStream.on('error', () => {
          done.fail(new Error('should not fail'));
        });

        readTarballStream.on('end', () => {
          expect(isOpen).toBe(true);
          done();
        });
      });

      test('should fails with 404 on get a tarball', done => {
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        let isOpen = false;
        expect(store).not.toBeNull();
        const readTarballStream = store.readTarball('fake-tarball.tgz');

        readTarballStream.on('data', function(data) {
          expect(data).toBeUndefined();
        });

        readTarballStream.on('open', function() {
          isOpen = true;
        });

        readTarballStream.on('error', function(err) {
          expect(err).not.toBeNull();
          // this is really important, verdaccio handle such errors instead 404
          expect(err.code).toBe('ENOENT');
          expect(err.message).toMatch(/no such package/);
          expect(isOpen).toBe(true);
          done();
        });
      });

      test('should abort successfully get a tarball', done => {
        let isOpen = false;
        const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        expect(store).not.toBeNull();
        const readTarballStream = store.readTarball('test-pkg-1.0.0.tgz');

        readTarballStream.on('data', function() {
          readTarballStream.abort();
        });

        readTarballStream.on('open', function() {
          isOpen = true;
        });

        readTarballStream.on('error', function(err) {
          expect(err).not.toBeNull();
          expect(err.statusCode).toBe(400);
          expect(err.message).toMatch(/transmision aborted/);
          expect(isOpen).toBe(true);
          done();
        });
      });
    });
  });
});
