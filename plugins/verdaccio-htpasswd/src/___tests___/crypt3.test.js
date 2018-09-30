import { createSalt } from '../crypt3';

jest.mock('crypto', () => {
  return {
    randomBytes: () => {
      return {
        toString: () => '/UEGzD0RxSNDZA=='
      };
    }
  };
});

describe('createSalt', () => {
  test('should match with the correct salt type', () => {
    expect(createSalt('md5')).toEqual('$1$/UEGzD0RxSNDZA==');
    expect(createSalt('blowfish')).toEqual('$2a$/UEGzD0RxSNDZA==');
    expect(createSalt('sha256')).toEqual('$5$/UEGzD0RxSNDZA==');
    expect(createSalt('sha512')).toEqual('$6$/UEGzD0RxSNDZA==');
  });

  test('should fails on unkwon type', () => {
    expect(function() {
      createSalt('bad');
    }).toThrow(/Unknown salt type at crypt3.createSalt: bad/);
  });
});
