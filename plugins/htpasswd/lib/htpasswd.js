"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * HTPasswd - Verdaccio auth class
 */
class HTPasswd {
  /**
   *
   * @param {*} config htpasswd file
   * @param {object} stuff config.yaml in object from
   */
  // flow types
  // constructor
  constructor(config, stuff) {
    _defineProperty(this, "users", void 0);

    _defineProperty(this, "stuff", void 0);

    _defineProperty(this, "config", void 0);

    _defineProperty(this, "verdaccioConfig", void 0);

    _defineProperty(this, "maxUsers", void 0);

    _defineProperty(this, "path", void 0);

    _defineProperty(this, "logger", void 0);

    _defineProperty(this, "lastTime", void 0);

    this.users = {}; // config for this module

    this.config = config;
    this.stuff = stuff; // verdaccio logger

    this.logger = stuff.logger; // verdaccio main config object

    this.verdaccioConfig = stuff.config; // all this "verdaccio_config" stuff is for b/w compatibility only

    this.maxUsers = config.max_users ? config.max_users : Infinity;
    this.lastTime = null;
    const {
      file
    } = config;

    if (!file) {
      throw new Error('should specify "file" in config');
    }

    this.path = _path.default.resolve(_path.default.dirname(this.verdaccioConfig.self_path), file);
  }
  /**
   * authenticate - Authenticate user.
   * @param {string} user
   * @param {string} password
   * @param {function} cd
   * @returns {function}
   */


  authenticate(user, password, cb) {
    this.reload(err => {
      if (err) {
        return cb(err.code === 'ENOENT' ? null : err);
      }

      if (!this.users[user]) {
        return cb(null, false);
      }

      if (!(0, _utils.verifyPassword)(password, this.users[user])) {
        return cb(null, false);
      } // authentication succeeded!
      // return all usergroups this user has access to;
      // (this particular package has no concept of usergroups, so just return
      // user herself)


      return cb(null, [user]);
    });
  }
  /**
   * Add user
   * 1. lock file for writing (other processes can still read)
   * 2. reload .htpasswd
   * 3. write new data into .htpasswd.tmp
   * 4. move .htpasswd.tmp to .htpasswd
   * 5. reload .htpasswd
   * 6. unlock file
   *
   * @param {string} user
   * @param {string} password
   * @param {function} realCb
   * @returns {function}
   */


  adduser(user, password, realCb) {
    const pathPass = this.path;
    let sanity = (0, _utils.sanityCheck)(user, password, _utils.verifyPassword, this.users, this.maxUsers); // preliminary checks, just to ensure that file won't be reloaded if it's
    // not needed

    if (sanity) {
      return realCb(sanity, false);
    }

    (0, _utils.lockAndRead)(pathPass, (err, res) => {
      let locked = false; // callback that cleans up lock first

      const cb = err => {
        if (locked) {
          (0, _utils.unlockFile)(pathPass, () => {
            // ignore any error from the unlock
            realCb(err, !err);
          });
        } else {
          realCb(err, !err);
        }
      };

      if (!err) {
        locked = true;
      } // ignore ENOENT errors, we'll just create .htpasswd in that case


      if (err && err.code !== 'ENOENT') {
        return cb(err);
      }

      const body = (res || '').toString('utf8');
      this.users = (0, _utils.parseHTPasswd)(body); // real checks, to prevent race conditions
      // parsing users after reading file.

      sanity = (0, _utils.sanityCheck)(user, password, _utils.verifyPassword, this.users, this.maxUsers);

      if (sanity) {
        return cb(sanity);
      }

      try {
        this._writeFile((0, _utils.addUserToHTPasswd)(body, user, password), cb);
      } catch (err) {
        return cb(err);
      }
    });
  }
  /**
   * Reload users
   * @param {function} callback
   */


