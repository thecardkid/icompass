'use strict';

import SocketIOClient from 'socket.io-client';
import { browserHistory } from 'react-router';

import Modal from '../utils/Modal';
import Toast from '../utils/Toast';

import { PROMPTS } from '../../lib/constants';

export default class Socket {
    constructor(component) {
        this.component = component;
        this.socket = new SocketIOClient();
        this.toast = new Toast();
        this.modal = new Modal();

        this.disconnect = this.disconnect.bind(this);

        this.emitCreateTimer = this.emitCreateTimer.bind(this);
        this.emitCancelTimer = this.emitCancelTimer.bind(this);
        this.emitNewNote = this.emitNewNote.bind(this);
        this.emitDragNote = this.emitDragNote.bind(this);
        this.emitEditNote = this.emitEditNote.bind(this);
        this.emitBulkEditNotes = this.emitBulkEditNotes.bind(this);
        this.emitBulkDeleteNotes = this.emitBulkDeleteNotes.bind(this);
        this.emitNewDoodle = this.emitNewDoodle.bind(this);
        this.emitDeleteCompass = this.emitDeleteCompass.bind(this);
        this.emitDeleteNote = this.emitDeleteNote.bind(this);
        this.emitMessage = this.emitMessage.bind(this);
        this.emitFindCompassEdit = this.emitFindCompassEdit.bind(this);
        this.emitFindCompassView = this.emitFindCompassView.bind(this);
        this.emitCreateCompass = this.emitCreateCompass.bind(this);
        this.emitFindCompass = this.emitFindCompass.bind(this);
        this.emitSendMail = this.emitSendMail.bind(this);

        this.handleDisconnect = this.handleDisconnect.bind(this);
        this.handleReconnect = this.handleReconnect.bind(this);
        this.handleCompassDeleted = this.handleCompassDeleted.bind(this);
        this.handleUserJoined = this.handleUserJoined.bind(this);
        this.handleUserLeft = this.handleUserLeft.bind(this);
        this.handleUpdateMessages = this.handleUpdateMessages.bind(this);
        this.handleCompassFound = this.handleCompassFound.bind(this);
        this.handleMailStatus = this.handleMailStatus.bind(this);
        this.handleCompassReady = this.handleCompassReady.bind(this);
        this.handleUpdateNotes = this.handleUpdateNotes.bind(this);
        this.handleDeletedNotes = this.handleDeletedNotes.bind(this);
        this.handleStartTimer = this.handleStartTimer.bind(this);
        this.handleCancelTimer = this.handleCancelTimer.bind(this);

        this.socket.on('user joined', this.handleUserJoined);
        this.socket.on('user left', this.handleUserLeft);
        this.socket.on('disconnect', this.handleDisconnect);
        this.socket.on('reconnect', this.handleReconnect);
        this.socket.on('new message', this.handleUpdateMessages);
        this.socket.on('compass deleted', this.handleCompassDeleted);
        this.socket.on('compass found', this.handleCompassFound);
        this.socket.on('mail status', this.handleMailStatus);
        this.socket.on('compass ready', this.handleCompassReady);
        this.socket.on('update notes', this.handleUpdateNotes);
        this.socket.on('deleted notes', this.handleDeletedNotes);
        this.socket.on('start timer', this.handleStartTimer);
        this.socket.on('all cancel timer', this.handleCancelTimer);
    }

    disconnect() {
        return this.socket.disconnect();
    }

    alertInvalidAction() {
        this.toast.error(PROMPTS.NOT_CONNECTED);
    }

    alertVisualMode() {
        this.toast.warn(PROMPTS.VISUAL_MODE_NO_CHANGE);
    }

    alertVisualModeNoCreate() {
        this.toast.warn(PROMPTS.VISUAL_MODE_NO_CREATE);
    }

    emitCreateTimer(min, sec) {
        if (this.socket.disconnected) return this.alertInvalidAction();
        this.socket.emit('create timer', min, sec, Date.now());
    }

    emitCancelTimer() {
        if (this.socket.disconnected) return this.alertInvalidAction();
        this.socket.emit('cancel timer');
    }

    emitNewNote(note) {
        if (this.socket.disconnected) return this.alertInvalidAction();
        if (this.component.props.visualMode) return this.alertVisualModeNoCreate();
        this.socket.emit('new note', note);
    }

    emitEditNote(edited) {
        if (this.socket.disconnected) return this.alertInvalidAction();
        if (this.component.props.visualMode) return this.alertVisualMode();
        let original = this.component.props.notes[this.component.props.ui.editNote];
        let before = Object.assign({}, original);
        let after = Object.assign({}, before, edited);
        this.socket.emit('update note', after);
    }

    emitBulkEditNotes(noteIds, transformation) {
        if (this.socket.disconnected) return this.alertInvalidAction();
        this.socket.emit('bulk update notes', noteIds, transformation);
    }

