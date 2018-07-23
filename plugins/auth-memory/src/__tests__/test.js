import Memory from '../index';

describe('Memory Auth', function() {
  describe('add_user', () => {
    it('should adds users with default configurartion', done => {
      const auth = new Memory({}, {});
      auth.adduser('test', 'secret', (error, user) => {
        expect(error).toBeNull();
        expect(user).toEqual('test');
        done();
      });
    });
    it('checks if user already exists', done => {
      const config = {
        users: {
          test: {
            password: 'xxxx-yyyy-zzzz'
          }
        }
      };

      const appConfig = {
        max_users: 2
      };
      const auth = new Memory(config, appConfig);
      auth.adduser('test', 'secret', (err, user) => {
        expect(err).toBeNull();
        expect(user).toBeTruthy();
        done();
      });
    });
    it('checks max_user limit', done => {
      const config = { users: { test: { password: 'xxxx-yyyy-zzzz' } } };
      const appConfig = { max_users: 1 };
      const auth = new Memory(config, appConfig);
      auth.adduser('sam', 'secret', (error, user) => {
        expect(error.message).toEqual('maximum amount of users reached');
        expect(error.status).toEqual(409);
        expect(user).toBeUndefined();
        done();
      });
    });
  });

  describe('authenticate', () => {
    let auth = new Memory({}, {});
    beforeEach(done => {
      auth.adduser('test', 'secret', () => {
        done();
      });
    });
    it('validates existing users', done => {
      auth.authenticate('test', 'secret', (error, groups) => {
        expect(error).toBeNull();
        expect(groups).toEqual(['test']);
        done();
      });
    });
    it('fails if wrong password', done => {
      auth.authenticate('test', 'wrongpassword', (error, user) => {
        expect(user).toBeUndefined();
        expect(error.message).toEqual('Unauthorized access');
        expect(error.status).toEqual(401);
        done();
      });
    });
    it('fails if user does not exist', done => {
      auth.authenticate('test12', 'wrongpassword', (error, user) => {
        expect(user).toBeFalsy();
        expect(error).toBeNull();
        done();
      });
    });
  });

  describe('allow_access', () => {
    let auth = new Memory({}, {});
    it('allows access for $all', done => {
      const pkg = {
        access: '$all'
      };
      auth.allow_access({}, pkg, (error, permission) => {
        expect(error).toBeNull();
        expect(permission).toBeTruthy();
        done();
      });
    });
    it('allows access for $anonymous', done => {
      const pkg = { access: '$anonymous' };
      auth.allow_access({}, pkg, (error, permission) => {
        expect(error).toBeNull();
        expect(permission).toBeTruthy();
        done();
      });
    });
    it('allows access for specified user', done => {
      const pkg = { access: 'verdaccioNpm' };
      auth.allow_access({ name: 'verdaccioNpm' }, pkg, (error, permission) => {
        expect(error).toBeNull();
        expect(permission).toBeTruthy();
        done();
      });
    });
    it('allows access for authenticated user', done => {
      const pkg = { access: '$authenticated' };
      auth.allow_access({ name: 'verdaccioNpm' }, pkg, (error, permission) => {
        expect(error).toBeNull();
        expect(permission).toBeTruthy();
        done();
      });
    });
    it('allows access for specified user but user not available', done => {
      const pkg = { access: 'verdaccioNpm' };
      auth.allow_access({}, pkg, (error, permission) => {
        expect(error.message).toEqual('not allowed to access package');
        expect(permission).toBeUndefined();
        done();
      });
    });
    it('allows access for someuser but other user is trying to access', done => {
      const pkg = { access: 'verdaccioNpm' };
      const user = { name: 'otherVerdaccioNpm' };
      auth.allow_access(user, pkg, (error, permission) => {
        expect(error.message).toEqual('not allowed to access package');
        expect(permission).toBeUndefined();
        done();
      });
    });
  });

  describe('allow_publish', () => {
    let auth = new Memory({}, {});
    it('allows publish for $all', done => {
      const pkg = { publish: '$all' };
      auth.allow_publish({}, pkg, (error, permission) => {
        expect(error).toBeNull();
        expect(permission).toBeTruthy();
        done();
      });
    });
    it('allows publish for $anonymous', done => {
      const pkg = { publish: '$anonymous' };
      auth.allow_publish({}, pkg, (error, permission) => {
        expect(error).toBeNull();
        expect(permission).toBeTruthy();
        done();
      });
    });
    it('allows publish for specified user', done => {
      const pkg = { publish: 'verdaccioNpm' };
      auth.allow_publish({ name: 'verdaccioNpm' }, pkg, (error, permission) => {
        expect(error).toBeNull();
        expect(permission).toBeTruthy();
        done();
      });
    });
    it('allows publish for authenticated user', done => {
      const pkg = { publish: '$authenticated' };
      auth.allow_publish({ name: 'verdaccioNpm' }, pkg, (error, permission) => {
        expect(error).toBeNull();
        expect(permission).toBeTruthy();
        done();
      });
    });
    it('allows publish for specified user but user not available', done => {
      const pkg = { publish: 'verdaccioNpm' };
      auth.allow_publish({}, pkg, (error, permission) => {
        expect(error.message).toEqual('not allowed to publish package');
        expect(permission).toBeUndefined();
        done();
      });
    });
    it('allows publish for someuser but other user is trying to publish', done => {
      const pkg = { publish: 'verdaccioNpm' };
      const user = { name: 'otherVerdaccioNpm' };
      auth.allow_publish(user, pkg, (error, permission) => {
        expect(error.message).toEqual('not allowed to publish package');
        expect(permission).toBeUndefined();
        done();
      });
    });
  });
});
