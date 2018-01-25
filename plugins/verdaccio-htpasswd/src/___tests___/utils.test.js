import * as locker from '@verdaccio/file-locking';

import {
  verifyPassword,
  lockAndRead,
  unlockFile,
  parseHTPasswd,
  addUserToHTPasswd,
  sanityCheck
} from '../utils';

describe('parseHTPasswd', () => {
  it('should parse the password for a single line', () => {
    const input = 'test:$6b9MlB3WUELU:autocreated 2017-11-06T18:17:21.957Z';
    const output = { test: '$6b9MlB3WUELU' };
    expect(parseHTPasswd(input)).toEqual(output);
  });

  it('should parse the password for two lines', () => {
    const input = `user1:$6b9MlB3WUELU:autocreated 2017-11-06T18:17:21.957Z
user2:$6FrCaT/v0dwE:autocreated 2017-12-14T13:30:20.838Z`;
    const output = { user1: '$6b9MlB3WUELU', user2: '$6FrCaT/v0dwE' };
    expect(parseHTPasswd(input)).toEqual(output);
  });

  it('should parse the password for multiple lines', () => {
    const input = `user1:$6b9MlB3WUELU:autocreated 2017-11-06T18:17:21.957Z
user2:$6FrCaT/v0dwE:autocreated 2017-12-14T13:30:20.838Z
user3:$6FrCdfd\v0dwE:autocreated 2017-12-14T13:30:20.838Z
user4:$6FrCasdvppdwE:autocreated 2017-12-14T13:30:20.838Z`;
    const output = {
      user1: '$6b9MlB3WUELU',
      user2: '$6FrCaT/v0dwE',
      user3: '$6FrCdfd\v0dwE',
      user4: '$6FrCasdvppdwE'
    };
    expect(parseHTPasswd(input)).toEqual(output);
  });
});

describe('verifyPassword', () => {
  it('should verify the MD5/Crypt3 password with true', () => {
    const input = ['test', '$apr1$sKXK9.lG$rZ4Iy63Vtn8jF9/USc4BV0'];
    expect(verifyPassword(...input)).toBeTruthy();
  });
  it('should verify the MD5/Crypt3 password with false', () => {
    const input = [
      'testpasswordchanged',
      '$apr1$sKXK9.lG$rZ4Iy63Vtn8jF9/USc4BV0'
    ];
    expect(verifyPassword(...input)).toBeFalsy();
  });
  it('should verify the plain password with true', () => {
    const input = ['testpasswordchanged', '{PLAIN}testpasswordchanged'];
    expect(verifyPassword(...input)).toBeTruthy();
  });
  it('should verify the plain password with false', () => {
    const input = ['testpassword', '{PLAIN}testpasswordchanged'];
    expect(verifyPassword(...input)).toBeFalsy();
  });
  it('should verify the crypto SHA password with true', () => {
    const input = ['testpassword', '{SHA}i7YRj4/Wk1rQh2o740pxfTJwj/0='];
    expect(verifyPassword(...input)).toBeTruthy();
  });
  it('should verify the crypto SHA password with false', () => {
    const input = ['testpasswordchanged', '{SHA}i7YRj4/Wk1rQh2o740pxfTJwj/0='];
    expect(verifyPassword(...input)).toBeFalsy();
  });
});

describe('addUserToHTPasswd - crypt3', () => {
  beforeAll(() => {
    global.Date = jest.fn(() => {
      return {
        toJSON: () => '2018-01-14T11:17:40.712Z'
      };
    });
  });

  it('should add new htpasswd to the end', () => {
    const input = ['', 'username', 'password'];
    expect(addUserToHTPasswd(...input)).toMatchSnapshot();
  });

  it('should add new htpasswd to the end in multiline input', () => {
    const body = `test1:$6b9MlB3WUELU:autocreated 2017-11-06T18:17:21.957Z
    test2:$6FrCaT/v0dwE:autocreated 2017-12-14T13:30:20.838Z`;
    const input = [body, 'username', 'password'];
    expect(addUserToHTPasswd(...input)).toMatchSnapshot();
  });

  it('should throw an error for incorrect username with space', () => {
    const input = ['', 'firstname lastname', 'password'];
    expect(() => addUserToHTPasswd(...input)).toThrowErrorMatchingSnapshot();
  });
});

// ToDo: mock crypt3 with false
// describe('addUserToHTPasswd - crypto', () => {
//   it('should create password with crypto', () => {
//   jest.resetModules();
//   jest.mock('../crypt3', () => false);
//   const input = ['', 'username', 'password'];
//   addUserToHTPasswd(...input);
//    // expect(addUserToHTPasswd(...input)).toEqual('sdssddsd');
//   });
// });

describe('lockAndRead', () => {
  beforeAll(() => {
    locker.readFile = jest.fn();
  });

  it('should call the readFile method', () => {
    const cb = () => {};
    lockAndRead('.htpasswd', cb);
    expect(locker.readFile).toHaveBeenCalled();
  });
});

describe('unlockFile', () => {
  beforeAll(() => {
    locker.unlockFile = jest.fn();
  });

  it('should call the unlock method', () => {
    const cb = () => {};
    unlockFile('htpasswd', cb);
    expect(locker.readFile).toHaveBeenCalled();
  });
});

describe('sanityCheck', () => {
  it('should thorw error for user already exists', () => {
    const users = { test: '$6FrCaT/v0dwE' };
    const input = sanityCheck('test', users, Infinity);
    expect(input.message).toEqual('this user already exists');
  });
  it('should thorw error max number of users', () => {
    const users = { test: '$6FrCaT/v0dwE' };
    const input = sanityCheck('username', users, 1);
    expect(input.message).toEqual('maximum amount of users reached');
  });
  it('should not throw anything and sanity check', () => {
    const users = { test: '$6FrCaT/v0dwE' };
    const input = sanityCheck('username', users, 2);
    expect(input).toBeNull();
  });
});
