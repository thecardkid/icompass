const { STICKY_COLORS, REGEX } = require('./constants');

class RoomManager {
  constructor() {
    this.clientsByUsernameByRoomID = {};
  }

  joinRoom(roomID, workspaceSocket, isReconnecting=false) {
    const { username } = workspaceSocket;
    if (typeof username !== 'string' || username.length === 0 || !REGEX.CHAR_ONLY.test(username)) {
      throw new Error('bad username');
    }
    const state = this.clientsByUsernameByRoomID[roomID] || {};

    if (state.hasOwnProperty(username) && !isReconnecting) {
      throw new Error('username exists');
    }
    state[workspaceSocket.username] = workspaceSocket;

    const assignedColor = STICKY_COLORS[Object.keys(state).length % STICKY_COLORS.length];
    workspaceSocket.setUserColor(assignedColor);

    this.clientsByUsernameByRoomID[roomID] = state;
  }

  leaveRoom(roomID, username) {
    const room = this.clientsByUsernameByRoomID[roomID];
    if (!room) {
      // TODO throw error
      return;
    }
    if (!room.hasOwnProperty(username)) {
      // Ignore, trying to leave twice.
      return;
    }
    delete room[username];
    if (Object.keys(room).length === 0) {
      delete this.clientsByUsernameByRoomID[roomID];
    } else {
      this.clientsByUsernameByRoomID[roomID] = room;
    }
  }

  getRoomState(roomID) {
    if (!this.clientsByUsernameByRoomID.hasOwnProperty(roomID)) {
      return null;
    }

    const usernameToColor = {};
    for (const x of Object.values(this.clientsByUsernameByRoomID[roomID])) {
      usernameToColor[x.username] = x.getUserColor();
    }
    return { usernameToColor };
  }
}

module.exports = RoomManager;
