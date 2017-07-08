import * as _ from 'lodash';
import assert from 'assert';
import path from 'path';
import {lockFile, unlockFile, readFile} from '../src/index';

describe('testing locking', function() {

  it('file should be found to be locked', (done) => {
      lockFile(path.join(__dirname, 'assets/package.json'), (err) => {
        if (err) {
          assert.ok(false);
        }
        assert.ok(true);
        done();
      });
  });

  it('file should fail to be found to be locked', (done) => {
    lockFile(path.join(__dirname, 'assets/package.fail.json'), (err) => {
      if (err) {
        assert.ok(_.isError(err));
        done();
      }
    });
  });

  it('file should to be found to be unLock', (done) => {
    unlockFile(path.join(__dirname, 'assets/package.json.lock'), (err) => {
      if (err) {
        assert.ok(false);
      } else {
        assert.ok(true);
      }
      done();
    });
  });

  it('read file with no options should to be found to be read it as string', (done) => {
    readFile(path.join(__dirname, 'assets/package.json'), (err, data) => {
      if (err) {
        assert.ok(false);
      } else {
        assert.ok(_.isString(data));
      }
      done();
    });
  });

  it('read file with no options should to be found to be read it as object', (done) => {
    const options = {
      parse: true,
    };
    readFile(path.join(__dirname, 'assets/package.json'), options, (err, data) => {
      if (err) {
        assert.ok(false);
      } else {
        assert.ok(_.isObject(data));
      }
      done();
    });
  });

  it('read file with options (parse) should to be not found to be read it', (done) => {
    const options = {
      parse: true,
    };
    readFile(path.join(__dirname, 'assets/package.fail.json'), options, (err) => {
      if (err) {
        assert.ok(_.isError(err));
        done();
      }
      assert.ok(false);
    });
  });

  it('read file with options should to be found to be read it and fails to be parsed', (done) => {
    const options = {
      parse: true,
    };
    readFile(path.join(__dirname, 'assets/wrong.package.json'), options, (err) => {
      if (err) {
        assert.ok(_.isError(err));
        done();
      }
      assert.ok(false);
    });
  });

  it('read file with  options (parse, lock) should to be found to be read it as object', (done) => {
    const options = {
      parse: true,
      lock: true,
    };
    readFile(path.join(__dirname, 'assets/package2.json'), options, (err, data) => {
      if (err) {
        assert.ok(false);
      } else {
        assert.ok(_.isObject(data));
      }
      done();
    });
  });

  it('read file with options (parse, lock) should to be found to be read it and fails to be parsed', (done) => {
    const options = {
      parse: true,
      lock: true,
    };
    readFile(path.join(__dirname, 'assets/wrong.package.json'), options, (err) => {
      if (err) {
        assert.ok(_.isError(err));
        done();
      }
      assert.ok(false);
    });
  });

});
