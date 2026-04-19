import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

import { lockFile, readFile, unlockFile } from '../src/index';

interface Error {
  message: string;
}

const getFilePath = (filename: string): string => {
  return path.resolve(import.meta.dirname, `assets/${filename}`);
};

const removeTempFile = (filename: string): void => {
  const filepath = getFilePath(filename);
  fs.unlink(filepath, (error) => {
    if (error) {
      throw error;
    }
  });
};

describe('testing locking', () => {
  describe('lockFile', () => {
    test('file should be found to be locked', () => {
      return new Promise<void>((resolve) => {
        lockFile(getFilePath('package.json'), (error: Error) => {
          expect(error).toBeNull();
          removeTempFile('package.json.lock');
          resolve();
        });
      });
    });

    test('file should fail to be found to be locked', () => {
      return new Promise<void>((resolve) => {
        lockFile(getFilePath('package.fail.json'), (error: Error) => {
          expect(error.message).toMatch(
            /ENOENT: no such file or directory, stat '(.*)package.fail.json'/
          );
          resolve();
        });
      });
    });
  });

  describe('unlockFile', () => {
    test('file should to be found to be unLock', () => {
      return new Promise<void>((resolve) => {
        unlockFile(getFilePath('package.json.lock'), (error: Error) => {
          expect(error).toBeNull();
          resolve();
        });
      });
    });
  });

  describe('readFile', () => {
    test('read file with no options should to be found to be read it as string', () => {
      return new Promise<void>((resolve) => {
        readFile(getFilePath('package.json'), {}, (error: Error, data: string) => {
          expect(error).toBeNull();
          resolve();
        });
      });
    });

    test('read file with no options should to be found to be read it as object', () => {
      return new Promise<void>((resolve) => {
        const options = {
          parse: true,
        };
        readFile(getFilePath('package.json'), options, (error: Error, data: string) => {
          expect(error).toBeNull();
          resolve();
        });
      });
    });

    test('read file with options (parse) should to be not found to be read it', () => {
      return new Promise<void>((resolve) => {
        const options = {
          parse: true,
        };
        readFile(getFilePath('package.fail.json'), options, (error: Error) => {
          expect(error.message).toMatch(
            /ENOENT: no such file or directory, open '(.*)package.fail.json'/
          );
          resolve();
        });
      });
    });

    test.skip('read file with options should to be found to be read it and fails to be parsed', () => {
      return new Promise<void>((resolve) => {
        const options = {
          parse: true,
        };
        const errorMessage =
          process.platform === 'win32'
            ? 'Unexpected token } in JSON at position 47'
            : 'Unexpected token } in JSON at position 44';
        readFile(getFilePath('wrong.package.json'), options, (error: Error) => {
          expect(error.message).toEqual(errorMessage);
          resolve();
        });
      });
    });

    test('read file with  options (parse, lock) should to be found to be read it as object', () => {
      return new Promise<void>((resolve) => {
        const options = {
          parse: true,
          lock: true,
        };
        readFile(getFilePath('package2.json'), options, (error: Error, data: string) => {
          expect(error).toBeNull();
          removeTempFile('package2.json.lock');
          resolve();
        });
      });
    });

    test.skip('read file with options (parse, lock) should to be found to be read it and fails to be parsed', () => {
      return new Promise<void>((resolve) => {
        const options = {
          parse: true,
          lock: true,
        };
        const errorMessage = 'Expected double-quoted property name in JSON at position 44';
        readFile(getFilePath('wrong.package.json'), options, (error: Error) => {
          expect(error.message).toEqual(errorMessage);
          removeTempFile('wrong.package.json.lock');
          resolve();
        });
      });
    });
  });
});
