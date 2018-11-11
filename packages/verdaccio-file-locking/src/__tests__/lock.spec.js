import path from 'path';
import fs from 'fs';
import {lockFile, unlockFile, readFile} from '../index';

const getFilePath = (filename) => {
  return path.resolve(__dirname, `assets/${filename}`);
};

const removeTempFile = (filename) => {
  const filepath = getFilePath(filename);
  fs.unlink(filepath, (error) => {
    if (error) throw error;
  });
};

describe('testing locking', () => {
  test('file should be found to be locked', (done) => {
    lockFile(getFilePath('package.json'), (error) => {
      expect(error).toBeNull();
      removeTempFile('package.json.lock');
      done();
    });
  });

  test('file should fail to be found to be locked', (done) => {
    lockFile(getFilePath('package.fail.json'), (error) => {
      expect(error.message).toMatch(
        /ENOENT: no such file or directory, stat '(.*)package.fail.json'/
      );
      done();
    });
  });

  test('file should to be found to be unLock', (done) => {
    unlockFile(getFilePath('package.json.lock'), (error) => {
      expect(error).toBeNull();
      done();
    });
  });

  test('read file with no options should to be found to be read it as string', (done) => {
    readFile(getFilePath('package.json'), (error, data) => {
      expect(error).toBeNull();
      expect(data).toMatchSnapshot();
      done();
    });
  });

  test('read file with no options should to be found to be read it as object', (done) => {
    const options = {
      parse: true,
    };
    readFile(getFilePath('package.json'), options, (error, data) => {
      expect(error).toBeNull();
      expect(data).toMatchSnapshot();
      done();
    });
  });

  test('read file with options (parse) should to be not found to be read it', (done) => {
    const options = {
      parse: true,
    };
    readFile(getFilePath('package.fail.json'), options, (error) => {
      expect(error.message).toMatch(
        /ENOENT: no such file or directory, open '(.*)package.fail.json'/
      );
      done();
    });
  });

  test('read file with options should to be found to be read it and fails to be parsed', (done) => {
    const options = {
      parse: true,
    };
    readFile(getFilePath('wrong.package.json'), options, (error) => {
      expect(error.message).toEqual(
        'Unexpected token } in JSON at position 44'
      );
      done();
    });
  });

  test('read file with  options (parse, lock) should to be found to be read it as object', (done) => {
    const options = {
      parse: true,
      lock: true,
    };
    readFile(getFilePath('package2.json'), options, (error, data) => {
      expect(error).toBeNull();
      expect(data).toMatchSnapshot();
      removeTempFile('package2.json.lock');
      done();
    });
  });

  test('read file with options (parse, lock) should to be found to be read it and fails to be parsed', (done) => {
    const options = {
      parse: true,
      lock: true,
    };
    readFile(getFilePath('wrong.package.json'), options, (error) => {
      expect(error.message).toEqual(
        'Unexpected token } in JSON at position 44'
      );
      removeTempFile('wrong.package.json.lock');
      done();
    });
  });
});
