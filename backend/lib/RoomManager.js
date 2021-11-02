const events = require('./socket_events');
const Compass = require('../models/compass');

// Duplicated in src/utils/regex.js
const charOnlyPattern = /^[a-zA-Z]+$/;
function isCharOnly(s) {
  return charOnlyPattern.test(s);
}

class Room {
  constructor(roomID) {
    this.roomID = roomID;
    this.colorIndex = 0;
    this.clientsByUsername = {};
    Compass.findByEditCode(roomID).then($workspace => {
      this.$workspace = $workspace;
    }).catch(err => {
      throw new Error(`failed to find workspace with code=${roomID} err: ${err}`);
    });
  }

  // If the username is invalid, this function throws an error whose message
  // is the socket event to be emitted to the frontend.
  addClient(username, workspaceSocket, isReconnecting) {
    if (typeof username !== 'string' || username.length === 0 || !isCharOnly(username)) {
      throw new Error(events.frontend.BAD_USERNAME);
    }
    if (this.clientsByUsername.hasOwnProperty(username) && !isReconnecting) {
      throw new Error(events.frontend.DUPLICATE_USERNAME);
    }
    this.clientsByUsername[username] = workspaceSocket;
  }

  removeClient(username) {
    if (!this.clientsByUsername.hasOwnProperty(username)) {
      // Ignore, trying to leave twice.
      return;
    }
    delete this.clientsByUsername[username];
  }

  isEmpty() {
    return Object.keys(this.clientsByUsername).length === 0;
  }

  getState() {
    return { usernames: Object.keys(this.clientsByUsername), };
  }
}

class RoomManager {
  constructor() {
    this.roomByID = {};
  }

  joinRoom(roomID, username, workspaceSocket, isReconnecting=false) {
    let room = this.roomByID[roomID] || new Room(roomID);
    room.addClient(username, workspaceSocket, isReconnecting);
    this.roomByID[roomID] = room;
    return room;
  }

  leaveRoom(roomID, username) {
    const room = this.roomByID[roomID];
    if (!room) {
      // TODO throw error
      return;
    }
    room.removeClient(username);
    if (room.isEmpty()) {
      delete this.roomByID[roomID];
    }
  }

  getRoomState(roomID) {
    const room = this.roomByID[roomID];
    if (!room) {
      return null;
    }
    return room.getState();
  }
}

module.exports = RoomManager;
