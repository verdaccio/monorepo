// @flow

import path from 'path';
import mkdirp from 'mkdirp';
import fs from 'fs';
import rm from 'rmdir-sync';
import type {Logger} from '@verdaccio/types';
import type {ILocalPackageManager} from '@verdaccio/local-storage';
import LocalFS, {fileExist} from '../local-fs';
import pkg from './fixtures/pkg';

let localTempStorage: string;
const pkgFileName: string = 'package.json';

const logger: Logger = {
  error: (e)=> console.warn(e),
  info: (e)=> console.warn(e),
  debug: (e)=> console.warn(e),
  warn: (e)=> console.warn(e),
  child: (e)=> console.warn(e),
  http: (e)=> console.warn(e),
  trace: (e)=> console.warn(e),
};

beforeAll(() => {
  localTempStorage = path.join('./_storage');
  rm(localTempStorage);
});

describe('Local FS test', ()=> {

  describe('savePackage() group', ()=> {
    test('savePackage()', (done) => {
      const data: any = '{data:5}';
      const localFs = new LocalFS(path.join(localTempStorage, 'first-package'), logger);

      localFs.savePackage('pkg.1.0.0.tar.gz', data, (err)=> {
        expect(err).toBeNull();
        done();
      });
    });
  });

  describe('readPackage() group', ()=> {
    test('readPackage() success', (done) => {
      const localFs: ILocalPackageManager = new LocalFS(path.join(__dirname, 'fixtures/readme-test'), logger);

      localFs.readPackage(pkgFileName, (err, data)=> {
        expect(err).toBeNull();
        done();
      });
    });

    test('readPackage() fails', (done) => {
      const localFs: ILocalPackageManager = new LocalFS(path.join(__dirname, 'fixtures/readme-testt'), logger);

      localFs.readPackage(pkgFileName, (err)=> {
        expect(err).toBeTruthy();
        done();
      });
    });

    test('readPackage() fails corrupt', (done) => {
      const localFs: ILocalPackageManager = new LocalFS(path.join(__dirname, 'fixtures/readme-test-corrupt'), logger);

      localFs.readPackage('corrupt.js', (err)=> {
        expect(err).toBeTruthy();
        done();
      });
    });
  });

  describe('createPackage() group', ()=> {
    test('createPackage()', (done) => {
      const localFs = new LocalFS(path.join(localTempStorage, 'createPackage'), logger);

      localFs.createPackage(path.join(localTempStorage, 'package5'), pkg, (err)=> {
        expect(err).toBeNull();
        done();
      });
    });

    test('createPackage() fails by fileExist', (done) => {
      const localFs = new LocalFS(path.join(localTempStorage, 'createPackage'), logger);

      localFs.createPackage(path.join(localTempStorage, 'package5'), pkg, (err)=> {
        expect(err).not.toBeNull();
        expect(err.code).toBe(fileExist);
        done();
      });
    });

    describe('deletePackage() group', ()=> {
      test('deletePackage()', (done) => {
        const localFs = new LocalFS(path.join(localTempStorage, 'createPackage'), logger);

        // verdaccio removes the package.json instead the package name
        localFs.deletePackage('package.json', (err)=> {
          expect(err).toBeNull();
          done();
        });
      });
    });
  });

  describe('removePackage() group', ()=> {

    beforeEach(() => {
      mkdirp(path.join(localTempStorage, '_toDelete'));
    });

    test('removePackage() success', (done) => {
      const localFs: ILocalPackageManager = new LocalFS(path.join(localTempStorage, '_toDelete'), logger);
      localFs.removePackage((error)=> {
        expect(error).toBeNull();
        done();
      });
    });

    test('removePackage() fails', (done) => {
      const localFs: ILocalPackageManager = new LocalFS(path.join(localTempStorage, '_toDelete_fake'), logger);
      localFs.removePackage((error) => {
        expect(error).toBeTruthy();
        expect(error.code).toBe('ENOENT');
        done();
      });
    });
  });

  describe('readTarball() group', ()=> {

    test('readTarball() success', (done) => {
      const localFs: ILocalPackageManager = new LocalFS(path.join(__dirname, 'fixtures/readme-test'), logger);
      const readTarballStream = localFs.readTarball('test-readme-0.0.0.tgz');

      readTarballStream.on('error', function(err) {
        expect(err).toBeNull();
      });

      readTarballStream.on('content-length', function(content) {
        expect(content).toBe(352);
      });

      readTarballStream.on('end', function() {
        done();
      });

      readTarballStream.on('data', function(data) {
        expect(data).toBeDefined();
      });

    });

    test('readTarball() fails', (done) => {
      const localFs: ILocalPackageManager = new LocalFS(path.join(__dirname, 'fixtures/readme-test'), logger);
      const readTarballStream = localFs.readTarball('file-does-not-exist-0.0.0.tgz');

      readTarballStream.on('error', function(err) {
        expect(err).toBeTruthy();
        done();
      });

    });

  });

  describe('writeTarball() group', ()=> {
    beforeEach(() => {
      const writeTarballFolder: string = path.join(localTempStorage, '_writeTarball');
      rm(writeTarballFolder);
      mkdirp(writeTarballFolder);
    });

    test('writeTarball() success', (done) => {
      const newFileName: string = 'new-readme-0.0.0.tgz';
      const readmeStorage: ILocalPackageManager = new LocalFS(path.join(__dirname, 'fixtures/readme-test'), logger);
      const writeStorage: ILocalPackageManager = new LocalFS(path.join(__dirname, '../../_storage'), logger);
      const readTarballStream = readmeStorage.readTarball('test-readme-0.0.0.tgz');
      const writeTarballStream = writeStorage.writeTarball(newFileName);

      writeTarballStream.on('error', function(err) {
        expect(err).toBeNull();
        done();
      });

      writeTarballStream.on('success', function() {
        const fileLocation: string = path.join(__dirname, '../../_storage', newFileName);

        expect(fs.existsSync(fileLocation)).toBe(true);
        done();
      });

      readTarballStream.on('end', function() {
        writeTarballStream.done();
      });

      writeTarballStream.on('end', function() {
        done();
      });

      writeTarballStream.on('data', function(data) {
        expect(data).toBeDefined();
      });

      readTarballStream.on('error', function(err) {
        expect(err).toBeNull();
        done();
      });

      readTarballStream.pipe(writeTarballStream);

    });

    test('writeTarball() abort', (done) => {
      const newFileLocationFolder: string = path.join(localTempStorage, '_writeTarball');
      const newFileName: string = 'new-readme-abort-0.0.0.tgz';
      const readmeStorage: ILocalPackageManager = new LocalFS(path.join(__dirname, 'fixtures/readme-test'), logger);
      const writeStorage: ILocalPackageManager = new LocalFS(newFileLocationFolder, logger);
      const readTarballStream = readmeStorage.readTarball('test-readme-0.0.0.tgz');
      const writeTarballStream = writeStorage.writeTarball(newFileName);

      writeTarballStream.on('error', function(err) {
        expect(err).toBeTruthy();
        done();
      });

      writeTarballStream.on('data', function(data) {
        expect(data).toBeDefined();
        writeTarballStream.abort();
      });

      readTarballStream.pipe(writeTarballStream);

    });

  });

  // describe('lockAndReadJSON() group', ()=> {

  //   test('lockAndReadJSON() success', (done) => {
  //     const localFs: ILocalPackageManager = new LocalFS(path.join(__dirname, 'fixtures/readme-test'), logger);

  //     localFs.lockAndReadJSON(pkgFileName, (err, res) => {
  //       expect(err).toBeNull();
  //       done();
  //     });
  //   });

  //   test('lockAndReadJSON() fails', (done) => {
  //     const localFs: ILocalPackageManager = new LocalFS(path.join(__dirname, 'fixtures/readme-testt'), logger);

  //     localFs.lockAndReadJSON(pkgFileName, (err, res) => {
  //       expect(err).toBeTruthy();
  //       done();
  //     });
  //   });

  // });

});
