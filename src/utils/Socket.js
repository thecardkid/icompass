import $ from 'jquery';
import { browserHistory } from 'react-router';
import SocketIOClient from 'socket.io-client';

import Modal from '../utils/Modal';
import Toast from '../utils/Toast';

import { PROMPTS } from '../../lib/constants';

let socket;

export default class Socket {
  constructor(component) {
    if (!socket) {
      socket = new SocketIOClient();
    }

    this.component = component;
    this.toast = new Toast();
    this.modal = new Modal();

    socket.on('user joined', this.handleUserJoined);
    socket.on('user left', this.handleUserLeft);
    socket.on('disconnect', this.handleDisconnect);
    socket.on('reconnect', this.handleReconnect);
    socket.on('new message', this.handleUpdateMessages);
    socket.on('compass deleted', this.handleCompassDeleted);
    socket.on('compass found', this.handleCompassFound);
    socket.on('mail status', this.handleMailStatus);
    socket.on('compass ready', this.handleCompassReady);
    socket.on('update notes', this.handleUpdateNotes);
    socket.on('deleted notes', this.handleDeletedNotes);
    socket.on('start timer', this.handleStartTimer);
    socket.on('all cancel timer', this.handleCancelTimer);
    socket.on('center set', this.handleCenterSet);
  }

  isConnected = () => {
    return socket.connected;
  };

  disconnect = () => {
    return socket.disconnect();
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

  emitCreateTimer = (min, sec) => {
    if (socket.disconnected) return this.alertInvalidAction();
    socket.emit('create timer', min, sec, Date.now());
  };

  emitCancelTimer = () => {
    if (socket.disconnected) return this.alertInvalidAction();
    socket.emit('cancel timer');
  };

  emitNewNote = (note) => {
    if (socket.disconnected) return this.alertInvalidAction();
    if (this.component.props.visualMode) return this.alertVisualModeNoCreate();
    socket.emit('new note', note);
  };

  emitEditNote = (edited) => {
    if (socket.disconnected) return this.alertInvalidAction();
    if (this.component.props.visualMode) return this.alertVisualMode();
    let original = this.component.props.notes[this.component.props.ui.editNote];
    let before = Object.assign({}, original);
    let after = Object.assign({}, before, edited);
    socket.emit('update note', after);
  };

  emitBulkEditNotes = (noteIds, transformation) => {
    if (socket.disconnected) return this.alertInvalidAction();
    socket.emit('bulk update notes', noteIds, transformation);
  };

  emitBulkDeleteNotes = (noteIds) => {
    if (socket.disconnected) return this.alertInvalidAction();
    socket.emit('bulk delete notes', noteIds);
  };

  emitDragNote = (note) => {
    if (socket.disconnected) {
      this.alertInvalidAction();
      return false;
    }
    socket.emit('update note', note);
    return true;
  };

  emitNewDoodle = (user) => {
    if (socket.disconnected) return this.alertInvalidAction();
    if (this.component.props.visualMode) return this.alertVisualMode();

    socket.emit('new note', {
      text: null,
      doodle: document.getElementById('ic-doodle').toDataURL(),
      color: this.component.props.users.nameToColor[this.component.props.users.me],
      x: 0.5,
      y: 0.5,
      user,
    });
  };

  emitDeleteCompass = () => {
    if (socket.disconnected) return this.alertInvalidAction();
    socket.emit('delete compass', this.component.props.compass._id);
  };

  emitDeleteNote = (noteId) => {
    if (socket.disconnected) return this.alertInvalidAction();
    if (this.component.props.visualMode) return this.alertVisualMode();

    socket.emit('delete note', noteId);
  };

  emitMessage = () => {
    if (socket.disconnected) return this.alertInvalidAction();

    let text = $('#message-text').val();
    if (!text) return;

    socket.emit('message', {
      username: this.component.props.users.me,
      text: text,
    });
  };

  emitCreateCompass = (topic, username) => {
    if (socket.disconnected) return this.alertInvalidAction();
    socket.emit('create compass', { topic, username });
  };

  emitFindCompass = (code, username) => {
    if (socket.disconnected) return this.alertInvalidAction();
    socket.emit('find compass', { code, username });
  };

  emitSendMail = (code, username, receiverEmail) => {
    if (socket.disconnected) return this.alertInvalidAction();
    socket.emit('send mail', {
      editCode: code,
      username: username,
      email: receiverEmail,
    });
  };

  emitFindCompassEdit = () => {
    socket.emit('find compass edit', {
      code: this.component.props.params.code,
      username: this.component.props.params.username,
    });
  };

  emitFindCompassView = () => {
    socket.emit('find compass view', {
      code: this.component.props.params.code,
      username: this.component.props.params.username,
    });
  };

  handleCompassFound = (data) => {
    if (data.compass === null) {
      return this.modal.alert(PROMPTS.COMPASS_NOT_FOUND, () => {
        browserHistory.push('/');
      });
    }
    this.component.props.compassActions.set(data.compass, data.viewOnly);
    this.component.props.noteActions.updateAll(data.compass.notes);

    if (this.component.props.userActions)
      this.component.props.userActions.me(data.username);
  };

  emitSetCenter = (id, center) => {
    socket.emit('set center', { id, center });
  };

  handleDisconnect = () => {
    this.component.props.uiActions.setSidebarVisible(true);
  };

  handleReconnect = () => {
    if (this.component.props.compass) {
      socket.emit('reconnected', {
        code: this.component.props.compass.editCode,
        compassId: this.component.props.compass._id,
        username: this.component.props.users.me,
        color: this.component.props.users.nameToColor[this.component.props.users.me],
      });
    }
  };

  handleUpdateNotes = (notes) => {
    this.component.props.noteActions.updateAll(notes);

    if (this.component.props.visualMode)
      this.component.props.workspaceActions.updateSelected(notes.length);
  };

  handleCompassDeleted = () => {
    this.modal.alert(PROMPTS.COMPASS_DELETED, () => {
      browserHistory.push('/');
    });
  };

  handleUserJoined = (data) => {
    this.component.props.chatActions.userJoined(data.joined);
    this.component.props.userActions.update(data);
  };

  handleUserLeft = (data) => {
    this.component.props.chatActions.userLeft(data.left);
    this.component.props.userActions.update(data);
  };

  handleUpdateMessages = (msg) => {
    this.component.props.chatActions.newMessage(msg);

    setTimeout(() => {
      let outer = $('#messages-container');
      let inner = $('#messages');
      // scroll to bottom of messages div
      outer.scrollTop(inner.outerHeight());
    }, 100);

    if (!this.component.props.ui.showChat)
      this.component.props.chatActions.unread();
  };

  handleMailStatus = (status) => {
    if (status) this.toast.success(PROMPTS.EMAIL_SENT);
    else this.toast.error(PROMPTS.EMAIL_NOT_SENT);
  };

  handleCompassReady = (data) => {
    this.component.setState({ data });
  };

  handleDeletedNotes = (deletedIdx) => {
    if (this.component.props.visualMode)
      this.component.props.workspaceActions.removeNotesIfSelected(deletedIdx);
  };

  handleCenterSet = (center) => {
    this.component.setCompassCenter(center);
  };

  handleStartTimer = (min, sec, startTime) => {
    this.component.props.workspaceActions.setTimer({ min, sec, startTime });
    this.toast.info(PROMPTS.TIMEBOX(min, sec));
  };

  handleCancelTimer = () => {
    this.component.props.workspaceActions.setTimer({});
    this.toast.info(PROMPTS.TIMEBOX_CANCELED);
  };
}
