// @flow

import path from 'path';
import mkdirp from 'mkdirp';
import rm from 'rmdir-sync';
import type {ILocalFS, Logger} from '@verdaccio/types';
import LocalFS from '../local-fs';

let localFs: ILocalFS;
let localTempStorage: string;
const pkgFileName: string = 'package.json';

const logger: Logger = {
  error: (e)=> console.warn(e),
  info: (e)=> console.warn(e),
  debug: (e)=> console.warn(e),
  child: (e)=> console.warn(e),
  http: (e)=> console.warn(e),
  trace: (e)=> console.warn(e),
};

beforeAll(() => {
  localFs = new LocalFS('.', logger);
  localTempStorage = path.join('./_storage');
  rm(localTempStorage);
});

describe('Local FS test', ()=> {

  describe('writeJSON() group', ()=> {
    beforeEach(() => {

    });

    test('writeJSON()', (done) => {
      const data: any = '{data:5}';

      localFs.writeJSON(path.join(localTempStorage, 'package4'), data, (err)=> {
        expect(err).toBeNull();
        done();
      });
    });
  });

  test('createJSON()', (done) => {
    localFs.createJSON(path.join(localTempStorage, 'package5'), '{data:6}', (err)=> {
      expect(err).toBeNull();
      done();
    });
  });

  test('deleteJSON()', (done) => {
    localFs.deleteJSON(path.join(localTempStorage, 'package5'), (err)=> {
      expect(err).toBeNull();
      done();
    });
  });

  describe('removePackage() group', ()=> {

    beforeEach(() => {
      mkdirp(path.join(localTempStorage, '_toDelete'));
    });

    test('removePackage() success', (done) => {
      localFs.removePackage(path.join(localTempStorage, '_toDelete'), (err)=> {
        expect(err).toBeNull();
        done();
      });
    });

    test('removePackage() fails', (done) => {
      localFs.removePackage(path.join(localTempStorage, '_toDelete_fake'), (err) => {
        expect(err).toBeDefined();
        expect(err.code).toBe('ENOENT');
        done();
      });
    });
  });

  describe('createReadStream() group', ()=> {

    test('createReadStream() success', (done) => {
      const localFs: ILocalFS = new LocalFS(path.join(__dirname, 'fixtures/readme-test'), logger);
      const readTarballStream = localFs.createReadStream('test-readme-0.0.0.tgz');

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

    test('createReadStream() fails', (done) => {
      const localFs: ILocalFS = new LocalFS(path.join(__dirname, 'fixtures/readme-test'), logger);
      const readTarballStream = localFs.createReadStream('file-does-not-exist-0.0.0.tgz');

      readTarballStream.on('error', function(err) {
        expect(err).toBeDefined();
        done();
      });

    });

  });

  describe('lockAndReadJSON() group1', ()=> {

    test('lockAndReadJSON() success', (done) => {
      const localFs: ILocalFS = new LocalFS(path.join(__dirname, 'fixtures/readme-test'), logger);

      localFs.lockAndReadJSON(pkgFileName, (err, res) => {
        expect(err).toBeNull();
        done();
      });
    });

    test('lockAndReadJSON() fails', (done) => {
      const localFs: ILocalFS = new LocalFS(path.join(__dirname, 'fixtures/readme-testt'), logger);

      localFs.lockAndReadJSON(pkgFileName, (err, res) => {
        expect(err).toBeDefined();
        done();
      });
    });

  });

});