    emitBulkDeleteNotes(noteIds) {
        if (this.socket.disconnected) return this.alertInvalidAction();
        this.socket.emit('bulk delete notes', noteIds);
    }

    emitDragNote(note) {
        if (this.socket.disconnected) {
            this.alertInvalidAction();
            return false;
        }
        this.socket.emit('update note', note);
        return true;
    }

    emitNewDoodle(user) {
        if (this.socket.disconnected) return this.alertInvalidAction();
        if (this.component.props.visualMode) return this.alertVisualMode();

        this.socket.emit('new note', {
            text: null,
            doodle: document.getElementById('ic-doodle').toDataURL(),
            color: this.component.props.users.nameToColor[this.component.props.users.me],
            x: 0.5,
            y: 0.5,
            user
        });
    }

    emitDeleteCompass() {
        if (this.socket.disconnected) return this.alertInvalidAction();
        this.socket.emit('delete compass', this.component.props.compass._id);
    }

    emitDeleteNote(noteId) {
        if (this.socket.disconnected) return this.alertInvalidAction();
        if (this.component.props.visualMode) return this.alertVisualMode();

        this.socket.emit('delete note', noteId);
    }

    emitMessage() {
        if (this.socket.disconnected) return this.alertInvalidAction();

        let text = $('#message-text').val();
        if (!text) return;

        this.socket.emit('message', {
            username: this.component.props.users.me,
            text: text
        });
    }

    emitCreateCompass(center, username) {
        if (this.socket.disconnected) return this.alertInvalidAction();
        this.socket.emit('create compass', { center, username });
    }

    emitFindCompass(code, username) {
        if (this.socket.disconnected) return this.alertInvalidAction();
        this.socket.emit('find compass', { code, username });
    }

    emitSendMail(code, username, receiverEmail) {
        if (this.socket.disconnected) return this.alertInvalidAction();
        this.socket.emit('send mail', {
            editCode: code,
            username: username,
            email: receiverEmail
        });
    }

    emitFindCompassEdit() {
        this.socket.emit('find compass edit', {
            code: this.component.props.params.code,
            username: this.component.props.params.username
        });
    }

    emitFindCompassView() {
        this.socket.emit('find compass view', {
            code: this.component.props.params.code,
            username: this.component.props.params.username
        });
    }

    handleCompassFound(data) {
        if (data.compass === null) {
            return this.modal.alert(PROMPTS.COMPASS_NOT_FOUND, () => {
                browserHistory.push('/');
            });
        }
        this.component.props.compassActions.set(data.compass, data.viewOnly);
        this.component.props.noteActions.updateAll(data.compass.notes);

        if (this.component.props.userActions)
            this.component.props.userActions.me(data.username);
    }

    handleDisconnect() {
        this.component.props.uiActions.setSidebarVisible(true);
    }

    handleReconnect() {
        if (this.component.props.compass) {
            this.socket.emit('reconnected', {
                code: this.component.props.compass.editCode,
                compassId: this.component.props.compass._id,
                username: this.component.props.users.me,
                color: this.component.props.users.nameToColor[this.component.props.users.me]
            });
        }
    }

    handleUpdateNotes(notes) {
        this.component.props.noteActions.updateAll(notes);

        if (this.component.props.visualMode)
            this.component.props.workspaceActions.updateSelected(notes.length);
    }

    handleCompassDeleted() {
        this.modal.alert(PROMPTS.COMPASS_DELETED, () => {
            browserHistory.push('/');
        });
    }

    handleUserJoined(data) {
        this.component.props.chatActions.userJoined(data.joined);
        this.component.props.userActions.update(data);
    }

    handleUserLeft(data) {
        this.component.props.chatActions.userLeft(data.left);
        this.component.props.userActions.update(data);
    }

    handleUpdateMessages(msg) {
        this.component.props.chatActions.newMessage(msg);

        setTimeout(() => {
            let outer = $('#messages-container');
            let inner = $('#messages');
            // scroll to bottom of messages div
            outer.scrollTop(inner.outerHeight());
        }, 100);

        if (!this.component.props.ui.showChat)
            this.component.props.chatActions.unread();
    }

    handleMailStatus(status) {
        if (status) this.toast.success(PROMPTS.EMAIL_SENT);
        else this.toast.error(PROMPTS.EMAIL_NOT_SENT);
    }

    handleCompassReady(data) {
        this.component.setState({ data });
    }

    handleDeletedNotes(deletedIdx) {
        if (this.component.props.visualMode)
            this.component.props.workspaceActions.removeNotesIfSelected(deletedIdx);
    }

    handleStartTimer(min, sec, startTime) {
        this.component.props.workspaceActions.setTimer({ min, sec, startTime });
        this.toast.info(PROMPTS.TIMEBOX(min, sec));
    }

    handleCancelTimer() {
        this.component.props.workspaceActions.setTimer({});
        this.toast.info(PROMPTS.TIMEBOX_CANCELED);
    }
}
