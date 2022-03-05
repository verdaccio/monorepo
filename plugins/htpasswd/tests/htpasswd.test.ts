import crypto from 'crypto';
// @ts-ignore
import fs from 'fs';
import bcrypt from 'bcryptjs';

import HTPasswd, { DEFAULT_SLOW_VERIFY_MS, VerdaccioConfigApp } from '../src/htpasswd';

import Config from './__mocks__/Config';

const stuff = {
  logger: { warn: jest.fn() },
  config: new Config(),
};

const config = {
  file: './htpasswd',
  max_users: 1000,
};

describe('HTPasswd', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = new HTPasswd(config, stuff as unknown as VerdaccioConfigApp);
    jest.resetModules();
    jest.clearAllMocks();

    crypto.randomBytes = jest.fn(() => {
      return {
        toString: (): string => '$6',
      };
    });
  });

  describe('constructor()', () => {
    test('should files whether file path does not exist', () => {
      expect(function () {
        new HTPasswd({}, {
          config: {},
        } as unknown as VerdaccioConfigApp);
      }).toThrow(/should specify "file" in config/);
    });
  });

  describe('authenticate()', () => {
    test('it should authenticate user with given credentials', (done) => {
      const users = [
        { username: 'test', password: 'test' },
        { username: 'username', password: 'password' },
        { username: 'bcrypt', password: 'password' },
      ];
      let usersAuthenticated = 0;
      const generateCallback = (username) => (error, userGroups) => {
        usersAuthenticated += 1;
        expect(error).toBeNull();
        expect(userGroups).toContain(username);
        usersAuthenticated === users.length && done();
      };
      users.forEach(({ username, password }) =>
        wrapper.authenticate(username, password, generateCallback(username))
      );
    });

    test('it should not authenticate user with given credentials', (done) => {
      const users = ['test', 'username', 'bcrypt'];
      let usersAuthenticated = 0;
      const generateCallback = () => (error, userGroups) => {
        usersAuthenticated += 1;
        expect(error).toBeNull();
        expect(userGroups).toBeFalsy();
        usersAuthenticated === users.length && done();
      };
      users.forEach((username) =>
        wrapper.authenticate(username, 'somerandompassword', generateCallback())
      );
    });

    test('it should warn on slow password verification', (done) => {
      bcrypt.compare = jest.fn((passwd, hash, callback) => {
        setTimeout(() => callback(null, true), DEFAULT_SLOW_VERIFY_MS + 1);
      });
      const callback = (a, b): void => {
        expect(a).toBeNull();
        expect(b).toContain('bcrypt');
        const mockWarn = stuff.logger.warn as jest.MockedFn<jest.MockableFunction>;
        expect(mockWarn.mock.calls.length).toBe(1);
        const [{ user, durationMs }, message] = mockWarn.mock.calls[0];
        expect(user).toEqual('bcrypt');
        expect(durationMs).toBeGreaterThan(DEFAULT_SLOW_VERIFY_MS);
        expect(message).toEqual('Password for user "@{user}" took @{durationMs}ms to verify');
        done();
      };
      wrapper.authenticate('bcrypt', 'password', callback);
    });
  });

  describe('addUser()', () => {
    test('it should not pass sanity check', (done) => {
      const callback = (a): void => {
        expect(a.message).toEqual('unauthorized access');
        done();
      };
      wrapper.adduser('test', 'somerandompassword', callback);
    });

    test('it should add the user', (done) => {
      let dataToWrite;
      // @ts-ignore
      fs.writeFile = jest.fn((name, data, callback) => {
        dataToWrite = data;
        callback();
      });
      const callback = (a, b): void => {
        expect(a).toBeNull();
        expect(b).toBeTruthy();
        expect(fs.writeFile).toHaveBeenCalled();
        expect(dataToWrite.indexOf('usernotpresent')).not.toEqual(-1);
        done();
      };
      wrapper.adduser('usernotpresent', 'somerandompassword', callback);
    });

    describe('addUser() error handling', () => {
      test('sanityCheck should return an Error', (done) => {
        jest.doMock('../src/utils.ts', () => {
          return {
            sanityCheck: (): Error => Error('some error'),
          };
        });

        const HTPasswd = require('../src/htpasswd.ts').default;
        const wrapper = new HTPasswd(config, stuff);
        wrapper.adduser('sanityCheck', 'test', (sanity) => {
          expect(sanity.message).toBeDefined();
          expect(sanity.message).toMatch('some error');
          done();
        });
      });

      test('lockAndRead should return an Error', (done) => {
        jest.doMock('../src/utils.ts', () => {
          return {
            sanityCheck: (): any => null,
            lockAndRead: (_a, b): any => b(new Error('lock error')),
          };
        });

        const HTPasswd = require('../src/htpasswd.ts').default;
        const wrapper = new HTPasswd(config, stuff);
        wrapper.adduser('lockAndRead', 'test', (sanity) => {
          expect(sanity.message).toBeDefined();
          expect(sanity.message).toMatch('lock error');
          done();
        });
      });

      test('addUserToHTPasswd should return an Error', (done) => {
        jest.doMock('../src/utils.ts', () => {
          return {
            sanityCheck: (): any => null,
            parseHTPasswd: (): void => {},
            lockAndRead: (_a, b): any => b(null, ''),
            unlockFile: (_a, b): any => b(),
          };
        });

        const HTPasswd = require('../src/htpasswd.ts').default;
        const wrapper = new HTPasswd(config, stuff);
        wrapper.adduser('addUserToHTPasswd', 'test', () => {
          done();
        });
      });

      test('writeFile should return an Error', (done) => {
        jest.doMock('../src/utils.ts', () => {
          return {
            sanityCheck: (): any => null,
            parseHTPasswd: (): void => {},
            lockAndRead: (_a, b): any => b(null, ''),
            addUserToHTPasswd: (): void => {},
          };
        });
        jest.doMock('fs', () => {
          const original = jest.requireActual('fs');
          return {
            ...original,
            writeFile: jest.fn((_name, _data, callback) => {
              callback(new Error('write error'));
            }),
          };
        });

        const HTPasswd = require('../src/htpasswd.ts').default;
        const wrapper = new HTPasswd(config, stuff);
        wrapper.adduser('addUserToHTPasswd', 'test', (err) => {
          expect(err).not.toBeNull();
          expect(err.message).toMatch('write error');
          done();
        });
      });
    });

    describe('reload()', () => {
      test('it should read the file and set the users', (done) => {
        const output = {
          test: '$6FrCaT/v0dwE',
          username: '$66to3JK5RgZM',
          bcrypt: '$2y$04$K2Cn3StiXx4CnLmcTW/ymekOrj7WlycZZF9xgmoJ/U0zGPqSLPVBe',
        };
        const callback = (): void => {
          expect(wrapper.users).toEqual(output);
          done();
        };
        wrapper.reload(callback);
      });

      test('reload should fails on check file', (done) => {
        jest.doMock('fs', () => {
          return {
            stat: (_name, callback): void => {
              callback(new Error('stat error'), null);
            },
          };
        });
        const callback = (err): void => {
          expect(err).not.toBeNull();
          expect(err.message).toMatch('stat error');
          done();
        };

        const HTPasswd = require('../src/htpasswd.ts').default;
        const wrapper = new HTPasswd(config, stuff);
        wrapper.reload(callback);
      });

      test('reload times match', (done) => {
        jest.doMock('fs', () => {
          return {
            stat: (_name, callback): void => {
              callback(null, {
                mtime: null,
              });
            },
          };
        });
        const callback = (err): void => {
          expect(err).toBeUndefined();
          done();
        };

        const HTPasswd = require('../src/htpasswd.ts').default;
        const wrapper = new HTPasswd(config, stuff);
        wrapper.reload(callback);
      });

      test('reload should fails on read file', (done) => {
        jest.doMock('fs', () => {
          return {
            stat: jest.requireActual('fs').stat,
            readFile: (_name, _format, callback): void => {
              callback(new Error('read error'), null);
            },
          };
        });
        const callback = (err): void => {
          expect(err).not.toBeNull();
          expect(err.message).toMatch('read error');
          done();
        };

        const HTPasswd = require('../src/htpasswd.ts').default;
        const wrapper = new HTPasswd(config, stuff);
        wrapper.reload(callback);
      });
    });
  });

  test('changePassword - it should throw an error for user not found', (done) => {
    const callback = (error, isSuccess): void => {
      expect(error).not.toBeNull();
      expect(error.message).toBe('User not found');
      expect(isSuccess).toBeFalsy();
      done();
    };
    wrapper.changePassword('usernotpresent', 'oldPassword', 'newPassword', callback);
  });

  test('changePassword - it should throw an error for wrong password', (done) => {
    const callback = (error, isSuccess): void => {
      expect(error).not.toBeNull();
      expect(error.message).toBe('Invalid old Password');
      expect(isSuccess).toBeFalsy();
      done();
    };
    wrapper.changePassword('username', 'wrongPassword', 'newPassword', callback);
  });

  test('changePassword - it should change password', (done) => {
    let dataToWrite;
    // @ts-ignore
    fs.writeFile = jest.fn((_name, data, callback) => {
      dataToWrite = data;
      callback();
    });
    const callback = (error, isSuccess): void => {
      expect(error).toBeNull();
      expect(isSuccess).toBeTruthy();
      expect(fs.writeFile).toHaveBeenCalled();
      expect(dataToWrite.indexOf('username')).not.toEqual(-1);
      done();
    };
    wrapper.changePassword('username', 'password', 'newPassword', callback);
  });
});
