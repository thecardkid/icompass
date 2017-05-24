'use strict';

import SocketIOClient from 'socket.io-client';
import { browserHistory } from 'react-router';

import Validator from 'Utils/Validator.jsx';

import { PROMPTS } from 'Lib/constants.js';

export default class Socket {
    constructor(component) {
        this.component = component;
        this.socket = new SocketIOClient();

        this.disconnect = this.disconnect.bind(this);

        // socket event emitters
        this.emitNewNote = this.emitNewNote.bind(this);
        this.emitDragNote = this.emitDragNote.bind(this);
        this.emitEditNote = this.emitEditNote.bind(this);
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
        this.handleUpdateUsers = this.handleUpdateUsers.bind(this);
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

    emitNewNote() {
        if (this.socket.disconnected) return this.alertInvalidAction();

        let text = $('#ic-form-text').val();
        if (!text) return;
        let validText = Validator.validateStickyText(text);
        let isImage;

        if (validText[0])
            isImage = confirm(PROMPTS.CONFIRM_IMAGE_LINK);
        else
            if (!validText[1]) return alert(PROMPTS.POST_IT_TOO_LONG);

        this.socket.emit('new note', {
            text: text,
            isImage: isImage,
            doodle: null,
            color: this.component.state.users.usernameToColor[this.component.state.username],
            x: 0.5,
            y: 0.5
        });
        this.component.closeForm();
    }

    emitDragNote(event) {
        this.component.setTranslation(event.target, 0, 0);
        if (this.socket.disconnected) return this.alertInvalidAction();

        let notes = this.component.props.notes;
        let i = this.component.state.dragNote;
        let x = notes[i].x + event.dx / this.component.state.vw,
            y = notes[i].y + event.dy / this.component.state.vh;
        let note = Object.assign({}, notes[i], { x, y });

        this.component.props.noteActions.drag(i, x, y);
        this.socket.emit('update note', note);
    }

    emitEditNote() {
        if (this.socket.disconnected) return this.alertInvalidAction();

        let text = $('#ic-form-text').val();
        if (!text) return;
        let validText = Validator.validateStickyText(text);
        let isImage;

        if (validText[0])
            isImage = confirm(PROMPTS.CONFIRM_IMAGE_LINK);
        else
            if (!validText[1]) return alert(PROMPTS.POST_IT_TOO_LONG);

        let note = JSON.parse(JSON.stringify(this.component.state.editNote));
        note.text = text;
        note.isImage = isImage;
        this.socket.emit('update note', note);
        this.component.closeForm();
    }

    emitNewDoodle() {
        if (this.socket.disconnected) return this.alertInvalidAction();

        this.socket.emit('new note', {
            text: null,
            doodle: document.getElementById('ic-doodle').toDataURL(),
            color: this.component.state.users.usernameToColor[this.component.state.username],
            x: 0.5,
            y: 0.5
        });
        this.component.closeForm();
    }

    emitDeleteCompass() {
        if (this.socket.disconnected) return this.alertInvalidAction();

        this.socket.emit('delete compass', this.component.state.compass._id);
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
            username: this.component.state.username,
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
            browserHistory.push('/');
        }
        this.component.setState({
            compass: data.compass,
            username: data.username,
            mode: data.mode
        });
    }

    handleDisconnect() {
        this.component.setState({showSidebar: true, disconnected: true});
    }

    handleReconnect() {
        this.socket.emit('reconnected', {
            code: this.component.state.compass.editCode,
            compassId: this.component.state.compass._id,
            username: this.component.state.username,
            color: this.component.state.users.usernameToColor[this.component.state.username]
        });
        this.component.setState({disconnected: false});
    }

    handleCompassDeleted() {
        alert(PROMPTS.COMPASS_DELETED);
        browserHistory.push('/');
    }

    handleUserJoined(data) {
        let { messages } = this.component.state;
        messages.push({
            info: true,
            text: data.joined + ' joined'
        });
        this.component.setState({users: data.users, messages: messages});
    }

    handleUserLeft(data) {
        let { messages } = this.component.state;
        messages.push({
            info: true,
            text: data.left + ' left'
        });
        this.component.setState({users: data.users, messages: messages});
    }

    handleUpdateUsers(users) {
        this.component.setState({ users });
    }

    handleUpdateMessages(newMessage) {
        let { messages } = this.component.state;
        messages.push(newMessage);

        let unread = !this.component.state.showChat;
        this.component.setState({messages, unread}, () => {
            let outer = $('#messages-container');
            let inner = $('#messages');
            // scroll to bottom of messages div
            outer.scrollTop(inner.outerHeight());
        });
    }

    handleMailStatus(status) {
        if (status) alert(PROMPTS.EMAIL_SENT);
        else alert(PROMPTS.EMAIL_NOT_SENT);
    }

    handleCompassReady(data) {
        this.component.setState({ data });
    }
}
