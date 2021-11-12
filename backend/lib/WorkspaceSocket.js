require('babel-polyfill');
const _ = require('underscore');

const { STICKY_COLORS } = require('./constants');
const events = require('./socket_events');
const { DefaultLogger, Logger } = require('./logger');
const Compass = require('../models/compass');

// TODO standardize logs

// Represents a client connection to the server.
class WorkspaceSocket {
  constructor(io, socket, roomManager) {
    this.io = io;
    this.socket = socket;
    this.roomManager = roomManager;
    this.logger = DefaultLogger;

    this.socket.on(events.DISCONNECT, this.onDisconnect.bind(this));

    this.socket.on(events.backend.JOIN_ROOM, this.joinRoom.bind(this));
    this.socket.on(events.backend.LOGOUT, this.onLogout.bind(this));
    this.socket.on(events.backend.SET_CENTER_TEXT, this.setCenter.bind(this));
    this.socket.on(events.backend.SET_CENTER_POSITION, this.setCenterPosition.bind(this));
    this.socket.on(events.backend.NEW_NOTE, this.createNote.bind(this));
    this.socket.on(events.backend.UPDATE_NOTE, this.updateNote.bind(this));
    this.socket.on(events.backend.DELETE_NOTE, this.deleteNote.bind(this));
    this.socket.on(events.backend.UPVOTE_NOTE, this.plusOneNote.bind(this));
    this.socket.on(events.backend.BULK_UPDATE_NOTES, this.bulkUpdateNotes.bind(this));
    this.socket.on(events.backend.BULK_DRAG_NOTES, this.bulkDragNotes.bind(this));
    this.socket.on(events.backend.BULK_DELETE_NOTES, this.bulkDeleteNotes.bind(this));
    this.socket.on(events.backend.DELETE_WORKSPACE, this.deleteCompass.bind(this));
  }

  broadcast(event, ...args) {
    this.io.sockets.in(this.roomID).emit(event, ...args);
  }

  // When the server is restarted, we lose all Mongoose models loaded into
  // memory. So we emit an event that will trigger a page reload, to force
  // the user to re-join the workspace.
  clientShouldRefresh() {
    if (!this.room || !this.room.$workspace) {
      this.socket.emit(events.frontend.REFRESH_REQUIRED);
      this.logger.info('Requested client-side refresh');
      return true;
    }
    return false;
  }

  onDisconnect(reason) {
    if (this.roomID && this.username) {
      this.roomManager.leaveRoom(this.roomID, this.username);
      this.logger.info(`disconnected reason: "${reason}"`);
      this.broadcast(events.frontend.USER_LEFT, {
        users: this.room.getState(),
      });
    }
  }

  onLogout() {
    this.onDisconnect('log out');
  }

  joinRoom({ workspaceEditCode, username, isReconnecting }) {
    try {
      // This must be called first, as it will throw on duplicate/invalid usernames.
      this.room = this.roomManager.joinRoom(workspaceEditCode, username, this, isReconnecting);
      this.roomID = workspaceEditCode;
      // This is the effective call to socket-io.
      this.socket.join(this.roomID);
      // Don't set this.username until after `joinRoom` succeeds, meaning the username
      // is valid. Otherwise:
      // - this.username is set, but joinRoom fails. Client shows "duplicate username"
      //   modal.
      // - When user clicks to pick a new username, the socket emits a disconnect event
      //   with reason "log out". This causes the server to try to broadcast that this
      //   user has left. However, this.username is wrong, and this.room is undefined.
      this.username = username;
      this.logger = new Logger(`room=${this.roomID} user=${this.username}`);

      this.logger.info('joined room');
      this.broadcast(events.frontend.USER_JOINED, {
        users: this.room.getState(),
        joined: this.username,
      });
    } catch (ex) {
      if (ex.message === events.frontend.BAD_USERNAME ||
          ex.message === events.frontend.DUPLICATE_USERNAME) {
        this.logger.info(`Client error joining room: code=${workspaceEditCode} username=${username}`, ex.message);
        this.socket.emit(ex.message);
      } else {
        this.logger.error(`Server error joining room: code=${workspaceEditCode} username=${username}`, ex);
      }
    }
  }

