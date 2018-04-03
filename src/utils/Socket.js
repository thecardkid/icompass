import SocketIOClient from 'socket.io-client';
import _ from 'underscore';

import Modal from '../utils/Modal';
import Toast from '../utils/Toast';

import { PROMPTS } from '../../lib/constants';

let socket;

export default class Socket {
  constructor(component) {
    this.component = component;
    this.toast = new Toast();
    this.modal = new Modal();

    if (!socket) socket = new SocketIOClient();
    this.socket = socket;

    this.socket.on('mail status', this.onMailStatus);
  }

  subscribe = (eventListeners) => {
    _.each(eventListeners, (listener, event) => this.socket.on(event, listener));
  };

  isConnected = () => {
    return this.socket.connected;
  };

  disconnect = () => {
    return this.socket.disconnect();
  };

  alertInvalidAction() {
    this.toast.error(PROMPTS.NOT_CONNECTED);
  }

  alertVisualMode() {
    this.toast.warn(PROMPTS.VISUAL_MODE_NO_CHANGE);
  }

  alertVisualModeNoCreate() {
    this.toast.warn(PROMPTS.VISUAL_MODE_NO_CREATE);
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
    if (this.socket.disconnected) return this.alertInvalidAction();
    this.socket.emit('create timer', min, sec, Date.now());
  };

  emitCancelTimer = () => {
    if (this.socket.disconnected) return this.alertInvalidAction();
    this.socket.emit('cancel timer');
  };

  emitNewNote = (note) => {
    if (this.socket.disconnected) return this.alertInvalidAction();
    // TODO if (this.component.props.visualMode) return this.alertVisualModeNoCreate();
    this.socket.emit('new note', note);
  };

  emitEditNote = (edited) => {
    if (this.socket.disconnected) return this.alertInvalidAction();
    // TODO if (this.component.props.visualMode) return this.alertVisualMode();
    this.socket.emit('update note', edited);
  };

  emitBulkEditNotes = (noteIds, transformation) => {
    if (this.socket.disconnected) return this.alertInvalidAction();
    this.socket.emit('bulk update notes', noteIds, transformation);
  };

  emitBulkDeleteNotes = (noteIds) => {
    if (this.socket.disconnected) return this.alertInvalidAction();
    this.socket.emit('bulk delete notes', noteIds);
  };

  emitDragNote = (note) => {
    if (this.socket.disconnected) {
      this.alertInvalidAction();
      return false;
    }
    this.socket.emit('update note', note);
    return true;
  };

  emitNewDoodle = (doodle) => {
    if (this.socket.disconnected) return this.alertInvalidAction();
    // TODO if (this.component.props.visualMode) return this.alertVisualMode();
    this.socket.emit('new note', doodle);
  };

  emitDeleteCompass = (id) => {
    if (this.socket.disconnected) return this.alertInvalidAction();
    this.socket.emit('delete compass', id);
  };

  emitDeleteNote = (noteId) => {
    if (this.socket.disconnected) return this.alertInvalidAction();
    // TODO if (this.component.props.visualMode) return this.alertVisualMode();

    this.socket.emit('delete note', noteId);
  };

  emitMessage = (username, text) => {
    if (this.socket.disconnected) return this.alertInvalidAction();
    if (!text) return;

    this.socket.emit('message', { username, text });
  };

  emitCreateCompass = (topic, username) => {
    if (this.socket.disconnected) return this.alertInvalidAction();
    this.socket.emit('create compass', { topic, username });
  };

  emitFindCompass = (code, username) => {
    if (this.socket.disconnected) return this.alertInvalidAction();
    this.socket.emit('find compass', { code, username });
  };

  emitSendMail = (code, username, receiverEmail) => {
    if (this.socket.disconnected) return this.alertInvalidAction();
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
