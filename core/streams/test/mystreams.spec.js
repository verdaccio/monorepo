// @flow

import {ReadTarball, UploadTarball} from '../src/index';

import type {IUploadTarball, IReadTarball} from '@verdaccio/streams';

describe('mystreams', () => {

  test('should delay events on ReadTarball abort', (cb) => {
    const readTballStream: IReadTarball = new ReadTarball({});
    readTballStream.abort();
    setTimeout(function() {
      readTballStream.abort = function() {
        cb();
      };
      readTballStream.abort = function() {
        throw Error('fail');
      };
    }, 10);
  });

  test('should delay events on UploadTarball abort', (cb) => {
    const uploadTballStream: IUploadTarball = new UploadTarball({});
    uploadTballStream.abort();
    setTimeout(function() {
      uploadTballStream.abort = function() {
        cb();
      };
      uploadTballStream.abort = function() {
        throw Error('fail');
      };
    }, 10);
  });

});

