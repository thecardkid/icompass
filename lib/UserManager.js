const _ = require('underscore');
const COLORS = require('./constants').STICKY_COLORS;

module.exports = class UserManager {
  constructor() {
    this.possibleColors = COLORS;
    this.rooms = {};
  }

  getRoom(code) {
    if (_.has(this.rooms, code)) {
      return this.rooms[code];
    } else {
      return {
        usernameToColor: {},
        colors: this.possibleColors.slice(),
      };
    }
  }

  setRoom(code, manager) {
    return this.rooms[code] = manager;
  }

  addUser(code, username, color) {
    const m = this.getRoom(code);

    let u = username;
    let suffix = 2;
    while (u in m.usernameToColor) {
      u = username + (suffix++);
    }

    let c = color;
    if (!c) {
      const r = Math.floor(Math.random() * m.colors.length);
      c = m.colors[r];
    }

    m.usernameToColor[u] = c;
    m.colors = _.without(m.colors, c);

    return {
      manager: this.setRoom(code, m),
      newUser: u,
    };
  }

  deleteRoom(code) {
    delete this.rooms[code];
    return null;
  }

  removeUser(code, username) {
    const m = this.getRoom(code);
    const c = m.usernameToColor[username];

    delete m.usernameToColor[username];

    if (_.isEmpty(m.usernameToColor)) {
      return this.deleteRoom(code);
    }

    m.colors.push(c);
    return this.setRoom(code, m);
  }
};
