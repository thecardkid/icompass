var _ = require('underscore');

var UserManager = function() {
    this.possibleColors = require('./constants').STICKY_COLORS;
};

UserManager.prototype.getRoom = function(roomCode) {
    if (roomCode in this)
        return this[roomCode];
    else
        return {usernameToColor: {}, colors: this.possibleColors.slice()};
};

UserManager.prototype.setRoom = function(roomCode, manager) {
    return this[roomCode] = manager;
};

UserManager.prototype.addUser = function(roomCode, username, color) {
    var m = this.getRoom(roomCode);

    var u = username;
    var suffix = 2;
    while (u in m.usernameToColor)
        u = username + (suffix++);

    var c = color;
    if (!c) {
        var r = Math.floor(Math.random() * m.colors.length);
        c = m.colors[r];
    }

    m.usernameToColor[u] = c;
    m.colors = _.without(m.colors, c);

    return {
        manager: this.setRoom(roomCode, m),
        newUser: u
    };
};

UserManager.prototype.deleteRoom = function(roomCode) {
    delete this[roomCode];
    return null;
};

UserManager.prototype.removeUser = function(roomCode, username) {
    var m = this.getRoom(roomCode);

    var c = m.usernameToColor[username];
    delete m.usernameToColor[username];

    if (_.isEmpty(m.usernameToColor))
        return this.deleteRoom(roomCode);

    m.colors.push(c);
    return this.setRoom(roomCode, m);
};

module.exports = UserManager;

