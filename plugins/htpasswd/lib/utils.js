"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lockAndRead = lockAndRead;
exports.unlockFile = unlockFile;
exports.parseHTPasswd = parseHTPasswd;
exports.verifyPassword = verifyPassword;
exports.addUserToHTPasswd = addUserToHTPasswd;
exports.sanityCheck = sanityCheck;
exports.getCryptoPassword = getCryptoPassword;
exports.changePasswordToHTPasswd = changePasswordToHTPasswd;

var _crypto = _interopRequireDefault(require("crypto"));

var _crypt = _interopRequireDefault(require("./crypt3"));

var _apacheMd = _interopRequireDefault(require("apache-md5"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _httpErrors = _interopRequireDefault(require("http-errors"));

var locker = _interopRequireWildcard(require("@verdaccio/file-locking"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// this function neither unlocks file nor closes it
// it'll have to be done manually later
function lockAndRead(name, cb) {
  locker.readFile(name, {
    lock: true
  }, (err, res) => {
    if (err) {
      return cb(err);
    }

    return cb(null, res);
  });
} // close and unlock file


function unlockFile(name, cb) {
  locker.unlockFile(name, cb);
}
/**
 * parseHTPasswd - convert htpasswd lines to object.
 * @param {string} input
 * @returns {object}
 */


function parseHTPasswd(input) {
  return input.split('\n').reduce((result, line) => {
    const args = line.split(':', 3);
    if (args.length > 1) result[args[0]] = args[1];
    return result;
  }, {});
}
/**
 * verifyPassword - matches password and it's hash.
 * @param {string} passwd
 * @param {string} hash
 * @returns {boolean}
 */


function verifyPassword(passwd, hash) {
  if (hash.match(/^\$2(a|b|y)\$/)) {
    return _bcryptjs.default.compareSync(passwd, hash);
  } else if (hash.indexOf('{PLAIN}') === 0) {
    return passwd === hash.substr(7);
  } else if (hash.indexOf('{SHA}') === 0) {
    return _crypto.default.createHash('sha1') // https://nodejs.org/api/crypto.html#crypto_hash_update_data_inputencoding
    .update(passwd, 'utf8').digest('base64') === hash.substr(5);
  } // for backwards compatibility, first check md5 then check crypt3


  return (0, _apacheMd.default)(passwd, hash) === hash || (0, _crypt.default)(passwd, hash) === hash;
}
/**
 * addUserToHTPasswd - Generate a htpasswd format for .htpasswd
 * @param {string} body
 * @param {string} user
 * @param {string} passwd
 * @returns {string}
 */


function addUserToHTPasswd(body, user, passwd) {
  if (user !== encodeURIComponent(user)) {
    const err = (0, _httpErrors.default)('username should not contain non-uri-safe characters'); // $FlowFixMe

    err.status = 409;
    throw err;
  }

  if (_crypt.default) {
    passwd = (0, _crypt.default)(passwd);
  } else {
    passwd = '{SHA}' + _crypto.default.createHash('sha1').update(passwd, 'utf8').digest('base64');
  }

  const comment = 'autocreated ' + new Date().toJSON();
  let newline = `${user}:${passwd}:${comment}\n`;

  if (body.length && body[body.length - 1] !== '\n') {
    newline = '\n' + newline;
  }

  return body + newline;
}
/**
 * Sanity check for a user
 * @param {string} user
 * @param {object} users
 * @param {number} maxUsers
 * @returns {object}
 */


function sanityCheck(user, password, verifyFn, users, maxUsers) {
  let err; // check for user or password

  if (!user || !password) {
    err = Error('username and password is required'); // $FlowFixMe

    err.status = 400;
    return err;
  }

  const hash = users[user];

  if (maxUsers < 0) {
    err = Error('user registration disabled'); // $FlowFixMe

    err.status = 409;
    return err;
  }

  if (hash) {
    const auth = verifyFn(password, users[user]);

    if (auth) {
      err = Error('username is already registered'); // $FlowFixMe

      err.status = 409;
      return err;
    }

    err = Error('unauthorized access'); // $FlowFixMe

    err.status = 401;
    return err;
  } else if (Object.keys(users).length >= maxUsers) {
    err = Error('maximum amount of users reached'); // $FlowFixMe

    err.status = 403;
    return err;
  }

  return null;
}

function getCryptoPassword(password) {
  return `{SHA}${_crypto.default.createHash('sha1').update(password, 'utf8').digest('base64')}`;
}
/**
 * changePasswordToHTPasswd - change password for existing user
 * @param {string} body
 * @param {string} user
 * @param {string} passwd
 * @param {string} newPasswd
 * @returns {string}
 */


function changePasswordToHTPasswd(body, user, passwd, newPasswd) {
  let _passwd;

  let _newPasswd;

  if (_crypt.default) {
    _passwd = (0, _crypt.default)(passwd);
    _newPasswd = (0, _crypt.default)(newPasswd);
  } else {
    _passwd = getCryptoPassword(passwd);
    _newPasswd = getCryptoPassword(newPasswd);
  }

  let lines = body.split('\n');
  lines = lines.map(line => {
    const [username, password] = line.split(':', 3);

    if (username === user) {
      if (password == _passwd) {
        // replace old password hash with new password hash
        line = line.replace(_passwd, _newPasswd);
      } else {
        throw new Error('Invalid old Password');
      }
    }

    return line;
  });
  return lines.join('\n');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy50cyJdLCJuYW1lcyI6WyJsb2NrQW5kUmVhZCIsIm5hbWUiLCJjYiIsImxvY2tlciIsInJlYWRGaWxlIiwibG9jayIsImVyciIsInJlcyIsInVubG9ja0ZpbGUiLCJwYXJzZUhUUGFzc3dkIiwiaW5wdXQiLCJzcGxpdCIsInJlZHVjZSIsInJlc3VsdCIsImxpbmUiLCJhcmdzIiwibGVuZ3RoIiwidmVyaWZ5UGFzc3dvcmQiLCJwYXNzd2QiLCJoYXNoIiwibWF0Y2giLCJiY3J5cHQiLCJjb21wYXJlU3luYyIsImluZGV4T2YiLCJzdWJzdHIiLCJjcnlwdG8iLCJjcmVhdGVIYXNoIiwidXBkYXRlIiwiZGlnZXN0IiwiYWRkVXNlclRvSFRQYXNzd2QiLCJib2R5IiwidXNlciIsImVuY29kZVVSSUNvbXBvbmVudCIsInN0YXR1cyIsImNyeXB0MyIsImNvbW1lbnQiLCJEYXRlIiwidG9KU09OIiwibmV3bGluZSIsInNhbml0eUNoZWNrIiwicGFzc3dvcmQiLCJ2ZXJpZnlGbiIsInVzZXJzIiwibWF4VXNlcnMiLCJFcnJvciIsImF1dGgiLCJPYmplY3QiLCJrZXlzIiwiZ2V0Q3J5cHRvUGFzc3dvcmQiLCJjaGFuZ2VQYXNzd29yZFRvSFRQYXNzd2QiLCJuZXdQYXNzd2QiLCJfcGFzc3dkIiwiX25ld1Bhc3N3ZCIsImxpbmVzIiwibWFwIiwidXNlcm5hbWUiLCJyZXBsYWNlIiwiam9pbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBSUE7QUFDQTtBQUNPLFNBQVNBLFdBQVQsQ0FBcUJDLElBQXJCLEVBQW1DQyxFQUFuQyxFQUF1RDtBQUM1REMsRUFBQUEsTUFBTSxDQUFDQyxRQUFQLENBQWdCSCxJQUFoQixFQUFzQjtBQUFFSSxJQUFBQSxJQUFJLEVBQUU7QUFBUixHQUF0QixFQUFzQyxDQUFDQyxHQUFELEVBQU1DLEdBQU4sS0FBYztBQUNsRCxRQUFJRCxHQUFK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QUFXLEdBQVgsRUFBZ0IsQ0FBaEIsQ0FBN0I7O0FBRUEsUUFBSTRDLFFBQVEsS0FBS3hCLElBQWpCLEVBQXVCO0FBQ3JCLFVBQUlTLFFBQVEsSUFBSVcsT0FBaEIsRUFBeUI7QUFDdkI7QUFDQXJDLFFBQUFBLElBQUksR0FBR0EsSUFBSSxDQUFDMEMsT0FBTCxDQUFhTCxPQUFiLEVBQXNCQyxVQUF0QixDQUFQO0FBQ0QsT0FIRCxNQUdPO0FBQ0wsY0FBTSxJQUFJUixLQUFKLENBQVUsc0JBQVYsQ0FBTjtBQUNEO0FBQ0Y7O0FBQ0QsV0FBTzlCLElBQVA7QUFDRCxHQVpPLENBQVI7QUFjQSxTQUFPdUMsS0FBSyxDQUFDSSxJQUFOLENBQVcsSUFBWCxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgY3J5cHQzIGZyb20gJy4vY3J5cHQzJztcbmltcG9ydCBtZDUgZnJvbSAnYXBhY2hlLW1kNSc7XG5pbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdGpzJztcbmltcG9ydCBjcmVhdGVFcnJvciwgeyBIdHRwRXJyb3IgfSBmcm9tICdodHRwLWVycm9ycyc7XG5pbXBvcnQgKiBhcyBsb2NrZXIgZnJvbSAnQHZlcmRhY2Npby9maWxlLWxvY2tpbmcnO1xuXG5pbXBvcnQgeyBDYWxsYmFjayB9IGZyb20gJ0B2ZXJkYWNjaW8vdHlwZXMnO1xuXG4vLyB0aGlzIGZ1bmN0aW9uIG5laXRoZXIgdW5sb2NrcyBmaWxlIG5vciBjbG9zZXMgaXRcbi8vIGl0J2xsIGhhdmUgdG8gYmUgZG9uZSBtYW51YWxseSBsYXRlclxuZXhwb3J0IGZ1bmN0aW9uIGxvY2tBbmRSZWFkKG5hbWU6IHN0cmluZywgY2I6IENhbGxiYWNrKTogdm9pZCB7XG4gIGxvY2tlci5yZWFkRmlsZShuYW1lLCB7IGxvY2s6IHRydWUgfSwgKGVyciwgcmVzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNiKG51bGwsIHJlcyk7XG4gIH0pO1xufVxuXG4vLyBjbG9zZSBhbmQgdW5sb2NrIGZpbGVcbmV4cG9ydCBmdW5jdGlvbiB1bmxvY2tGaWxlKG5hbWU6IHN0cmluZywgY2I6IENhbGxiYWNrKTogdm9pZCB7XG4gIGxvY2tlci51bmxvY2tGaWxlKG5hbWUsIGNiKTtcbn1cblxuLyoqXG4gKiBwYXJzZUhUUGFzc3dkIC0gY29udmVydCBodHBhc3N3ZCBsaW5lcyB0byBvYmplY3QuXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUhUUGFzc3dkKGlucHV0OiBzdHJpbmcpOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHtcbiAgcmV0dXJuIGlucHV0LnNwbGl0KCdcXG4nKS5yZWR1Y2UoKHJlc3VsdCwgbGluZSkgPT4ge1xuICAgIGNvbnN0IGFyZ3MgPSBsaW5lLnNwbGl0KCc6JywgMyk7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID4gMSkgcmVzdWx0W2FyZ3NbMF1dID0gYXJnc1sxXTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LCB7fSk7XG59XG5cbi8qKlxuICogdmVyaWZ5UGFzc3dvcmQgLSBtYXRjaGVzIHBhc3N3b3JkIGFuZCBpdCdzIGhhc2guXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dkXG4gKiBAcGFyYW0ge3N0cmluZ30gaGFzaFxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlQYXNzd29yZChwYXNzd2Q6IHN0cmluZywgaGFzaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmIChoYXNoLm1hdGNoKC9eXFwkMihhfGJ8eSlcXCQvKSkge1xuICAgIHJldHVybiBiY3J5cHQuY29tcGFyZVN5bmMocGFzc3dkLCBoYXNoKTtcbiAgfSBlbHNlIGlmIChoYXNoLmluZGV4T2YoJ3tQTEFJTn0nKSA9PT0gMCkge1xuICAgIHJldHVybiBwYXNzd2QgPT09IGhhc2guc3Vic3RyKDcpO1xuICB9IGVsc2UgaWYgKGhhc2guaW5kZXhPZigne1NIQX0nKSA9PT0gMCkge1xuICAgIHJldHVybiAoXG4gICAgICBjcnlwdG9cbiAgICAgICAgLmNyZWF0ZUhhc2goJ3NoYTEnKVxuICAgICAgICAvLyBodHRwczovL25vZGVqcy5vcmcvYXBpL2NyeXB0by5odG1sI2NyeXB0b19oYXNoX3VwZGF0ZV9kYXRhX2lucHV0ZW5jb2RpbmdcbiAgICAgICAgLnVwZGF0ZShwYXNzd2QsICd1dGY4JylcbiAgICAgICAgLmRpZ2VzdCgnYmFzZTY0JykgPT09IGhhc2guc3Vic3RyKDUpXG4gICAgKTtcbiAgfVxuICAvLyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHksIGZpcnN0IGNoZWNrIG1kNSB0aGVuIGNoZWNrIGNyeXB0M1xuICByZXR1cm4gbWQ1KHBhc3N3ZCwgaGFzaCkgPT09IGhhc2ggfHwgY3J5cHQzKHBhc3N3ZCwgaGFzaCkgPT09IGhhc2g7XG59XG5cbi8qKlxuICogYWRkVXNlclRvSFRQYXNzd2QgLSBHZW5lcmF0ZSBhIGh0cGFzc3dkIGZvcm1hdCBmb3IgLmh0cGFzc3dkXG4gKiBAcGFyYW0ge3N0cmluZ30gYm9keVxuICogQHBhcmFtIHtzdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd2RcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRVc2VyVG9IVFBhc3N3ZChcbiAgYm9keTogc3RyaW5nLFxuICB1c2VyOiBzdHJpbmcsXG4gIHBhc3N3ZDogc3RyaW5nXG4pOiBzdHJpbmcge1xuICBpZiAodXNlciAhPT0gZW5jb2RlVVJJQ29tcG9uZW50KHVzZXIpKSB7XG4gICAgY29uc3QgZXJyID0gY3JlYXRlRXJyb3IoXG4gICAgICAndXNlcm5hbWUgc2hvdWxkIG5vdCBjb250YWluIG5vbi11cmktc2FmZSBjaGFyYWN0ZXJzJ1xuICAgICk7XG5cbiAgICAvLyAkRmxvd0ZpeE1lXG4gICAgZXJyLnN0YXR1cyA9IDQwOTtcbiAgICB0aHJvdyBlcnI7XG4gIH1cblxuICBpZiAoY3J5cHQzKSB7XG4gICAgcGFzc3dkID0gY3J5cHQzKHBhc3N3ZCk7XG4gIH0gZWxzZSB7XG4gICAgcGFzc3dkID1cbiAgICAgICd7U0hBfScgK1xuICAgICAgY3J5cHRvXG4gICAgICAgIC5jcmVhdGVIYXNoKCdzaGExJylcbiAgICAgICAgLnVwZGF0ZShwYXNzd2QsICd1dGY4JylcbiAgICAgICAgLmRpZ2VzdCgnYmFzZTY0Jyk7XG4gIH1cbiAgY29uc3QgY29tbWVudCA9ICdhdXRvY3JlYXRlZCAnICsgbmV3IERhdGUoKS50b0pTT04oKTtcbiAgbGV0IG5ld2xpbmUgPSBgJHt1c2VyfToke3Bhc3N3ZH06JHtjb21tZW50fVxcbmA7XG5cbiAgaWYgKGJvZHkubGVuZ3RoICYmIGJvZHlbYm9keS5sZW5ndGggLSAxXSAhPT0gJ1xcbicpIHtcbiAgICBuZXdsaW5lID0gJ1xcbicgKyBuZXdsaW5lO1xuICB9XG4gIHJldHVybiBib2R5ICsgbmV3bGluZTtcbn1cblxuLyoqXG4gKiBTYW5pdHkgY2hlY2sgZm9yIGEgdXNlclxuICogQHBhcmFtIHtzdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7b2JqZWN0fSB1c2Vyc1xuICogQHBhcmFtIHtudW1iZXJ9IG1heFVzZXJzXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXR5Q2hlY2soXG4gIHVzZXI6IHN0cmluZyxcbiAgcGFzc3dvcmQ6IHN0cmluZyxcbiAgdmVyaWZ5Rm46IENhbGxiYWNrLFxuICB1c2Vyczoge30sXG4gIG1heFVzZXJzOiBudW1iZXJcbik6IEh0dHBFcnJvciB8IG51bGwge1xuICBsZXQgZXJyO1xuXG4gIC8vIGNoZWNrIGZvciB1c2VyIG9yIHBhc3N3b3JkXG4gIGlmICghdXNlciB8fCAhcGFzc3dvcmQpIHtcbiAgICBlcnIgPSBFcnJvcigndXNlcm5hbWUgYW5kIHBhc3N3b3JkIGlzIHJlcXVpcmVkJyk7XG4gICAgLy8gJEZsb3dGaXhNZVxuICAgIGVyci5zdGF0dXMgPSA0MDA7XG4gICAgcmV0dXJuIGVycjtcbiAgfVxuXG4gIGNvbnN0IGhhc2ggPSB1c2Vyc1t1c2VyXTtcblxuICBpZiAobWF4VXNlcnMgPCAwKSB7XG4gICAgZXJyID0gRXJyb3IoJ3VzZXIgcmVnaXN0cmF0aW9uIGRpc2FibGVkJyk7XG4gICAgLy8gJEZsb3dGaXhNZVxuICAgIGVyci5zdGF0dXMgPSA0MDk7XG4gICAgcmV0dXJuIGVycjtcbiAgfVxuXG4gIGlmIChoYXNoKSB7XG4gICAgY29uc3QgYXV0aCA9IHZlcmlmeUZuKHBhc3N3b3JkLCB1c2Vyc1t1c2VyXSk7XG4gICAgaWYgKGF1dGgpIHtcbiAgICAgIGVyciA9IEVycm9yKCd1c2VybmFtZSBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQnKTtcbiAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgIGVyci5zdGF0dXMgPSA0MDk7XG4gICAgICByZXR1cm4gZXJyO1xuICAgIH1cbiAgICBlcnIgPSBFcnJvcigndW5hdXRob3JpemVkIGFjY2VzcycpO1xuICAgIC8vICRGbG93Rml4TWVcbiAgICBlcnIuc3RhdHVzID0gNDAxO1xuICAgIHJldHVybiBlcnI7XG4gIH0gZWxzZSBpZiAoT2JqZWN0LmtleXModXNlcnMpLmxlbmd0aCA+PSBtYXhVc2Vycykge1xuICAgIGVyciA9IEVycm9yKCdtYXhpbXVtIGFtb3VudCBvZiB1c2VycyByZWFjaGVkJyk7XG4gICAgLy8gJEZsb3dGaXhNZVxuICAgIGVyci5zdGF0dXMgPSA0MDM7XG4gICAgcmV0dXJuIGVycjtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3J5cHRvUGFzc3dvcmQocGFzc3dvcmQ6IHN0cmluZykge1xuICByZXR1cm4gYHtTSEF9JHtjcnlwdG9cbiAgICAuY3JlYXRlSGFzaCgnc2hhMScpXG4gICAgLnVwZGF0ZShwYXNzd29yZCwgJ3V0ZjgnKVxuICAgIC5kaWdlc3QoJ2Jhc2U2NCcpfWA7XG59XG5cbi8qKlxuICogY2hhbmdlUGFzc3dvcmRUb0hUUGFzc3dkIC0gY2hhbmdlIHBhc3N3b3JkIGZvciBleGlzdGluZyB1c2VyXG4gKiBAcGFyYW0ge3N0cmluZ30gYm9keVxuICogQHBhcmFtIHtzdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd2RcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXdQYXNzd2RcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGFuZ2VQYXNzd29yZFRvSFRQYXNzd2QoXG4gIGJvZHk6IHN0cmluZyxcbiAgdXNlcjogc3RyaW5nLFxuICBwYXNzd2Q6IHN0cmluZyxcbiAgbmV3UGFzc3dkOiBzdHJpbmdcbik6IHN0cmluZyB7XG4gIGxldCBfcGFzc3dkO1xuICBsZXQgX25ld1Bhc3N3ZDtcbiAgaWYgKGNyeXB0Mykge1xuICAgIF9wYXNzd2QgPSBjcnlwdDMocGFzc3dkKTtcbiAgICBfbmV3UGFzc3dkID0gY3J5cHQzKG5ld1Bhc3N3ZCk7XG4gIH0gZWxzZSB7XG4gICAgX3Bhc3N3ZCA9IGdldENyeXB0b1Bhc3N3b3JkKHBhc3N3ZCk7XG4gICAgX25ld1Bhc3N3ZCA9IGdldENyeXB0b1Bhc3N3b3JkKG5ld1Bhc3N3ZCk7XG4gIH1cblxuICBsZXQgbGluZXMgPSBib2R5LnNwbGl0KCdcXG4nKTtcbiAgbGluZXMgPSBsaW5lcy5tYXAobGluZSA9PiB7XG4gICAgY29uc3QgW3VzZXJuYW1lLCBwYXNzd29yZF0gPSBsaW5lLnNwbGl0KCc6JywgMyk7XG5cbiAgICBpZiAodXNlcm5hbWUgPT09IHVzZXIpIHtcbiAgICAgIGlmIChwYXNzd29yZCA9PSBfcGFzc3dkKSB7XG4gICAgICAgIC8vIHJlcGxhY2Ugb2xkIHBhc3N3b3JkIGhhc2ggd2l0aCBuZXcgcGFzc3dvcmQgaGFzaFxuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlKF9wYXNzd2QsIF9uZXdQYXNzd2QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG9sZCBQYXNzd29yZCcpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbGluZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xufVxuIl19