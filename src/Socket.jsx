'use strict';

import SocketIOClient from 'socket.io-client';
import { browserHistory } from 'react-router';
import { PROMPTS, KEYCODES } from '../utils/constants.js';

import Validator from './Validator.jsx';

export default class Socket {
    constructor(component) {
        this.component = component;
        this.socket = new SocketIOClient();

        // socket event emitters
        this.emitNewNote = this.emitNewNote.bind(this);
        this.emitDragNote = this.emitDragNote.bind(this);
        this.emitEditNote = this.emitEditNote.bind(this);
        this.emitNewDoodle = this.emitNewDoodle.bind(this);
        this.emitDeleteCompass = this.emitDeleteCompass.bind(this);
        this.emitDeleteNote = this.emitDeleteNote.bind(this);
        this.emitMessage = this.emitMessage.bind(this);
        this.emitFindCompassEdit = this.emitFindCompassEdit.bind(this);

        this.handleDisconnect = this.handleDisconnect.bind(this);
        this.handleReconnect = this.handleReconnect.bind(this);
        this.handleCompassDeleted = this.handleCompassDeleted.bind(this);
        this.handleUpdateNotes = this.handleUpdateNotes.bind(this);
        this.handleUserJoined = this.handleUserJoined.bind(this);
        this.handleUserLeft = this.handleUserLeft.bind(this);
        this.handleUpdateUsers = this.handleUpdateUsers.bind(this);
        this.handleUpdateMessages = this.handleUpdateMessages.bind(this);
        this.handleCompassFound = this.handleCompassFound.bind(this);

        // socket event handlers
        this.socket.on('update notes', this.handleUpdateNotes);
        this.socket.on('user joined', this.handleUserJoined);
        this.socket.on('user left', this.handleUserLeft);
        this.socket.on('disconnect', this.handleDisconnect);
        this.socket.on('reconnect', this.handleReconnect);
        this.socket.on('new message', this.handleUpdateMessages);
        this.socket.on('compass deleted', this.handleCompassDeleted);
        this.socket.on('compass found', this.handleCompassFound);
    }

    emitNewNote() {
        if (this.component.state.disconnected) return this.component.alertInvalidAction();

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
        if (this.component.state.disconnected) return this.component.alertInvalidAction();

        let compass = this.component.state.compass;
        let i = this.component.state.dragNote;
        let note = JSON.parse(JSON.stringify(compass.notes[i]));
        note.x += event.dx / this.component.state.vw;
        note.y += event.dy / this.component.state.vh;

        this.component.setTranslation(event.target, 0, 0);

        compass.notes[i] = note;
        this.component.setState({ compass }); // positive update
        this.socket.emit('update note', note);
    }

    emitEditNote() {
        if (this.component.state.disconnected) return this.component.alertInvalidAction();

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
        if (this.component.state.disconnected) return this.component.alertInvalidAction();

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
        this.socket.emit('delete compass', this.component.state.compass._id);
    }

    emitDeleteNote(noteId) {
        this.socket.emit('delete note', noteId);
    }

    emitMessage() {
        let text = $('#message-text').val();
        if (!text) return;

        this.socket.emit('message', {
            username: this.component.state.username,
            text: text
        });
    }

    emitFindCompassEdit() {
        this.socket.emit('find compass edit', {
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
            username: data.username
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

    handleUpdateNotes(newNotes) {
        let { compass } = this.component.state;
        compass.notes = newNotes;
        this.component.setState({ compass });
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
};