  async setCenter(data) {
    if (this.clientShouldRefresh()) {
      return;
    }
    try {
      await this.room.$workspace.setCenter(data.center);
      this.broadcast(events.frontend.SET_CENTER_TEXT, data.center);
    } catch (ex) {
      this.logger.error('Error setting center: ', JSON.stringify(data), ex);
    }
  }

  async setCenterPosition({ x, y }) {
    if (this.clientShouldRefresh()) {
      return;
    }
    try {
      await this.room.$workspace.setCenterPosition(x, y);
      this.broadcast(events.frontend.SET_CENTER_POSITION, x, y);
    } catch (ex) {
      this.logger.error(ex);
    }
  }

  async deleteCompass(id) {
    if (this.clientShouldRefresh()) {
      return;
    }
    const expectedID = this.room.$workspace._id.toString();
    if (expectedID !== id) {
      this.logger.warn(`Attempted to delete compass id=${id}, but socket's compass id is ${expectedID}`);
      return;
    }

    try {
      await Compass.remove({ _id: id });
      this.logger.info(`Deleted compass id=${id}`);
      this.broadcast(events.frontend.WORKSPACE_DELETED);
    } catch (ex) {
      this.logger.error(`Error deleting compass id=${id}:`, ex.message);
    }
  }

  async createNote(note) {
    if (this.clientShouldRefresh()) {
      return;
    }
    try {
      const model = await this.room.$workspace.addNote(note);
      this.broadcast(events.frontend.UPDATE_ALL_NOTES, model.notes);
    } catch (ex) {
      this.logger.error('Error creating note: ', JSON.stringify(note), ex);
    }
  }

  async updateNote(updatedNote) {
    if (this.clientShouldRefresh()) {
      return;
    }
    try {
      const model = await this.room.$workspace.updateNote(updatedNote);
      this.broadcast(events.frontend.UPDATE_ALL_NOTES, model.notes);
    } catch (ex) {
      this.logger.error('Error updating note: ', JSON.stringify(updatedNote), ex);
    }
  }

  async deleteNote(id) {
    if (this.clientShouldRefresh()) {
      return;
    }
    try {
      const { compass, deletedIdx } = await this.room.$workspace.deleteNote(id);
      this.broadcast(events.frontend.UPDATE_ALL_NOTES, compass.notes);
      this.broadcast(events.frontend.DELETED_NOTE, deletedIdx);
    } catch (ex) {
      this.logger.error('Error deleting note: ', id, ex);
    }
  }

  async plusOneNote(id) {
    if (this.clientShouldRefresh()) {
      return;
    }
    try {
      const model = await this.room.$workspace.plusOneNote(id);
      this.broadcast(events.frontend.UPDATE_ALL_NOTES, model.notes);
    } catch (ex) {
      this.logger.error('Error upvoting note: ', id, ex);
    }
  }

  async bulkUpdateNotes(ids, transformation) {
    if (this.clientShouldRefresh()) {
      return;
    }
    try {
      if (transformation.color == null) {
        return;
      }
      if (!_.contains(STICKY_COLORS, transformation.color)) {
        return;
      }
      const model = await this.room.$workspace.bulkUpdateNotes(ids, transformation);
      this.broadcast(events.frontend.UPDATE_ALL_NOTES, model.notes);
    } catch (ex) {
      this.logger.error('Error bulk updating notes: ', JSON.stringify({ ids, transformation }), ex);
    }
  }

  async bulkDragNotes(ids, { dx, dy }) {
    if (this.clientShouldRefresh()) {
      return;
    }
    try {
      const model = await this.room.$workspace.bulkDragNotes(ids, { dx, dy });
      this.broadcast(events.frontend.UPDATE_ALL_NOTES, model.notes);
    } catch (ex) {
      this.logger.error('Error bulk dragging notes: ', JSON.stringify({ ids, dx, dy }), ex);
    }
  }

  async bulkDeleteNotes(ids) {
    if (this.clientShouldRefresh()) {
      return;
    }
    try {
      const { compass, deletedIdx } = await this.room.$workspace.deleteNotes(ids);
      this.broadcast(events.frontend.UPDATE_ALL_NOTES, compass.notes);
      this.broadcast(events.frontend.DELETED_NOTE, deletedIdx);
    } catch (ex) {
      this.logger.error('Error bulk deleting notes: ', ids, ex);
    }
  }
}

module.exports = WorkspaceSocket;
