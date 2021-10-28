module.exports = {
  // Shared.
  DISCONNECT: 'disconnect',
  RECONNECTED: 'reconnected',
  RECONNECT: 'reconnect',

  // Events emitted by the client and handled by the server.
  backend: {
    LOGOUT: 'logout',
    SEND_FEEDBACK: 'send feedback',
    SEND_MAIL: 'send mail',
    AUTO_SEND_MAIL: 'auto send mail',
    SEND_MAIL_BOOKMARKS: 'send mail bookmarks',
    CREATE_WORKSPACE: 'create compass',
    CREATE_COPY_OF_WORKSPACE: 'create copy of compass',
    AUTOMATED_CREATE_DEV_WORKSPACE: 'automated create compass',
    FIND_COMPASS_EDIT: 'find compass edit',
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
    SET_CENTER_TEXT: 'center set',
    SET_CENTER_POSITION: 'center position set',
    UPDATE_ALL_NOTES: 'update notes',
    DELETED_NOTE: 'deleted notes',
    CREATED_COPY_OF_WORKSPACE: 'copy of compass ready',
    CREATED_WORKSPACE_DEV: 'automated compass ready',
    WORKSPACE_READY: 'compass ready',
    WORKSPACE_FOUND: 'compass found',
    WORKSPACE_DELETED: 'compass deleted',
    USER_JOINED: 'user joined',
    USER_LEFT: 'user left',
    BAD_USERNAME: 'bad username',
    DUPLICATE_USERNAME: 'username exists',
    MAIL_STATUS: 'mail status',
    AUTO_MAIL_STATUS: 'auto mail status',
    WORKSPACE_NOT_FOUND: 'workspace not found',
  },
};
