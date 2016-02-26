'use strict';

module.exports = HTPasswd;

function HTPasswd(config, stuff) {
    var self = Object.create(HTPasswd.prototype);
    self._users = {};
    self._config = config;
    self._logger = stuff.logger;
    self._sinopia_config = stuff.config;

    return self
}

HTPasswd.prototype.authenticate = function (user, password, done) {
    var self = this

    if (!self._users[user]) {
        return done(null, false);
    }

    if (password !== self._users[user].password) {
        return done(null, false);
    }

    // authentication succeeded!
    // return all usergroups this user has access to;
    return done(null, [user])

};

HTPasswd.prototype.adduser = function (user, password, done) {
    var self = this;
    self._users[user] = {name: user, password: password};

    done(null, user);
};
