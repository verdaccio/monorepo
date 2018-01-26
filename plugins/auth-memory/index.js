'use strict';

function Memory(config, stuff) {
    var self = Object.create(Memory.prototype);
    self._users = {};
    self._config = config;
    self._logger = stuff.logger;
    self._sinopia_config = stuff.config;

    return self
}

Memory.prototype.authenticate = function (user, password, done) {
    var self = this

    if (!self._users[user]) {
        return done(true, false);
    }

    if (password !== self._users[user].password) {
        return done(true, false);
    }

    // authentication succeeded!
    // return all usergroups this user has access to;
    return done(null, [user])

};

Memory.prototype.adduser = function (user, password, done) {
    var self = this;
    self._users[user] = {name: user, password: password};

    done(null, user);
};

module.exports = Memory;