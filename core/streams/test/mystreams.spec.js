import {ReadTarball, UploadTarball} from '../src/index';

describe('mystreams', () => {

  test('should delay events on ReadTarball abort', (cb) => {
    const readTballStream = new ReadTarball({});
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
    const uploadTballStream = new UploadTarball({});
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