  reload(callback) {
    _fs.default.stat(this.path, (err, stats) => {
      if (err) {
        return callback(err);
      }

      if (this.lastTime === stats.mtime) {
        return callback();
      }

      this.lastTime = stats.mtime;

      _fs.default.readFile(this.path, 'utf8', (err, buffer) => {
        if (err) {
          return callback(err);
        }

        Object.assign(this.users, (0, _utils.parseHTPasswd)(buffer));
        callback();
      });
    });
  }

  _stringToUt8(authentication) {
    return (authentication || '').toString();
  }

  _writeFile(body, cb) {
    _fs.default.writeFile(this.path, body, err => {
      if (err) {
        cb(err);
      } else {
        this.reload(() => {
          cb(null);
        });
      }
    });
  }
  /**
   * changePassword - change password for existing user.
   * @param {string} user
   * @param {string} password
   * @param {function} cd
   * @returns {function}
   */


  changePassword(user, password, newPassword, realCb) {
    (0, _utils.lockAndRead)(this.path, (err, res) => {
      let locked = false;
      const pathPassFile = this.path; // callback that cleans up lock first

      const cb = err => {
        if (locked) {
          (0, _utils.unlockFile)(pathPassFile, () => {
            // ignore any error from the unlock
            realCb(err, !err);
          });
        } else {
          realCb(err, !err);
        }
      };

      if (!err) {
        locked = true;
      }

      if (err && err.code !== 'ENOENT') {
        return cb(err);
      }

      const body = this._stringToUt8(res);

      this.users = (0, _utils.parseHTPasswd)(body);

      if (!this.users[user]) {
        return cb(new Error('User not found'));
      }

      try {
        this._writeFile((0, _utils.changePasswordToHTPasswd)(body, user, password, newPassword), cb);
      } catch (err) {
        return cb(err);
      }
    });
  }

}

