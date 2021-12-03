import SocketIOClient from 'socket.io-client';
import _ from 'underscore';

import events from '@socket_events';

const SocketSingleton = (() => {
  class Socket {
    constructor() {
      this.socket = new SocketIOClient('/', {
        transports: ['websocket'],
      });
    }

    subscribe = (eventListeners) => {
      _.each(eventListeners, (listener, event) => {
        this.socket._callbacks[`$${event}`] = [listener];
      });
    };

    isConnected = () => {
      return this.socket.connected;
    };

    checkConnected = () => {
      if (this.isConnected()) {
        return true;
      }
    };

    logout = () => {
      this.socket.emit(events.backend.LOGOUT);
    };

    emitNewNote = (note) => {
      if (this.checkConnected()) {
        this.socket.emit(events.backend.NEW_NOTE, note);
      }
    };

    emitEditNote = (edited) => {
      if (this.checkConnected()) {
        this.socket.emit(events.backend.UPDATE_NOTE, edited);
      }
    };

    emitBulkEditNotes = (noteIds, transformation) => {
      if (this.checkConnected()) {
        this.socket.emit(events.backend.BULK_UPDATE_NOTES, noteIds, transformation);
      }
    };

    emitBulkDeleteNotes = (noteIds) => {
      if (this.checkConnected()) {
        this.socket.emit(events.backend.BULK_DELETE_NOTES, noteIds);
      }
    };

    emitDragNote = (note) => {
      if (this.checkConnected()) {
        this.socket.emit(events.backend.UPDATE_NOTE, note);
        return true;
      }
      return false;
    };

    emitDeleteCompass = (id) => {
      if (this.checkConnected()) {
        this.socket.emit(events.backend.DELETE_WORKSPACE, id);
      }
    };

    emitDeleteNote = (noteId) => {
      if (this.checkConnected()) {
        this.socket.emit(events.backend.DELETE_NOTE, noteId);
      }
    };

    // TODO add note: this file should all say `data`, and let the backend handler define the API.
    emitJoinRoom = (data) => {
      this.socket.emit(events.backend.JOIN_ROOM, data);
    }

    emitSetTopic = (topic) => {
      this.socket.emit(events.backend.SET_TOPIC, { topic });
    }

    emitSetCenter = (id, center) => {
      this.socket.emit(events.backend.SET_CENTER_TEXT, { id, center });
    };

    emitSetCenterPosition = (id, x, y) => {
      this.socket.emit(events.backend.SET_CENTER_POSITION, { id, x, y });
    };

    emitResetCenterPosition = () => {
      this.socket.emit(events.backend.SET_CENTER_POSITION, { x: 0.5, y: 0.5 });
    };

    emitBulkDragNotes = (ids, dx, dy) => {
      this.socket.emit(events.backend.BULK_DRAG_NOTES, ids, { dx, dy });
    };

    emitUpvoteNote = (noteID) => {
      this.socket.emit(events.backend.UPVOTE_NOTE, noteID);
    };
  }

  let instance;

  return {
    getInstance: () => {
      if (instance == null) {
        instance = new Socket();
        instance.constructor = null;
      }

      return instance;
    }
  };
})();

export default SocketSingleton;
