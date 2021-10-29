require('babel-polyfill');
const _ = require('underscore');

const mailer = require('./mailer').getInstance();
const { STICKY_COLORS } = require('./constants');
const events = require('./socket_events');
const { DefaultLogger, Logger } = require('./logger');
const config = require('../config');
const Compass = require('../models/compass');

// TODO properly implement catch for all async event handlers.
// TODO standardize logs

// Represents a client connection to the server.
class WorkspaceSocket {
  constructor(io, socket, roomManager) {
    this.io = io;
    this.socket = socket;
    this.roomManager = roomManager;
    this.logger = DefaultLogger;

    this.socket.on(events.DISCONNECT, this.onDisconnect.bind(this));
    this.socket.on(events.RECONNECTED, this.onReconnect.bind(this));
    this.socket.on(events.backend.LOGOUT, this.onLogout.bind(this));
    this.socket.on(events.backend.SEND_FEEDBACK, this.sendFeedback.bind(this));

    this.socket.on(events.backend.CREATE_COPY_OF_WORKSPACE, this.createCompassCopy.bind(this));
    this.socket.on(events.backend.FIND_COMPASS_EDIT, this.findCompassEdit.bind(this));
    this.socket.on(events.backend.SET_CENTER_TEXT, this.setCenter.bind(this));
    this.socket.on(events.backend.SET_CENTER_POSITION, this.setCenterPosition.bind(this));
    this.socket.on(events.backend.DELETE_WORKSPACE, this.deleteCompass.bind(this));

    this.socket.on(events.backend.NEW_NOTE, this.createNote.bind(this));
    this.socket.on(events.backend.UPDATE_NOTE, this.updateNote.bind(this));
    this.socket.on(events.backend.DELETE_NOTE, this.deleteNote.bind(this));
    this.socket.on(events.backend.UPVOTE_NOTE, this.plusOneNote.bind(this));
    this.socket.on(events.backend.BULK_UPDATE_NOTES, this.bulkUpdateNotes.bind(this));
    this.socket.on(events.backend.BULK_DRAG_NOTES, this.bulkDragNotes.bind(this));
    this.socket.on(events.backend.BULK_DELETE_NOTES, this.bulkDeleteNotes.bind(this));
  }

  getUserColor() {
    return this.frontendUserColor;
  }

  setUserColor(color) {
    this.frontendUserColor = color;
  }

  joinRoom({ code, username, compassId, isReconnecting }) {
    this.roomID = code;
    this.username = username;
    this.compassId = compassId;
    this.logger = new Logger(`room=${this.roomID} user=${this.username}`);

    try {
      // This is the effective call to socket-io.
      this.socket.join(this.roomID);
      // This is for reporting purposes.
      this.roomManager.joinRoom(code, this, isReconnecting);
    } catch (ex) {
      this.socket.emit(ex.message);
    }
  }

  broadcast(event, ...args) {
    this.io.sockets.in(this.roomID).emit(event, ...args);
  }

  onDisconnect(reason) {
    if (this.roomID && this.username) {
      this.roomManager.leaveRoom(this.roomID, this.username);
      this.logger.info(`disconnected reason: "${reason}"`);
      this.broadcast(events.frontend.USER_LEFT, {
        users: this.roomManager.getRoomState(this.roomID),
      });
    }
  }

  async onReconnect({ code, compassId, username }) {
    if (!code) {
      this.socket.emit(events.frontend.WORKSPACE_NOT_FOUND);
      this.logger.error('failed to reconnect: invalid code provided');
      return;
    }
    const compass = await Compass.findByEditCode(code);
    if (compass === null) {
      // workspace was probably deleted, but user hasn't navigated away from the page.
      this.socket.emit(events.frontend.WORKSPACE_NOT_FOUND);
      return;
    }

    this.compass = compass;
    this.joinRoom({ code, compassId, username, isReconnecting: true });
    this.logger.info('reconnected');

    this.broadcast(events.frontend.USER_JOINED, {
      users: this.roomManager.getRoomState(code),
      joined: this.username,
    });
  }

  onLogout() {
    this.onDisconnect('log out');
  }

  sendFeedback({ email, note }) {
    mailer.sendMessage({
      subject: 'iCompass Feedback',
      toEmail: 'hieumaster95@gmail.com',
      text: note + `\n\nFrom: ${email || 'No email specified'}` ,
      cb: () => {},
    });
  }

