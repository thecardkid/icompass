module.exports = {
  // Shared.
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',

  // Events emitted by the client and handled by the server.
  backend: {
    LOGOUT: 'logout',
    JOIN_ROOM: 'join room',
    SET_TOPIC: 'set topic',
    SET_CENTER_TEXT: 'set center',
    SET_CENTER_POSITION: 'set center position',
    DELETE_WORKSPACE: 'delete compass',
    NEW_NOTE: 'new note',
    UPDATE_NOTE: 'update note',
    DELETE_NOTE: 'delete note',
    UPVOTE_NOTE: '+1 note',
    BULK_UPDATE_NOTES: 'bulk update notes',
    BULK_DRAG_NOTES: 'bulk drag notes',
    BULK_DELETE_NOTES: 'bulk delete notes',
  },

  // Events emitted by the server and handled by the client.
  frontend: {
    SET_TOPIC: 'topic set',
    SET_CENTER_TEXT: 'center set',
    SET_CENTER_POSITION: 'center position set',
    UPDATE_ALL_NOTES: 'update notes',
    DELETED_NOTE: 'deleted notes',
    WORKSPACE_DELETED: 'compass deleted',
    USER_JOINED: 'user joined',
    USER_LEFT: 'user left',
    BAD_USERNAME: 'bad username',
    DUPLICATE_USERNAME: 'username exists',
    REFRESH_REQUIRED: 'refresh required',
    SERVER_ERROR: 'server error',
  },
};
