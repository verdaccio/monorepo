// @ts-ignore
import fs from 'fs';

import HTPasswd from '../src/htpasswd';
import Logger from './__mocks__/Logger';
import Config from './__mocks__/Config';

const stuff = {
  logger: new Logger(),
  config: new Config()
};

const config = {
  file: './htpasswd',
  max_users: 1000
};

describe('HTPasswd', () => {
  let wrapper;

  beforeEach(() => {
    // @ts-ignore
    wrapper = new HTPasswd(config, stuff);
    jest.resetModules();
  });

  describe('constructor()', () => {
    test('should files whether file path does not exist', () => {
      expect(function() {
        new HTPasswd(
          {},
          // @ts-ignore
          {
            config: {}
          }
        );
      }).toThrow(/should specify "file" in config/);
    });
  });

  describe('authenticate()', () => {
    test('it should authenticate user with given credentials', done => {
      const callbackTest = (a, b) => {
        expect(a).toBeNull();
        expect(b).toContain('test');
        done();
      };
      const callbackUsername = (a, b) => {
        expect(a).toBeNull();
        expect(b).toContain('username');
        done();
      };
      wrapper.authenticate('test', 'test', callbackTest);
      wrapper.authenticate('username', 'password', callbackUsername);
    });

    test('it should not authenticate user with given credentials', done => {
      const callback = (a, b) => {
        expect(a).toBeNull();
        expect(b).toBeFalsy();
        done();
      };
      wrapper.authenticate('test', 'somerandompassword', callback);
    });
  });

  describe('addUser()', () => {
    test('it should not pass sanity check', done => {
      const callback = (a, b) => {
        expect(a.message).toEqual('unauthorized access');
        done();
      };
      wrapper.adduser('test', 'somerandompassword', callback);
    });

    test('it should add the user', done => {
      let dataToWrite;
      // @ts-ignore
      fs.writeFile = jest.fn((name, data, callback) => {
        dataToWrite = data;
        callback();
      });
      const callback = (a, b) => {
        expect(a).toBeNull();
        expect(b).toBeTruthy();
        expect(fs.writeFile).toHaveBeenCalled();
        expect(dataToWrite.indexOf('usernotpresent')).not.toEqual(-1);
        done();
      };
      wrapper.adduser('usernotpresent', 'somerandompassword', callback);
    });

    describe('addUser() error handling', () => {
      test('sanityCheck should return an Error', done => {
        jest.doMock('../src/utils.ts', () => {
          return {
            sanityCheck: () => Error('some error')
          };
        });

        const HTPasswd = require('../src/htpasswd.ts').default;
        const wrapper = new HTPasswd(config, stuff);
        wrapper.adduser('sanityCheck', 'test', (sanity, foo) => {
          expect(sanity.message).toBeDefined();
          expect(sanity.message).toMatch('some error');
          done();
        });
      });

      test('lockAndRead should return an Error', done => {
        jest.doMock('../src/utils.ts', () => {
          return {
            sanityCheck: () => null,
            lockAndRead: (a, b) => b(new Error('lock error'))
          };
        });

        const HTPasswd = require('../src/htpasswd.ts').default;
        const wrapper = new HTPasswd(config, stuff);
        wrapper.adduser('lockAndRead', 'test', (sanity, foo) => {
          expect(sanity.message).toBeDefined();
          expect(sanity.message).toMatch('lock error');
          done();
        });
      });

      test('addUserToHTPasswd should return an Error', done => {
        jest.doMock('../src/utils.ts', () => {
          return {
            sanityCheck: () => null,
            parseHTPasswd: () => {},
            lockAndRead: (a, b) => b(null, ''),
            unlockFile: (a, b) => b()
          };
        });

        const HTPasswd = require('../src/htpasswd.ts').default;
        const wrapper = new HTPasswd(config, stuff);
        wrapper.adduser('addUserToHTPasswd', 'test', (sanity, foo) => {
          done();
        });
      });

      test('writeFile should return an Error', done => {
        jest.doMock('../src/utils.ts', () => {
          return {
            sanityCheck: () => null,
            parseHTPasswd: () => {},
            lockAndRead: (a, b) => b(null, ''),
            unlockFile: (a, b) => b(),
            addUserToHTPasswd: () => {}
          };
        });
        jest.doMock('fs', () => {
          return {
            writeFile: jest.fn((name, data, callback) => {
              callback(new Error('write error'));
            })
          };
        });

        const HTPasswd = require('../src/htpasswd.ts').default;
        const wrapper = new HTPasswd(config, stuff);
        wrapper.adduser('addUserToHTPasswd', 'test', (err, foo) => {
          expect(err).not.toBeNull();
          expect(err.message).toMatch('write error');
          done();
        });
      });
    });

    describe('reload()', () => {
      test('it should read the file and set the users', done => {
        const output = { test: '$6FrCaT/v0dwE', username: '$66to3JK5RgZM' };
        const callback = () => {
          expect(wrapper.users).toEqual(output);
          done();
        };
        wrapper.reload(callback);
      });

      test('reload should fails on check file', done => {
        jest.doMock('fs', () => {
          return {
            stat: (name, callback) => {
              callback(new Error('stat error'), null);
            }
          };
        });
        const callback = err => {
          expect(err).not.toBeNull();
          expect(err.message).toMatch('stat error');
          done();
        };

        const HTPasswd = require('../src/htpasswd.ts').default;
        const wrapper = new HTPasswd(config, stuff);
        wrapper.reload(callback);
      });

      test('reload times match', done => {
        jest.doMock('fs', () => {
          return {
            stat: (name, callback) => {
              callback(null, {
                mtime: null
              });
            }
          };
        });
        const callback = err => {
          expect(err).toBeUndefined();
          done();
        };

        const HTPasswd = require('../src/htpasswd.ts').default;
        const wrapper = new HTPasswd(config, stuff);
        wrapper.reload(callback);
      });

      test('reload should fails on read file', done => {
        jest.doMock('fs', () => {
          return {
            stat: require.requireActual('fs').stat,
            readFile: (name, format, callback) => {
              callback(new Error('read error'), null);
            }
          };
        });
        const callback = err => {
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

  test('changePassword - it should throw an error for user not found', done => {
    const callback = (error, isSuccess) => {
      expect(error).not.toBeNull();
      expect(error.message).toBe('User not found');
      expect(isSuccess).toBeFalsy();
      done();
    };
    wrapper.changePassword(
      'usernotpresent',
      'oldPassword',
      'newPassword',
      callback
    );
  });

  test('changePassword - it should throw an error for wrong password', done => {
    const callback = (error, isSuccess) => {
      expect(error).not.toBeNull();
      expect(error.message).toBe('Invalid old Password');
      expect(isSuccess).toBeFalsy();
      done();
    };
    wrapper.changePassword(
      'username',
      'wrongPassword',
      'newPassword',
      callback
    );
  });

  test('changePassword - it should change password', done => {
    let dataToWrite;
    // @ts-ignore
    fs.writeFile = jest.fn((name, data, callback) => {
      dataToWrite = data;
      callback();
    });
    const callback = (error, isSuccess) => {
      expect(error).toBeNull();
      expect(isSuccess).toBeTruthy();
      expect(fs.writeFile).toHaveBeenCalled();
      expect(dataToWrite.indexOf('username')).not.toEqual(-1);
      done();
    };
    wrapper.changePassword('username', 'password', 'newPassword', callback);
  });
});
