'use strict';

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import Tappable from 'react-tappable/lib/Tappable';
import _ from 'underscore';

import * as noteActions from 'Actions/notes';
import * as compassActions from 'Actions/compass';
import * as userActions from 'Actions/users';
import * as chatActions from 'Actions/chat';
import * as uiActions from 'Actions/ui';
import * as workspaceActions from 'Actions/workspace';

import Sidebar from 'Components/Sidebar.jsx';
import About from 'Components/About.jsx';
import Chat from 'Components/Chat.jsx';
import Feedback from 'Components/Feedback.jsx';
import Compass from 'Components/Compass.jsx';
import VisualModeToolbar from 'Components/VisualModeToolbar.jsx';
import ModesToolbar from 'Components/ModesToolbar.jsx';
import FormChooser from 'Components/FormChooser.jsx';

import Modal from 'Utils/Modal.jsx';
import Socket from 'Utils/Socket.jsx';
import Toast from 'Utils/Toast.jsx';
import Validator from 'Utils/Validator.jsx';

import { KEYCODES, PROMPTS, EDITING_MODE, COLORS, DRAGGABLE_RESTRICTIONS } from 'Lib/constants';

/* eslint react/prop-types: 0 */
class Workspace extends Component {
    constructor(props) {
        super(props);
        this.socket = new Socket(this);
        this.toast = new Toast();
        this.modal = new Modal();

        if (this.props.route.viewOnly) {
            this.socket.emitFindCompassView();
        } else {
            if (this.validateRouteParams(this.props.params))
                this.socket.emitFindCompassEdit();
        }

        // user events
        this.exportCompass = this.exportCompass.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.showChat = this.showChat.bind(this);
        this.renderCornerButtons = this.renderCornerButtons.bind(this);
        this.center = this.center.bind(this);
        this.submitDraft = this.submitDraft.bind(this);

        this.notes = null;

        this.keypressHandler = {
            78: this.props.uiActions.showNewNote,
            67: this.props.uiActions.toggleChat,
            68: this.props.uiActions.showDoodle,
            83: this.props.uiActions.toggleSidebar,
            80: this.props.uiActions.toggleAbout,
        };

        this.props.uiActions.setScreenSize(window.innerWidth, window.innerHeight);
    }

    componentWillUpdate(nextProps) {
        this.notes = this.chooseDisplayedNotes(nextProps.workspace, nextProps.notes);
    }

    validateRouteParams(params) {
        let validCode = Validator.validateCompassCode(params.code);
        let validUsername = Validator.validateUsername(params.username);

        if (!validCode[0] || !validUsername[0]) {
            let err = '<h3>There was a problem with your login info</h3>';
            if (!validCode[0]) err += '<p>' + validCode[1] + '</p>';
            if (!validUsername[0]) err += '<p>' + validUsername[1] + '</p>';
            err += '<p>You will now be directed to the login page</p>';
            this.modal.alert(err, () => {
                browserHistory.push('/');
            });
            return false;
        }

        return true;
    }

    componentDidMount() {
        $(window).on('resize', this.props.uiActions.resize);
        $(window).on('keydown', this.handleKeyDown);

        // set up draggable sticky notes
        if (!this.props.route.viewOnly) {
            // eslint-disable-next-line no-undef
            interact('.draggable').draggable({
                restrict: DRAGGABLE_RESTRICTIONS,
                autoScroll: true,
                onmove: this.dragTarget.bind(this),
                onend: this.dragEnd.bind(this)
            });
        }
    }

    componentWillUnmount() {
        this.socket.disconnect();
        this.props.compassActions.reset();
        this.props.noteActions.reset();
        this.props.chatActions.reset();
        this.props.uiActions.reset();
        this.props.userActions.reset();
        $(window).off('resize', this.props.uiActions.resize);
        $(window).off('keydown', this.handleKeyDown);
    }

    setTranslation(target, x, y) {
        target.style.webkitTransform =
            target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }

    dragTarget(e) {
        if (!this.props.visualMode) {
            let x = (parseFloat(e.target.getAttribute('data-x')) || 0) + e.dx;
            let y = (parseFloat(e.target.getAttribute('data-y')) || 0) + e.dy;
            this.setTranslation(e.target, x, y);
        }
    }

    dragEnd(e) {
        if (this.props.visualMode) return this.toast.warn(PROMPTS.VISUAL_MODE_NO_CHANGE);

        this.setTranslation(e.target, 0, 0);

        let i = Number(e.target.id.substring(4));
        let x = this.notes[i].x + e.dx / this.props.ui.vw,
            y = this.notes[i].y + e.dy / this.props.ui.vh;
        let note = Object.assign({}, this.notes[i], { x, y });

        if (this.props.draftMode && !note.draft) return this.toast.warn(PROMPTS.DRAFT_MODE_NO_CHANGE);
        if (note.draft) this.props.workspaceActions.dragDraft(i, x, y);
        else if (this.socket.emitDragNote(note)) {
            this.props.noteActions.drag(i, x, y);
        }
    }

    isControlKey(k) {
        return k in this.keypressHandler;
    }

    isModifierKey(e) {
        return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
    }

