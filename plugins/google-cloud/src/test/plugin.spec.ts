import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import GoogleCloudDatabase from '../index';
import { pkgFileName } from '../storage';
import storageConfig from './partials/config';
import pkgExample from './partials/pkg';
import { generatePackage } from './partials/utils.helpers';

import { VerdaccioConfigGoogleStorage } from '../types';

import { Logger, ILocalData, ILocalPackageManager, Callback, Package } from '@verdaccio/types';

type ITestLocalData = ILocalData<VerdaccioConfigGoogleStorage>;

const logger: Logger = {
  error: e => {},
  info: e => {},
  debug: e => {},
  child: e => {},
  warn: e => {},
  http: e => {},
  trace: e => {}
};

describe('Google Cloud Storage', () => {
  // jest.setTimeout(1000);
  describe('Google Cloud DataStore', () => {
    // **** DataStore

    describe('should test create instances', () => {
      test('should create an instance properly', () => {
        const cloudDatabase = new GoogleCloudDatabase(storageConfig, { logger });

        expect(cloudDatabase).toBeDefined();
      });

      test('should create an instance fails bucket name invalid', () => {
        expect(() => {
          const testConf: VerdaccioConfigGoogleStorage = _.clone(storageConfig);
          delete testConf.bucket;

          new GoogleCloudDatabase(testConf, { logger });
        }).toThrow(new Error('Google Cloud Storage requires a bucket name, please define one.'));
      });

      test('should create an instance fails projectId invalid', () => {
        expect(() => {
          const testConf: VerdaccioConfigGoogleStorage = _.clone(storageConfig);
          delete testConf.projectId;

          new GoogleCloudDatabase(testConf, { logger });
        }).toThrow(new Error('Google Cloud Storage requires a ProjectId.'));
      });
    });

    describe('DataStore basic calls', () => {
      const pkgName = 'dataBasicItem1';
      const deleteItem = (name: any, done: any) => {
        const cloudDatabase = new GoogleCloudDatabase(storageConfig, { logger });
        /* eslint-disable */
        cloudDatabase.remove(name, (err: any, result: any) => {
          /* eslint-disable */
          expect(result).not.toBeNull();
          done();
        });
      };

      beforeAll(done => {
        return deleteItem(pkgName, done);
      });

      afterAll(done => {
        return deleteItem(pkgName, done);
      });

      test('should create an Entity', done => {
        // ** add, remove, get, getPackageStorage

        const cloudDatabase = new GoogleCloudDatabase(storageConfig, { logger });
        cloudDatabase.add(pkgName, (err: any) => {
          expect(err).toBeNull();
          cloudDatabase.get((err: any, results: any) => {
            expect(results).not.toBeNull();
            expect(err).toBeNull();
            expect(results).toHaveLength(1);
            expect(results[0]).toBe(pkgName);
            done();
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

  // storage test

  describe('Google Cloud Storage', () => {
    const createPackage = (cloudDatabase: ITestLocalData, name: string, done: jest.DoneCallback) => {
      const pkg = generatePackage(name);
      const store = cloudDatabase.getPackageStorage(pkg.name);
      expect(store).not.toBeNull();
      if (store) {
        store.createPackage(pkg.name, pkg, (err: any) => {
          expect(err).toBeNull();
          expect(pkg.name).toBe(pkg.name);
          done();
        });
      }
    };
    const deletePackage = (cloudDatabase: ITestLocalData, name: string, done: jest.DoneCallback) => {
      const store = cloudDatabase.getPackageStorage(name);
      expect(store).not.toBeNull();
      if (store) {
        // here we set package.json, name should be taken from class level
        store.deletePackage(pkgFileName, () => {
          done();
        });
      }
    };

    describe('GoogleCloudStorageHandler:create', () => {
      const pkgName: string = 'createPkg1';

      test('should create a package', (done: jest.DoneCallback) => {
        const pkg = generatePackage(pkgName);
        const cloudDatabase: ITestLocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgName);
        expect(store).not.toBeNull();
        if (store) {
          store.createPackage(pkgName, pkg, (err: any) => {
            expect(err).toBeNull();
            expect(pkg.name).toBe(pkgName);
            done();
          });
        }
      });

      test('should fails on package already exist', done => {
        const pkg = generatePackage(pkgName);

        const cloudDatabase: ITestLocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgName);
        expect(store).not.toBeNull();
        if (store) {
          store.createPackage(pkgName, pkg, (err: any) => {
            expect(err).not.toBeNull();
            store.createPackage(pkgName, pkg, (err: any) => {
              expect(err).not.toBeNull();
              expect(err.code).toMatch(/EEXISTS/);
              expect(err.message).toMatch(/package already exist/);
              done();
            });
          });
        }
      });

      describe('GoogleCloudStorageHandler:save', () => {
        const pkgName: string = 'savePkg1';
        test('should save a package', done => {
          const pkg = generatePackage(pkgName);

          const cloudDatabase: ITestLocalData = new GoogleCloudDatabase(storageConfig, { logger });
          const store = cloudDatabase.getPackageStorage(pkgName);
          expect(store).not.toBeNull();
          if (store) {
            store.createPackage(pkgName, pkg, (err: any) => {
              expect(err).not.toBeNull();
              expect(pkg.name).toBe(pkgName);
              done();
            });
          }
        });
      });
    });

    describe('GoogleCloudStorageHandler:delete', () => {
      const pkgName: string = 'deletePkg1';
      const cloudDatabase: ITestLocalData = new GoogleCloudDatabase(storageConfig, { logger });

      beforeAll(done => {
        createPackage(cloudDatabase, pkgName, done);
      });

      afterAll(done => {
        deletePackage(cloudDatabase, pkgName, done);
      });

      test('should delete an instance', done => {
        const store = cloudDatabase.getPackageStorage(pkgName);
        expect(store).not.toBeNull();
        if (store) {
          store.deletePackage(pkgFileName, (err: any) => {
            expect(err).toBeNull();
            done();
          });
        }
      });

      test('should fail on delete an instance', done => {
        const store = cloudDatabase.getPackageStorage('404Fake');
        expect(store).not.toBeNull();
        if (store) {
          store.deletePackage(pkgFileName, (err: any) => {
            expect(err).not.toBeNull();
            expect(err.message).toMatch(/no such package/);
            expect(err.code).toMatch(/ENOENT/);
            done();
          });
        }
      });

      test.skip('should remove an entire package', done => {
        //FIXME: relocate this test
        const cloudDatabase = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        expect(store).not.toBeNull();
        if (store) {
          store.removePackage((err: any) => {
            // FIXME: we need to implement removePackage
            expect(err).toBeNull();
            done();
          });
        }
      });
    });

    describe('GoogleCloudStorageHandler:read', () => {
      const packageName: string = 'readPkgTest';
      const pkg = generatePackage(packageName);
      const cloudDatabase: ITestLocalData = new GoogleCloudDatabase(storageConfig, { logger });

      beforeAll(done => {
        createPackage(cloudDatabase, packageName, done);
      });

      afterAll(done => {
        return deletePackage(cloudDatabase, packageName, done);
      });

      test('should read a package', done => {
        const store = cloudDatabase.getPackageStorage(packageName);
        expect(store).not.toBeNull();
        if (store) {
          store.readPackage(pkg.name, (err: any, pkgJson: Package) => {
            expect(err).toBeNull();
            expect(pkgJson.name).toBe(pkg.name);
            done();
          });
        }
      });

      test('should fails read a missing package', done => {
        const cloudDatabase: ITestLocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage('');
        expect(store).not.toBeNull();
        if (store) {
          store.readPackage('missing404Pkg', (err: any) => {
            expect(err).not.toBeNull();
            expect(err.code).toBe('ENOENT');
            expect(err.message).toBe('no such package');
            done();
          });
        }
      });
    });

    describe('GoogleCloudStorageHandler:update', () => {
      const cloudDatabase: ITestLocalData = new GoogleCloudDatabase(storageConfig, { logger });
      const packageName: string = 'updateTransPkg';
      beforeAll(done => {
        createPackage(cloudDatabase, packageName, done);
      });

      afterAll(done => {
        return deletePackage(cloudDatabase, packageName, done);
      });

      // test('should update an instance', done => {
      //   const cloudDatabase: ILocalData = new GoogleCloudDatabase(storageConfig, { logger });
      //   const store = cloudDatabase.getPackageStorage(packageName);
      //   const pkg = generatePackage(packageName);
      //   expect(store).not.toBeNull();
      //   if (store) {
      //     store.deletePackage(pkg.name, err => {
      //       expect(err).toBeNull();
      //       done();
      //     });
      //   }
      // });

      test('should update and transform an instance', done => {
        const pkg = generatePackage(packageName);
        const store = cloudDatabase.getPackageStorage(packageName);

        expect(store).not.toBeNull();
        if (store) {
          store.updatePackage(
            pkg.name,
            (data: any, cb: Callback) => {
              // Handle Update
              cb();
            },
            (name: string, json: any, cb: Callback) => {
              // Write Package
              expect(json.test).toBe('test');
              cb(null);
            },
            (json: any) => {
              // Transformation
              json.test = 'test';
              return json;
            },
            (err: any) => {
              // on End
              expect(err).toBeNull();
              done();
            }
          );
        }
      });

      test('should fails on update due unknown package', done => {
        const store = cloudDatabase.getPackageStorage('');
        expect(store).not.toBeNull();
        if (store) {
          store.updatePackage(
            'fake404',
            () => {},
            () => {},
            () => {},
            (err: any) => {
              expect(err).not.toBeNull();
              expect(err.code).toBe('ENOENT');
              expect(err.message).toBe('no such package');
              done();
            }
          );
        }
      });

      test('should fails on update on fails updateHandler', done => {
        const store = cloudDatabase.getPackageStorage('');
        expect(store).not.toBeNull();
        if (store) {
          store.updatePackage(
            'fake404',
            () => {},
            () => {},
            () => {},
            (err: any) => {
              expect(err).not.toBeNull();
              expect(err.code).toBe('ENOENT');
              expect(err.message).toBe('no such package');
              done();
            }
          );
        }
      });
    });

    describe.skip('GoogleCloudStorageHandler:: writeFile', () => {
      const tarballFile = path.join(__dirname, '/partials/test-pkg/', 'test-pkg-1.0.0.tgz');

      test('should write a tarball successfully push data', done => {
        const bufferFile = fs.readFileSync(tarballFile);
        const cloudDatabase: ITestLocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        expect(store).not.toBeNull();
        if (store) {
          const writeTarballStream = store.writeTarball('test-pkg-1.0.0.tgz');

          writeTarballStream.on('error', (err: any) => {
            done.fail(err);
          });

          writeTarballStream.on('success', () => {
            done();
          });

          writeTarballStream.end(bufferFile);
          writeTarballStream.done();
        }
      });

      test('should write a abort successfully push data', done => {
        const bufferFile = fs.readFileSync(tarballFile);
        const cloudDatabase: ITestLocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        expect(store).not.toBeNull();
        if (store) {
          const writeTarballStream = store.writeTarball('test-pkg-1.0.0.tgz');

          writeTarballStream.on('error', (err: any) => {
            expect(err).not.toBeNull();
            expect(err.message).toMatch(/transmision aborted/);
            done();
          });

          writeTarballStream.on('data', data => {
            expect(data).toBeDefined();
            writeTarballStream.abort();
          });

          writeTarballStream.on('success', () => {
            done.fail(new Error('success should not be called'));
          });

          writeTarballStream.end(bufferFile);
          writeTarballStream.done();
        }
      });
    });

    describe.skip('GoogleCloudStorageHandler:: readFile', () => {
      test('should read a tarball successfully', done => {
        const cloudDatabase: ITestLocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        expect(store).not.toBeNull();
        if (store) {
          const readTarballStream = store.readTarball('test-pkg-1.0.0.tgz');
          let isOpen = false;

          readTarballStream.on('data', data => {
            expect(data).toBeDefined();
          });

          readTarballStream.on('open', () => {
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
        }
      });

      test('should fails with 404 on get a tarball', done => {
        const cloudDatabase: ITestLocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        let isOpen = false;
        expect(store).not.toBeNull();
        if (store) {
          const readTarballStream = store.readTarball('fake-tarball.tgz');

          readTarballStream.on('data', (data: any) => {
            expect(data).toBeUndefined();
          });

          readTarballStream.on('open', () => {
            isOpen = true;
          });

          readTarballStream.on('error', (err: any) => {
            expect(err).not.toBeNull();
            // this is really important, verdaccio handle such errors instead 404
            expect(err.code).toBe('ENOENT');
            expect(err.message).toMatch(/no such package/);
            expect(isOpen).toBe(true);
            done();
          });
        }
      });

      test('should abort successfully get a tarball', done => {
        let isOpen = false;
        const cloudDatabase: ITestLocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        expect(store).not.toBeNull();
        if (store) {
          const readTarballStream = store.readTarball('test-pkg-1.0.0.tgz');

          readTarballStream.on('data', () => {
            readTarballStream.abort();
          });

          readTarballStream.on('open', () => {
            isOpen = true;
          });

          readTarballStream.on('error', (err: any) => {
            expect(err).not.toBeNull();
            expect(err.statusCode).toBe(400);
            expect(err.message).toMatch(/transmision aborted/);
            expect(isOpen).toBe(true);
            done();
          });
        }
      });
    });

    describe('GoogleCloudStorageHandler:: deleteTarball', () => {
      test.skip('should delete successfully get a tarball', done => {
        const cloudDatabase: ITestLocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        if (store) {
          store.deletePackage('test-pkg-1.0.0.tgz', (err: any) => {
            expect(err).toBeNull();
            done();
          });
        }
      });

      test('should fails on delete a tarball', done => {
        const cloudDatabase: ITestLocalData = new GoogleCloudDatabase(storageConfig, { logger });
        const store = cloudDatabase.getPackageStorage(pkgExample.name);
        if (store) {
          store.deletePackage('test-pkg-1.0.0.tgz', (err: any) => {
            expect(err).not.toBeNull();
            // expect(err.code).toBe('ENOENT');
            expect(err.message).toMatch(/no such package ENOENT/);
            done();
          });
        }
      });
    });
  });
});
