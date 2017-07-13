'use strict';

import SocketIOClient from 'socket.io-client';
import { browserHistory } from 'react-router';

import { PROMPTS } from 'Lib/constants';

export default class Socket {
    constructor(component) {
        this.component = component;
        this.socket = new SocketIOClient();

        this.disconnect = this.disconnect.bind(this);

        // socket event emitters
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

        // socket event handlers
        this.socket.on('user joined', this.handleUserJoined);
        this.socket.on('user left', this.handleUserLeft);
        this.socket.on('disconnect', this.handleDisconnect);
        this.socket.on('reconnect', this.handleReconnect);
        this.socket.on('new message', this.handleUpdateMessages);
        this.socket.on('compass deleted', this.handleCompassDeleted);
        this.socket.on('compass found', this.handleCompassFound);
        this.socket.on('mail status', this.handleMailStatus);
        this.socket.on('compass ready', this.handleCompassReady);
    }

    disconnect() {
        return this.socket.disconnect();
    }

    alertInvalidAction() {
        alert(PROMPTS.NOT_CONNECTED);
    }

    alertVisualMode() {
        alert(PROMPTS.VISUAL_MODE_NO_CHANGE);
    }

    alertVisualModeNoCreate() {
        alert(PROMPTS.VISUAL_MODE_NO_CREATE);
    }

    emitNewNote(note) {
        if (this.socket.disconnected) return this.alertInvalidAction();
        if (this.component.isVisualMode()) return this.alertVisualModeNoCreate();
        this.socket.emit('new note', note);
        this.component.props.uiActions.closeForm();
    }

    emitEditNote(edited) {
        if (this.socket.disconnected) return this.alertInvalidAction();
        if (this.component.isVisualMode()) return this.alertVisualMode();
        let before = Object.assign({}, this.component.props.ui.editNote);
        let after = Object.assign({}, before, edited);
        this.socket.emit('update note', after);
        this.component.props.uiActions.closeForm();
    }

    emitBulkEditNotes(noteIds, transformation) {
        if (this.socket.disconnected) return this.alertInvalidAction();
        this.socket.emit('bulk update notes', noteIds, transformation);
    }

    emitBulkDeleteNotes(noteIds) {
        if (this.socket.disconnected) return this.alertInvalidAction();
        this.socket.emit('bulk delete notes', noteIds);
    }

    emitDragNote(event) {
        if (this.component.isVisualMode()) return this.alertVisualMode();

        this.component.setTranslation(event.target, 0, 0);
        if (this.socket.disconnected) return this.alertInvalidAction();

        let notes = this.component.props.notes;
        let i = Number(event.target.id.substring(4));
        let x = notes[i].x + event.dx / this.component.props.ui.vw,
            y = notes[i].y + event.dy / this.component.props.ui.vh;
        let note = Object.assign({}, notes[i], { x, y });

        this.component.props.noteActions.drag(i, x, y);
        this.socket.emit('update note', note);
    }

    emitNewDoodle(user) {
        if (this.socket.disconnected) return this.alertInvalidAction();

        this.socket.emit('new note', {
            text: null,
            doodle: document.getElementById('ic-doodle').toDataURL(),
            color: this.component.props.users.nameToColor[this.component.props.users.me],
            x: 0.5,
            y: 0.5,
            user
        });
        this.component.props.uiActions.closeForm();
    }

    emitDeleteCompass() {
        if (this.socket.disconnected) return this.alertInvalidAction();
        this.socket.emit('delete compass', this.component.props.compass._id);
    }

    emitDeleteNote(noteId) {
        if (this.socket.disconnected) return this.alertInvalidAction();

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

    emitSendMail(code, center, username, receiverEmail) {
        if (this.socket.disconnected) return this.alertInvalidAction();
        this.socket.emit('send mail', {
            editCode: code,
            center: center,
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
            alert(PROMPTS.COMPASS_NOT_FOUND);
            return browserHistory.push('/');
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

    handleCompassDeleted() {
        alert(PROMPTS.COMPASS_DELETED);
        browserHistory.push('/');
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
        if (status) alert(PROMPTS.EMAIL_SENT);
        else alert(PROMPTS.EMAIL_NOT_SENT);
    }

    handleCompassReady(data) {
        this.component.setState({ data });
    }
}