    handleKeyDown(e) {
        if (this.props.ui.newNote || this.props.ui.doodleNote ||
            typeof this.props.ui.editNote === 'number') {
            if (e.which === KEYCODES.ESC) this.props.uiActions.closeForm();
            return;
        }

        if (document.activeElement.id === 'message-text') return;

        if (this.isControlKey(e.which) && !this.isModifierKey(e)) {
            e.preventDefault();
            this.keypressHandler[e.which]();
        }
    }

    exportCompass() {
        this.props.uiActions.setSidebarVisible(false);
        this.props.uiActions.setChatVisible(false);

        setTimeout(() => {
            window.html2canvas(document.body).then((canvas) => {
                let imgData = canvas.toDataURL('image/png');
                // eslint-disable-next-line no-undef
                let doc = new jsPDF('l', 'cm', 'a4');
                doc.addImage(imgData, 'PNG', 0, 0, 30, 18);
                doc.save('compass.pdf');
            });
        }, 500);
    }

    showChat() {
        this.props.chatActions.read();
        this.props.uiActions.toggleChat();
    }

    center(w, h) {
        return {
            top: Math.max((this.props.ui.vh - h) / 2, 0),
            left: Math.max((this.props.ui.vw - w) / 2, 0)
        };
    }

    renderCornerButtons() {
        let actions = this.props.uiActions;
        let showChatStyle = {
            background: this.props.chat.unread ? COLORS.RED : COLORS.LIGHT,
            color: this.props.chat.unread ? COLORS.LIGHT : COLORS.DARK
        };

        return (
            <div>
                <button className="ic-corner-btn"
                    id="ic-show-sidebar"
                    onClick={actions.toggleSidebar}>
                    Show Sidebar
                </button>
                <button className="ic-corner-btn"
                    id="ic-show-chat"
                    onClick={this.showChat}
                    style={showChatStyle}>
                    Show Chat
                </button>
                <button className="ic-corner-btn"
                    id="ic-show-doodle"
                    onClick={actions.showDoodle}>
                    Doodle
                </button>
            </div>
        );
    }

    submitDraft(note, idx) {
        this.props.workspaceActions.undraft(idx);

        delete note.draft;
        note.color = this.props.users.nameToColor[this.props.users.me];
        this.socket.emitNewNote(note);
    }

    chooseDisplayedNotes(w, notes) {
        if (this.props.visualMode) {
            return _.map(notes, (note, i) => {
                let copy = Object.assign({}, note);
                copy.style = Object.assign({}, note.style);
                if (w.selected[i]) {
                    if (!copy.doodle) {
                        if (w.bold !== null) copy.style.bold = w.bold;
                        if (w.italic !== null) copy.style.italic = w.italic;
                        if (w.underline !== null) copy.style.underline = w.underline;
                    }
                    if (w.color !== null) copy.color = w.color;
                }

                return copy;
            });
        } else if (this.props.draftMode) {
            return w.drafts.concat(notes);
        } else {
            return notes;
        }
    }

    render() {
        // not ready
        if (_.isEmpty(this.props.compass)) return <div />;

        if (this.props.route.viewOnly) return <Compass notes={this.notes}/>;

        let ui = this.props.ui;
        let formAttrs = {
            bg: this.props.draftMode ? 'grey' : this.props.users.nameToColor[this.props.users.me],
            user: this.props.users.me,
            close: this.props.uiActions.closeForm
        };

        return (
            <div>
                <Tappable onTap={this.toast.clear}>
                    <div id="ic-toast" onClick={this.toast.clear} />
                </Tappable>
                {this.renderCornerButtons()}
                <Compass destroy={this.socket.emitDeleteNote}
                         notes={this.notes}
                         submitDraft={this.submitDraft}/>
                <Sidebar connected={this.socket.socket.connected}
                         destroy={this.socket.emitDeleteCompass}
                         stop={this.socket.emitCancelTimer}
                         exportCompass={this.exportCompass} />
                <ModesToolbar />
                <Chat socket={this.socket} />
                <Feedback show={ui.showFeedback} style={this.center(400, 250)} close={this.props.uiActions.toggleFeedback} />
                <About show={ui.showAbout} close={this.props.uiActions.toggleAbout} />;
                <VisualModeToolbar show={this.props.visualMode} socket={this.socket} />;
                <FormChooser socket={this.socket}
                             center={this.center}
                             notes={this.notes}
                             commonAttrs={formAttrs} />
            </div>
        );
    }
}
/* eslint react/prop-types: 0 */

function mapStateToProps(state) {
    return {
        notes: state.notes,
        compass: state.compass,
        users: state.users,
        chat: state.chat,
        ui: state.ui,
        workspace: state.workspace,
        visualMode: state.ui.editingMode === EDITING_MODE.VISUAL || false,
        draftMode: state.ui.editingMode === EDITING_MODE.DRAFT || false,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        noteActions: bindActionCreators(noteActions, dispatch),
        compassActions: bindActionCreators(compassActions, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
        chatActions: bindActionCreators(chatActions, dispatch),
        uiActions: bindActionCreators(uiActions, dispatch),
        workspaceActions: bindActionCreators(workspaceActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Workspace);

