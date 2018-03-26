import { browserHistory } from 'react-router';
import SocketIOClient from 'socket.io-client';

import Modal from '../utils/Modal';
import Toast from '../utils/Toast';

import { PROMPTS } from '../../lib/constants';

export default class Socket {
    constructor(component) {
        this.component = component;
        this.socket = new SocketIOClient();
        this.toast = new Toast();
        this.modal = new Modal();

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
        this.socket.on('center set', this.handleCenterSet);
    }

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
        if (this.component.props.visualMode) return this.alertVisualModeNoCreate();
        this.socket.emit('new note', note);
    };

    emitEditNote = (edited) => {
        if (this.socket.disconnected) return this.alertInvalidAction();
        if (this.component.props.visualMode) return this.alertVisualMode();
        let original = this.component.props.notes[this.component.props.ui.editNote];
        let before = Object.assign({}, original);
        let after = Object.assign({}, before, edited);
        this.socket.emit('update note', after);
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

    emitNewDoodle = (user) => {
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
    };

    emitDeleteCompass = () => {
        if (this.socket.disconnected) return this.alertInvalidAction();
        this.socket.emit('delete compass', this.component.props.compass._id);
    };

    emitDeleteNote = (noteId) => {
        if (this.socket.disconnected) return this.alertInvalidAction();
        if (this.component.props.visualMode) return this.alertVisualMode();

        this.socket.emit('delete note', noteId);
    };

    emitMessage = () => {
        if (this.socket.disconnected) return this.alertInvalidAction();

        let text = $('#message-text').val();
        if (!text) return;

        this.socket.emit('message', {
            username: this.component.props.users.me,
            text: text
        });
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
            email: receiverEmail
        });
    };

    emitFindCompassEdit = () => {
        this.socket.emit('find compass edit', {
            code: this.component.props.params.code,
            username: this.component.props.params.username
        });
    };

    emitFindCompassView = () => {
        this.socket.emit('find compass view', {
            code: this.component.props.params.code,
            username: this.component.props.params.username
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

    emitSetCenter =  (id, center) => {
        this.socket.emit('set center', { id, center });
    };

    handleDisconnect = () => {
        this.component.props.uiActions.setSidebarVisible(true);
    };

    handleReconnect = () => {
        if (this.component.props.compass) {
            this.socket.emit('reconnected', {
                code: this.component.props.compass.editCode,
                compassId: this.component.props.compass._id,
                username: this.component.props.users.me,
                color: this.component.props.users.nameToColor[this.component.props.users.me]
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
