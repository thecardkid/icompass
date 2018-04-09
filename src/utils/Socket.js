import SocketIOClient from 'socket.io-client';
import _ from 'underscore';

import Modal from '../utils/Modal';
import Toast from '../utils/Toast';

import { PROMPTS } from '../../lib/constants';

let socket;

export default class Socket {
  constructor() {
    this.toast = new Toast();
    this.modal = new Modal();

    if (!socket || (this.socket && !this.isConnected())) {
      socket = new SocketIOClient();
      this.socket = socket;
      this.subscribe({
        'mail status': this.onMailStatus,
      });
    }
    this.socket = socket;
  }

  subscribe = (eventListeners) => {
    _.each(eventListeners, (listener, event) => {
      this.socket._callbacks[`$${event}`] = [listener];
    });
  };

  isConnected = () => {
    return this.socket.connected;
  };

  alertDisconnected() {
    this.toast.error(PROMPTS.NOT_CONNECTED);
  }

  emitReconnected = ({ compass, users }) => {
    this.socket.emit('reconnected', {
      code: compass.editCode,
      compassId: compass._id,
      username: users.me,
      color: users.nameToColor[users.me],
    });
  };

  emitCreateTimer = (min, sec) => {
    if (!this.isConnected()) return this.alertDisconnected();
    this.socket.emit('create timer', min, sec, Date.now());
  };

  emitCancelTimer = () => {
    if (!this.isConnected()) return this.alertDisconnected();
    this.socket.emit('cancel timer');
  };

  emitNewNote = (note) => {
    if (!this.isConnected()) return this.alertDisconnected();
    this.socket.emit('new note', note);
  };

  emitEditNote = (edited) => {
    if (!this.isConnected()) return this.alertDisconnected();
    this.socket.emit('update note', edited);
  };

  emitBulkEditNotes = (noteIds, transformation) => {
    if (!this.isConnected()) return this.alertDisconnected();
    this.socket.emit('bulk update notes', noteIds, transformation);
  };

  emitBulkDeleteNotes = (noteIds) => {
    if (!this.isConnected()) return this.alertDisconnected();
    this.socket.emit('bulk delete notes', noteIds);
  };

  emitDragNote = (note) => {
    if (!this.isConnected()) {
      this.alertDisconnected();
      return false;
    }
    this.socket.emit('update note', note);
    return true;
  };

  emitDeleteCompass = (id) => {
    if (!this.isConnected()) return this.alertDisconnected();
    this.socket.emit('delete compass', id);
  };

  emitDeleteNote = (noteId) => {
    if (!this.isConnected()) return this.alertDisconnected();
    this.socket.emit('delete note', noteId);
  };

  emitMessage = (username, text) => {
    if (!this.isConnected()) return this.alertDisconnected();
    if (!text) return;

    this.socket.emit('message', { username, text });
  };

  emitCreateCompass = (topic, username) => {
    if (!this.isConnected()) return this.alertDisconnected();
    this.socket.emit('create compass', { topic, username });
  };

  emitFindCompass = (code, username) => {
    if (!this.isConnected()) return this.alertDisconnected();
    this.socket.emit('find compass', { code, username });
  };

  emitSendMail = (code, username, receiverEmail) => {
    if (!this.isConnected()) return this.alertDisconnected();
    this.socket.emit('send mail', {
      editCode: code,
      username: username,
      email: receiverEmail,
    });
  };

  emitFindCompassEdit = ({ code, username }) => {
    this.socket.emit('find compass edit', { code, username });
  };

  emitFindCompassView = ({ code, username }) => {
    this.socket.emit('find compass view', { code, username });
  };

  emitSetCenter = (id, center) => {
    this.socket.emit('set center', { id, center });
  };

  onMailStatus = (status) => {
    if (status) this.toast.success(PROMPTS.EMAIL_SENT);
    else this.toast.error(PROMPTS.EMAIL_NOT_SENT);
  };
}
