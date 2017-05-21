'use strict';

import { browserHistory } from 'react-router';
import { PROMPTS, KEYCODES } from '../utils/constants.js';

import Validator from './Validator.jsx';

export default {
    emitNewNote() {
        if (this.state.disconnected) return this.alertInvalidAction();

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
            color: this.state.users.usernameToColor[this.state.username],
            x: 0.5,
            y: 0.5
        });
        this.closeForm();
    },

    emitDragNote(event) {
        if (this.state.disconnected) return this.alertInvalidAction();

        let compass = this.state.compass;
        let i = this.state.dragNote;
        let note = JSON.parse(JSON.stringify(compass.notes[i]));
        note.x += event.dx / this.state.vw;
        note.y += event.dy / this.state.vh;

        this.setTranslation(event.target, 0, 0);

        compass.notes[i] = note;
        this.setState({ compass }); // positive update
        this.socket.emit('update note', note);
    },

    emitEditNote() {
        if (this.state.disconnected) return this.alertInvalidAction();

        let text = $('#ic-form-text').val();
        if (!text) return;
        let validText = Validator.validateStickyText(text);
        let isImage;

        if (validText[0])
            isImage = confirm(PROMPTS.CONFIRM_IMAGE_LINK);
        else
            if (!validText[1]) return alert(PROMPTS.POST_IT_TOO_LONG);

        let note = JSON.parse(JSON.stringify(this.state.editNote));
        note.text = text;
        note.isImage = isImage;
        this.socket.emit('update note', note);
        this.closeForm();
    },

    emitNewDoodle() {
        if (this.state.disconnected) return this.alertInvalidAction();

        this.socket.emit('new note', {
            text: null,
            doodle: document.getElementById('ic-doodle').toDataURL(),
            color: this.state.users.usernameToColor[this.state.username],
            x: 0.5,
            y: 0.5
        });
        this.closeForm();
    },

    emitDeleteCompass() {
        this.socket.emit('delete compass', this.state.compass._id);
    },

    emitDeleteNote(noteId) {
        this.socket.emit('delete note', noteId);
    },

    handleDisconnect() {
        this.setState({showSidebar: true, disconnected: true});
    },

    handleReconnect() {
        this.socket.emit('reconnected', {
            code: this.state.compass.editCode,
            compassId: this.state.compass._id,
            username: this.state.username,
            color: this.state.users.usernameToColor[this.state.username]
        });
        this.setState({disconnected: false});
    },

    handleCompassDeleted() {
        alert(PROMPTS.COMPASS_DELETED);
        browserHistory.push('/');
    },

    updateNotes(newNotes) {
        let { compass } = this.state;
        compass.notes = newNotes;
        this.setState({ compass });
    },

    handleUserJoined(data) {
        let { messages } = this.state;
        messages.push({
            info: true,
            text: data.joined + ' joined'
        });
        this.setState({users: data.users, messages: messages});
    },

    handleUserLeft(data) {
        let { messages } = this.state;
        messages.push({
            info: true,
            text: data.left + ' left'
        });
        this.setState({users: data.users, messages: messages});
    },

    updateUsers(users) {
        this.setState({ users });
    },

    setUsername(username) {
        this.setState({ username });
    },

    updateMessages(newMessage) {
        let { messages } = this.state;
        messages.push(newMessage);

        let unread = !this.state.showChat;
        this.setState({messages, unread}, () => {
            let outer = $('#messages-container');
            let inner = $('#messages');
            // scroll to bottom of messages div
            outer.scrollTop(inner.outerHeight());
        });
    },

    isControlKey(k) {
        return k === KEYCODES.N ||
            k === KEYCODES.D ||
            k === KEYCODES.C ||
            k === KEYCODES.W ||
            k === KEYCODES.S ||
            k === KEYCODES.D;
    },

    isModifierKey(k) {
        return k === KEYCODES.SHIFT ||
            k === KEYCODES.ALT ||
            k === KEYCODES.CTRL ||
            k === KEYCODES.CMD;
    }
};
