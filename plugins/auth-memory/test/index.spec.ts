import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { Callback } from '@verdaccio/legacy-types';

import Memory from '../src/index';
import type { VerdaccioMemoryConfig } from '../types';

describe('Memory', function () {
  let auth;
  const logger = {
    child: vi.fn(() => {}),
    http: vi.fn(() => {}),
    trace: vi.fn(() => {}),
    warn: vi.fn(() => {}),
    info: vi.fn(() => {}),
    debug: vi.fn(() => {}),
    error: vi.fn(() => {}),
    fatal: vi.fn(() => {}),
  };

  beforeEach(function () {
    auth = new Memory({ max_users: 100 } as VerdaccioMemoryConfig, {
      config: {} as VerdaccioMemoryConfig,
      logger,
    });
  });

  describe('#adduser', function () {
    test('adds users', function () {
      return new Promise<void>((resolve) => {
        auth.adduser('test', 'secret', function (err, user) {
          expect(err).toBeNull();
          expect(user).toEqual('test');
          resolve();
        });
      });
    });

    test('login existing users', function () {
      return new Promise<void>((resolve) => {
        auth.adduser('test', 'secret', function (err, user) {
          expect(err).toBeNull();
          expect(user).toEqual('test');
          auth.adduser('test', 'secret', function (err, user) {
            expect(err).toBeNull();
            expect(user).toBe(true);
            resolve();
          });
        });
      });
    });

    test('max users reached', function () {
      return new Promise<void>((resolve) => {
        const auth = new Memory({} as VerdaccioMemoryConfig, {
          config: {
            max_users: -1,
          } as VerdaccioMemoryConfig,
          logger,
        });
        auth.adduser('test', 'secret', function (err) {
          expect(err).not.toBeNull();
          expect(err.message).toMatch(/maximum amount of users reached/);
          resolve();
        });
      });
    });
  });

  describe('replace user', function () {
    beforeAll(function () {
      return new Promise<void>((resolve) => {
        auth.adduser('test', 'secret', function (err) {
          expect(err).toBeNull();
          resolve();
        });
      });
    });

    test('replaces password', function () {
      return new Promise<void>((resolve) => {
        auth.adduser('test', 'new_secret', function (err, user) {
          expect(err).toBeNull();
          expect(user).toEqual('test');
          auth.authenticate('test', 'new_secret', function (err) {
            expect(err).toBeNull();
            resolve();
          });
        });
      });
    });
  });

  describe('#allow_access', function () {
    beforeEach(function () {
      return new Promise<void>((resolve) => {
        auth.adduser('test', 'secret', function (err, user) {
          expect(err).toBeNull();
          expect(user).toBeTruthy();
          resolve();
        });
      });
    });

    const accessBy = (roles: string[]): Promise<void> => {
      return new Promise<void>((resolve) => {
        auth.allow_access(
          {
            name: 'test',
            groups: [],
            real_groups: [],
          },
          { access: roles, publish: [], proxy: [] },
          function (err, groups) {
            expect(err).toBeNull();
            expect(groups).toBe(true);
            resolve();
          }
        );
      });
    };

    test('should be allowed to access as $all to the package', function () {
      return accessBy(['$all']);
    });

    test('should be allowed to access as $anonymous to the package', function () {
      return accessBy(['$anonymous']);
    });

    test('should be allowed to access as $authenticated to the package', function () {
      return accessBy(['$authenticated']);
    });

    test('should be allowed to access as test to the package', function () {
      return accessBy(['test']);
    });

    test('should not to be allowed to access any package', function () {
      return new Promise<void>((resolve) => {
        auth.allow_access({}, { access: [], publish: [], proxy: [] }, function (err) {
          expect(err).not.toBeNull();
          expect(err.message).toMatch(/not allowed to access package/);
          resolve();
        });
      });
    });

    test('should not to be allowed to access the anyOtherUser package', function () {
      return new Promise<void>((resolve) => {
        auth.allow_access({}, { access: ['anyOtherUser'], publish: [], proxy: [] }, function (err) {
          expect(err).not.toBeNull();
          expect(err.message).toMatch(/not allowed to access package/);
          resolve();
        });
      });
    });
  });

  describe('#allow_publish', function () {
    beforeEach(function () {
      return new Promise<void>((resolve) => {
        auth.adduser('test', 'secret', function (err, user) {
          expect(err).toBeNull();
          expect(user).toBeTruthy();
          resolve();
        });
      });
    });

    const accessBy = (roles: string[]): Promise<void> => {
      return new Promise<void>((resolve) => {
        auth.allow_publish(
          {
            name: 'test',
            groups: [],
            real_groups: [],
          },
          { publish: roles, proxy: [], access: [] },
          function (err, groups) {
            expect(err).toBeNull();
            expect(groups).toBe(true);
            resolve();
          }
        );
      });
    };

    test('should be allowed to access as $all to the package', function () {
      return accessBy(['$all']);
    });

    test('should be allowed to access as $anonymous to the package', function () {
      return accessBy(['$anonymous']);
    });

    test('should be allowed to access as $authenticated to the package', function () {
      return accessBy(['$authenticated']);
    });

    test('should be allowed to access as test to the package', function () {
      return accessBy(['test']);
    });

    test('should not to be allowed to access any package', function () {
      return new Promise<void>((resolve) => {
        auth.allow_publish({}, { publish: [], proxy: [], access: [] }, function (err) {
          expect(err).not.toBeNull();
          expect(err.message).toMatch(/not allowed to publish package/);
          resolve();
        });
      });
    });

    test('should not to be allowed to access the anyOtherUser package', function () {
      return new Promise<void>((resolve) => {
        auth.allow_publish(
          {},
          { publish: ['anyOtherUser'], proxy: [], access: [] },
          function (err) {
            expect(err).not.toBeNull();
            expect(err.message).toMatch(/not allowed to publish package/);
            resolve();
          }
        );
      });
    });
  });

  describe('#changePassword', function () {
    let auth;

    beforeEach(function () {
      return new Promise<void>((resolve) => {
        auth = new Memory({} as VerdaccioMemoryConfig, {
          config: {} as VerdaccioMemoryConfig,
          logger,
        });
        auth.adduser('test', 'secret', function (err, user) {
          expect(err).toBeNull();
          expect(user).toBeTruthy();
          resolve();
        });
      });
    });

    test('should change password', function () {
      return new Promise<void>((resolve) => {
        auth.changePassword('test', 'secret', 'newSecret', function (err, user) {
          expect(err).toBeNull();
          expect(user.password).toEqual('newSecret');
          resolve();
        });
      });
    });

    test('should fail change password with user not found', function () {
      return new Promise<void>((resolve) => {
        auth.changePassword('NOTFOUND', 'secret', 'newSecret', function (err) {
          expect(err).not.toBeNull();
          expect(err.message).toMatch(/user not found/);
          resolve();
        });
      });
    });
  });

  describe('#authenticate', function () {
    beforeEach(function () {
      return new Promise<void>((resolve) => {
        auth.adduser('test', 'secret', function (err, user) {
          expect(err).toBeNull();
          expect(user).toBeTruthy();
          resolve();
        });
      });
    });

    test('validates existing users', function () {
      return new Promise<void>((resolve) => {
        auth.authenticate('test', 'secret', function (err, groups) {
          expect(err).toBeNull();
          expect(groups).toBeDefined();
          resolve();
        });
      });
    });

    test('fails if wrong password', function () {
      return new Promise<void>((resolve) => {
        auth.authenticate('test', 'no-secret', function (err) {
          expect(err).not.toBeNull();
          resolve();
        });
      });
    });

    test('fails if user doesnt exist', function () {
      return new Promise<void>((resolve) => {
        auth.authenticate('john', 'secret', function (err, groups) {
          expect(err).toBeNull();
          expect(groups).toBeFalsy();
          resolve();
        });
      });
    });
  });
});