  async createCompassCopy(data) {
    try {
      const compass = await Compass.findByEditCode(data.originalWorkspaceEditCode);
      const copy = await Compass.makeCompassCopy(compass);
      this.socket.emit(events.frontend.CREATED_COPY_OF_WORKSPACE, {
        success: !!copy,
        editCode: copy.editCode,
      });
    } catch (ex) {
      this.logger.error('Error creating copy of compass: ', JSON.stringify(data), ex);
    }
  }

  async setCenter(data) {
    try {
      this.compass = await this.compass.setCenter(data.center);
      if (!!this.compass) {
        this.broadcast(events.frontend.SET_CENTER_TEXT, data.center);
      }
    } catch (ex) {
      this.logger.error('Error setting center: ', JSON.stringify(data), ex);
    }
  }

  async setCenterPosition({ x, y }) {
    try {
      this.compass = await this.compass.setCenterPosition(x, y);
      if (!!this.compass) {
        this.broadcast(events.frontend.SET_CENTER_POSITION, x, y);
      }
    } catch (ex) {
      this.logger.error(ex);
    }
  }

  async findCompassEdit({ code, username }) {
    try {
      const compass = await Compass.findByEditCode(code);
      if (compass !== null) {
        this.joinRoom({ code, username, isReconnecting: false });
        this.logger.info('joined room');
        this.broadcast(events.frontend.USER_JOINED, {
          users: this.roomManager.getRoomState(code),
          joined: this.username,
        });
      }
      this.compass = compass;
      this.socket.emit(events.frontend.WORKSPACE_FOUND, {
        compass: compass,
        username: this.username,
        viewOnly: false,
      });
    } catch (ex) {
      this.logger.error(`Error find compass edit: code=${code} username=${username}`, ex);
    }
  }

  // TODO make API request
  deleteCompass(id) {
    const expectedID = this.compass._id.toString();
    if (expectedID !== id) {
      this.logger.warn(`Attempted to delete compass id=${id}, but socket's compass id is ${expectedID}`);
      return;
    }

    Compass.remove({ _id: id }, (err) => {
      if (err) {
        this.logger.error(`Error deleting compass id=${id}:`, err);
      }

      this.logger.info(`Deleted compass id=${id}`);
      this.broadcast(events.frontend.WORKSPACE_DELETED);
    });
  }

  async createNote(note) {
    try {
      this.compass = await this.compass.addNote(note);
      this.broadcast('update notes', this.compass.notes);
    } catch (ex) {
      this.logger.error('Error creating note: ', JSON.stringify(note), ex);
    }
  }

  async updateNote(updatedNote) {
    try {
      this.compass = await this.compass.updateNote(updatedNote);
      this.broadcast('update notes', this.compass.notes);
    } catch (ex) {
      this.logger.error('Error updating note: ', JSON.stringify(updatedNote), ex);
    }
  }

  async deleteNote(id) {
    try {
      const { compass, deletedIdx } = await this.compass.deleteNote(id);
      this.compass = compass;
      this.broadcast(events.frontend.UPDATE_ALL_NOTES, compass.notes);
      this.broadcast(events.frontend.DELETED_NOTE, deletedIdx);
    } catch (ex) {
      this.logger.error('Error deleting note: ', id, ex);
    }
  }

  async plusOneNote(id) {
    try {
      this.compass = await this.compass.plusOneNote(id);
      this.broadcast('update notes', this.compass.notes);
    } catch (ex) {
      this.logger.error('Error upvoting note: ', id, ex);
    }
  }

  async bulkUpdateNotes(ids, transformation) {
    try {
      if (transformation.color == null) return;

      if (!_.contains(STICKY_COLORS, transformation.color)) return;

      this.compass = await this.compass.bulkUpdateNotes(ids, transformation);
      this.broadcast('update notes', this.compass.notes);
    } catch (ex) {
      this.logger.error('Error bulk updating notes: ', JSON.stringify({ ids, transformation }), ex);
    }
  }

  async bulkDragNotes(ids, { dx, dy }) {
    try {
      this.compass = await this.compass.bulkDragNotes(ids, { dx, dy });
      this.broadcast('update notes', this.compass.notes);
    } catch (ex) {
      this.logger.error('Error bulk dragging notes: ', JSON.stringify({ ids, dx, dy }), ex);
    }
  }

  async bulkDeleteNotes(ids) {
    try {
      const { compass, deletedIdx } = await this.compass.deleteNotes(ids);
      this.compass = compass;
      this.broadcast(events.frontend.UPDATE_ALL_NOTES, this.compass.notes);
      this.broadcast(events.frontend.DELETED_NOTE, deletedIdx);
    } catch (ex) {
      this.logger.error('Error bulk deleting notes: ', ids, ex);
    }
  }
}

module.exports = WorkspaceSocket;