exports.default = HTPasswd;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9odHBhc3N3ZC50cyJdLCJuYW1lcyI6WyJIVFBhc3N3ZCIsImNvbnN0cnVjdG9yIiwiY29uZmlnIiwic3R1ZmYiLCJ1c2VycyIsImxvZ2dlciIsInZlcmRhY2Npb0NvbmZpZyIsIm1heFVzZXJzIiwibWF4X3VzZXJzIiwiSW5maW5pdHkiLCJsYXN0VGltZSIsImZpbGUiLCJFcnJvciIsInBhdGgiLCJQYXRoIiwicmVzb2x2ZSIsImRpcm5hbWUiLCJzZWxmX3BhdGgiLCJhdXRoZW50aWNhdGUiLCJ1c2VyIiwicGFzc3dvcmQiLCJjYiIsInJlbG9hZCIsImVyciIsImNvZGUiLCJhZGR1c2VyIiwicmVhbENiIiwicGF0aFBhc3MiLCJzYW5pdHkiLCJ2ZXJpZnlQYXNzd29yZCIsInJlcyIsImxvY2tlZCIsImJvZHkiLCJ0b1N0cmluZyIsIl93cml0ZUZpbGUiLCJjYWxsYmFjayIsImZzIiwic3RhdCIsInN0YXRzIiwibXRpbWUiLCJyZWFkRmlsZSIsImJ1ZmZlciIsIk9iamVjdCIsImFzc2lnbiIsIl9zdHJpbmdUb1V0OCIsImF1dGhlbnRpY2F0aW9uIiwid3JpdGVGaWxlIiwiY2hhbmdlUGFzc3dvcmQiLCJuZXdQYXNzd29yZCIsInBhdGhQYXNzRmlsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7Ozs7QUFnQkE7OztBQUdlLE1BQU1BLFFBQU4sQ0FBMEQ7QUFDdkU7Ozs7O0FBS0E7QUFTQTtBQUNBQyxFQUFBQSxXQUFXLENBQUNDLE1BQUQsRUFBbUJDLEtBQW5CLEVBQThDO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQ3ZELFNBQUtDLEtBQUwsR0FBYSxFQUFiLENBRHVELENBR3ZEOztBQUNBLFNBQUtGLE1BQUwsR0FBY0EsTUFBZDtBQUNBLFNBQUtDLEtBQUwsR0FBYUEsS0FBYixDQUx1RCxDQU92RDs7QUFDQSxTQUFLRSxNQUFMLEdBQWNGLEtBQUssQ0FBQ0UsTUFBcEIs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LENBQUNDLElBQUosS0FBYSxRQUF4QixFQUFrQztBQUNoQyxlQUFPSCxFQUFFLENBQUNFLEdBQUQsQ0FBVDtBQUNEOztBQUVELFlBQU1TLElBQUksR0FBRyxLQUFLWSxZQUFMLENBQWtCZCxHQUFsQixDQUFiOztBQUNBLFdBQUsxQixLQUFMLEdBQWEsMEJBQWM0QixJQUFkLENBQWI7O0FBRUEsVUFBSSxDQUFDLEtBQUs1QixLQUFMLENBQVdlLElBQVgsQ0FBTCxFQUF1QjtBQUNyQixlQUFPRSxFQUFFLENBQUMsSUFBSVQsS0FBSixDQUFVLGdCQUFWLENBQUQsQ0FBVDtBQUNEOztBQUVELFVBQUk7QUFDRixhQUFLc0IsVUFBTCxDQUNFLHFDQUF5QkYsSUFBekIsRUFBK0JiLElBQS9CLEVBQXFDQyxRQUFyQyxFQUErQzRCLFdBQS9DLENBREYsRUFFRTNCLEVBRkY7QUFJRCxPQUxELENBS0UsT0FBT0UsR0FBUCxFQUFZO0FBQ1osZUFBT0YsRUFBRSxDQUFDRSxHQUFELENBQVQ7QUFDRDtBQUNGLEtBdkNEO0FBd0NEOztBQXRQc0UiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IFBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge1xuICB2ZXJpZnlQYXNzd29yZCxcbiAgbG9ja0FuZFJlYWQsXG4gIHVubG9ja0ZpbGUsXG4gIHBhcnNlSFRQYXNzd2QsXG4gIGFkZFVzZXJUb0hUUGFzc3dkLFxuICBjaGFuZ2VQYXNzd29yZFRvSFRQYXNzd2QsXG4gIHNhbml0eUNoZWNrXG59IGZyb20gJy4vdXRpbHMnO1xuXG5pbXBvcnQgeyBDYWxsYmFjaywgQXV0aENvbmYsIENvbmZpZywgSVBsdWdpbkF1dGggfSBmcm9tICdAdmVyZGFjY2lvL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBWZXJkYWNjaW9Db25maWdBcHAgZXh0ZW5kcyBDb25maWcge1xuICBmaWxlOiBzdHJpbmc7XG59XG5cbi8qKlxuICogSFRQYXNzd2QgLSBWZXJkYWNjaW8gYXV0aCBjbGFzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIVFBhc3N3ZCBpbXBsZW1lbnRzIElQbHVnaW5BdXRoPFZlcmRhY2Npb0NvbmZpZ0FwcD4ge1xuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHsqfSBjb25maWcgaHRwYXNzd2QgZmlsZVxuICAgKiBAcGFyYW0ge29iamVjdH0gc3R1ZmYgY29uZmlnLnlhbWwgaW4gb2JqZWN0IGZyb21cbiAgICovXG4gIC8vIGZsb3cgdHlwZXNcbiAgdXNlcnM6IHt9O1xuICBzdHVmZjoge307XG4gIGNvbmZpZzoge307XG4gIHZlcmRhY2Npb0NvbmZpZzogQ29uZmlnO1xuICBtYXhVc2VyczogbnVtYmVyO1xuICBwYXRoOiBzdHJpbmc7XG4gIGxvZ2dlcjoge307XG4gIGxhc3RUaW1lOiBhbnk7XG4gIC8vIGNvbnN0cnVjdG9yXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogQXV0aENvbmYsIHN0dWZmOiBWZXJkYWNjaW9Db25maWdBcHApIHtcbiAgICB0aGlzLnVzZXJzID0ge307XG5cbiAgICAvLyBjb25maWcgZm9yIHRoaXMgbW9kdWxlXG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5zdHVmZiA9IHN0dWZmO1xuXG4gICAgLy8gdmVyZGFjY2lvIGxvZ2dlclxuICAgIHRoaXMubG9nZ2VyID0gc3R1ZmYubG9nZ2VyO1xuXG4gICAgLy8gdmVyZGFjY2lvIG1haW4gY29uZmlnIG9iamVjdFxuICAgIHRoaXMudmVyZGFjY2lvQ29uZmlnID0gc3R1ZmYuY29uZmlnO1xuXG4gICAgLy8gYWxsIHRoaXMgXCJ2ZXJkYWNjaW9fY29uZmlnXCIgc3R1ZmYgaXMgZm9yIGIvdyBjb21wYXRpYmlsaXR5IG9ubHlcbiAgICB0aGlzLm1heFVzZXJzID0gY29uZmlnLm1heF91c2VycyA/IGNvbmZpZy5tYXhfdXNlcnMgOiBJbmZpbml0eTtcblxuICAgIHRoaXMubGFzdFRpbWUgPSBudWxsO1xuXG4gICAgY29uc3QgeyBmaWxlIH0gPSBjb25maWc7XG5cbiAgICBpZiAoIWZpbGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignc2hvdWxkIHNwZWNpZnkgXCJmaWxlXCIgaW4gY29uZmlnJyk7XG4gICAgfVxuXG4gICAgdGhpcy5wYXRoID0gUGF0aC5yZXNvbHZlKFxuICAgICAgUGF0aC5kaXJuYW1lKHRoaXMudmVyZGFjY2lvQ29uZmlnLnNlbGZfcGF0aCksXG4gICAgICBmaWxlXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBhdXRoZW50aWNhdGUgLSBBdXRoZW50aWNhdGUgdXNlci5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNkXG4gICAqIEByZXR1cm5zIHtmdW5jdGlvbn1cbiAgICovXG4gIGF1dGhlbnRpY2F0ZSh1c2VyOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcsIGNiOiBDYWxsYmFjaykge1xuICAgIHRoaXMucmVsb2FkKGVyciA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiBjYihlcnIuY29kZSA9PT0gJ0VOT0VOVCcgPyBudWxsIDogZXJyKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy51c2Vyc1t1c2VyXSkge1xuICAgICAgICByZXR1cm4gY2IobnVsbCwgZmFsc2UpO1xuICAgICAgfVxuICAgICAgaWYgKCF2ZXJpZnlQYXNzd29yZChwYXNzd29yZCwgdGhpcy51c2Vyc1t1c2VyXSkpIHtcbiAgICAgICAgcmV0dXJuIGNiKG51bGwsIGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgLy8gYXV0aGVudGljYXRpb24gc3VjY2VlZGVkIVxuICAgICAgLy8gcmV0dXJuIGFsbCB1c2VyZ3JvdXBzIHRoaXMgdXNlciBoYXMgYWNjZXNzIHRvO1xuICAgICAgLy8gKHRoaXMgcGFydGljdWxhciBwYWNrYWdlIGhhcyBubyBjb25jZXB0IG9mIHVzZXJncm91cHMsIHNvIGp1c3QgcmV0dXJuXG4gICAgICAvLyB1c2VyIGhlcnNlbGYpXG4gICAgICByZXR1cm4gY2IobnVsbCwgW3VzZXJdKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgdXNlclxuICAgKiAxLiBsb2NrIGZpbGUgZm9yIHdyaXRpbmcgKG90aGVyIHByb2Nlc3NlcyBjYW4gc3RpbGwgcmVhZClcbiAgICogMi4gcmVsb2FkIC5odHBhc3N3ZFxuICAgKiAzLiB3cml0ZSBuZXcgZGF0YSBpbnRvIC5odHBhc3N3ZC50bXBcbiAgICogNC4gbW92ZSAuaHRwYXNzd2QudG1wIHRvIC5odHBhc3N3ZFxuICAgKiA1LiByZWxvYWQgLmh0cGFzc3dkXG4gICAqIDYuIHVubG9jayBmaWxlXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1c2VyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSByZWFsQ2JcbiAgICogQHJldHVybnMge2Z1bmN0aW9ufVxuICAgKi9cbiAgYWRkdXNlcih1c2VyOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcsIHJlYWxDYjogQ2FsbGJhY2spIHtcbiAgICBjb25zdCBwYXRoUGFzcyA9IHRoaXMucGF0aDtcbiAgICBsZXQgc2FuaXR5ID0gc2FuaXR5Q2hlY2soXG4gICAgICB1c2VyLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICB2ZXJpZnlQYXNzd29yZCxcbiAgICAgIHRoaXMudXNlcnMsXG4gICAgICB0aGlzLm1heFVzZXJzXG4gICAgKTtcblxuICAgIC8vIHByZWxpbWluYXJ5IGNoZWNrcywganVzdCB0byBlbnN1cmUgdGhhdCBmaWxlIHdvbid0IGJlIHJlbG9hZGVkIGlmIGl0J3NcbiAgICAvLyBub3QgbmVlZGVkXG4gICAgaWYgKHNhbml0eSkge1xuICAgICAgcmV0dXJuIHJlYWxDYihzYW5pdHksIGZhbHNlKTtcbiAgICB9XG5cbiAgICBsb2NrQW5kUmVhZChwYXRoUGFzcywgKGVyciwgcmVzKSA9PiB7XG4gICAgICBsZXQgbG9ja2VkID0gZmFsc2U7XG5cbiAgICAgIC8vIGNhbGxiYWNrIHRoYXQgY2xlYW5zIHVwIGxvY2sgZmlyc3RcbiAgICAgIGNvbnN0IGNiID0gZXJyID0+IHtcbiAgICAgICAgaWYgKGxvY2tlZCkge1xuICAgICAgICAgIHVubG9ja0ZpbGUocGF0aFBhc3MsICgpID0+IHtcbiAgICAgICAgICAgIC8vIGlnbm9yZSBhbnkgZXJyb3IgZnJvbSB0aGUgdW5sb2NrXG4gICAgICAgICAgICByZWFsQ2IoZXJyLCAhZXJyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWFsQ2IoZXJyLCAhZXJyKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgbG9ja2VkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gaWdub3JlIEVOT0VOVCBlcnJvcnMsIHdlJ2xsIGp1c3QgY3JlYXRlIC5odHBhc3N3ZCBpbiB0aGF0IGNhc2VcbiAgICAgIGlmIChlcnIgJiYgZXJyLmNvZGUgIT09ICdFTk9FTlQnKSB7XG4gICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgfVxuICAgICAgY29uc3QgYm9keSA9IChyZXMgfHwgJycpLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICB0aGlzLnVzZXJzID0gcGFyc2VIVFBhc3N3ZChib2R5KTtcblxuICAgICAgLy8gcmVhbCBjaGVja3MsIHRvIHByZXZlbnQgcmFjZSBjb25kaXRpb25zXG4gICAgICAvLyBwYXJzaW5nIHVzZXJzIGFmdGVyIHJlYWRpbmcgZmlsZS5cbiAgICAgIHNhbml0eSA9IHNhbml0eUNoZWNrKFxuICAgICAgICB1c2VyLFxuICAgICAgICBwYXNzd29yZCxcbiAgICAgICAgdmVyaWZ5UGFzc3dvcmQsXG4gICAgICAgIHRoaXMudXNlcnMsXG4gICAgICAgIHRoaXMubWF4VXNlcnNcbiAgICAgICk7XG5cbiAgICAgIGlmIChzYW5pdHkpIHtcbiAgICAgICAgcmV0dXJuIGNiKHNhbml0eSk7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuX3dyaXRlRmlsZShhZGRVc2VyVG9IVFBhc3N3ZChib2R5LCB1c2VyLCBwYXNzd29yZCksIGNiKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxvYWQgdXNlcnNcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAgICovXG4gIHJlbG9hZChjYWxsYmFjazogQ2FsbGJhY2spIHtcbiAgICBmcy5zdGF0KHRoaXMucGF0aCwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5sYXN0VGltZSA9PT0gc3RhdHMubXRpbWUpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubGFzdFRpbWUgPSBzdGF0cy5tdGltZTtcblxuICAgICAgZnMucmVhZEZpbGUodGhpcy5wYXRoLCAndXRmOCcsIChlcnIsIGJ1ZmZlcikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMudXNlcnMsIHBhcnNlSFRQYXNzd2QoYnVmZmVyKSk7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIF9zdHJpbmdUb1V0OChhdXRoZW50aWNhdGlvbjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKGF1dGhlbnRpY2F0aW9uIHx8ICcnKS50b1N0cmluZygpO1xuICB9XG5cbiAgX3dyaXRlRmlsZShib2R5OiBzdHJpbmcsIGNiOiBDYWxsYmFjaykge1xuICAgIGZzLndyaXRlRmlsZSh0aGlzLnBhdGgsIGJvZHksIGVyciA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNiKGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlbG9hZCgoKSA9PiB7XG4gICAgICAgICAgY2IobnVsbCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIGNoYW5nZVBhc3N3b3JkIC0gY2hhbmdlIHBhc3N3b3JkIGZvciBleGlzdGluZyB1c2VyLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXNlclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmRcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2RcbiAgICogQHJldHVybnMge2Z1bmN0aW9ufVxuICAgKi9cbiAgY2hhbmdlUGFzc3dvcmQoXG4gICAgdXNlcjogc3RyaW5nLFxuICAgIHBhc3N3b3JkOiBzdHJpbmcsXG4gICAgbmV3UGFzc3dvcmQ6IHN0cmluZyxcbiAgICByZWFsQ2I6IENhbGxiYWNrXG4gICkge1xuICAgIGxvY2tBbmRSZWFkKHRoaXMucGF0aCwgKGVyciwgcmVzKSA9PiB7XG4gICAgICBsZXQgbG9ja2VkID0gZmFsc2U7XG4gICAgICBjb25zdCBwYXRoUGFzc0ZpbGUgPSB0aGlzLnBhdGg7XG5cbiAgICAgIC8vIGNhbGxiYWNrIHRoYXQgY2xlYW5zIHVwIGxvY2sgZmlyc3RcbiAgICAgIGNvbnN0IGNiID0gZXJyID0+IHtcbiAgICAgICAgaWYgKGxvY2tlZCkge1xuICAgICAgICAgIHVubG9ja0ZpbGUocGF0aFBhc3NGaWxlLCAoKSA9PiB7XG4gICAgICAgICAgICAvLyBpZ25vcmUgYW55IGVycm9yIGZyb20gdGhlIHVubG9ja1xuICAgICAgICAgICAgcmVhbENiKGVyciwgIWVycik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVhbENiKGVyciwgIWVycik7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmICghZXJyKSB7XG4gICAgICAgIGxvY2tlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChlcnIgJiYgZXJyLmNvZGUgIT09ICdFTk9FTlQnKSB7XG4gICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBib2R5ID0gdGhpcy5fc3RyaW5nVG9VdDgocmVzKTtcbiAgICAgIHRoaXMudXNlcnMgPSBwYXJzZUhUUGFzc3dkKGJvZHkpO1xuXG4gICAgICBpZiAoIXRoaXMudXNlcnNbdXNlcl0pIHtcbiAgICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignVXNlciBub3QgZm91bmQnKSk7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuX3dyaXRlRmlsZShcbiAgICAgICAgICBjaGFuZ2VQYXNzd29yZFRvSFRQYXNzd2QoYm9keSwgdXNlciwgcGFzc3dvcmQsIG5ld1Bhc3N3b3JkKSxcbiAgICAgICAgICBjYlxuICAgICAgICApO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=