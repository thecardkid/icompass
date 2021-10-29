import { browserHistory } from 'react-router';
import SocketIOClient from 'socket.io-client';
import _ from 'underscore';

import events from 'socket-events';
import Modal from '../utils/Modal';
import Toast from '../utils/Toast';

const SocketSingleton = (() => {
  class Socket {
    constructor() {
      this.modal = Modal.getInstance();

      this.socket = new SocketIOClient('/', {
        transports: ['websocket'],
      });
      this.subscribe({
        [events.frontend.WORKSPACE_NOT_FOUND]: this.onWorkspaceNotFound,
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
      if (this.isConnected()) return true;
      Toast.getInstance().error('You are not connected to the server');
    };

    onWorkspaceNotFound = () => {
      this.modal.alert({
        heading: 'Sorry!',
        body: [
          'There was a problem retrieving your workspace.',
          'You will now be taken to the home page.',
        ],
        cb: () => browserHistory.push('/'),
      });
    };

    onReconnect = ({ editCode, users }) => {
      this.socket.emit(events.RECONNECTED, {
        code: editCode,
        username: users.me,
        color: users.nameToColor[users.me],
      });
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

    emitSendFeedback = (email, note) => {
      if (this.checkConnected()) {
        this.socket.emit(events.backend.SEND_FEEDBACK, { email, note });
      }
    };

    emitFindCompassEdit = ({ code, username }) => {
      this.socket.emit(events.backend.FIND_COMPASS_EDIT, { code, username });
    };

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

    emitCreateCopyOfWorkspace = (originalWorkspaceEditCode) => {
      this.socket.emit(events.backend.CREATE_COPY_OF_WORKSPACE, { originalWorkspaceEditCode });
    }
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
