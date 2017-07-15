'use strict';

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import _ from 'underscore';

import * as noteActions from 'Actions/notes';
import * as compassActions from 'Actions/compass';
import * as userActions from 'Actions/users';
import * as chatActions from 'Actions/chat';
import * as uiActions from 'Actions/ui';
import * as workspaceActions from 'Actions/workspace';

import Sidebar from 'Components/Sidebar.jsx';
import NoteForm from 'Components/NoteForm.jsx';
import About from 'Components/About.jsx';
import Chat from 'Components/Chat.jsx';
import DoodleForm from 'Components/DoodleForm.jsx';
import Feedback from 'Components/Feedback.jsx';
import Compass from 'Components/Compass.jsx';
import VisualModeToolbar from 'Components/VisualModeToolbar.jsx';

import Validator from 'Utils/Validator.jsx';
import Socket from 'Utils/Socket.jsx';

import { KEYCODES, EDITING_MODE, COLORS, DRAGGABLE_RESTRICTIONS } from 'Lib/constants';

/* eslint react/prop-types: 0 */
class Workspace extends Component {
    constructor(props) {
        super(props);
        this.socket = new Socket(this);
        this.socket.socket.on('update notes', this.props.noteActions.updateAll);

        if (this.props.route.viewOnly) {
            this.socket.emitFindCompassView();
        } else {
            this.validateRouteParams(this.props.params);
            this.socket.emitFindCompassEdit();
        }

        // user events
        this.exportCompass = this.exportCompass.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.showChat = this.showChat.bind(this);
        this.renderCornerButtons = this.renderCornerButtons.bind(this);
        this.renderModesToolbar = this.renderModesToolbar.bind(this);
        this.getVisualModeToolbar = this.getVisualModeToolbar.bind(this);
        this.isVisualMode = this.isVisualMode.bind(this);
        this.center = this.center.bind(this);

        this.keypressHandler = {
            78: this.props.uiActions.showNewNote,
            67: this.props.uiActions.toggleChat,
            68: this.props.uiActions.showDoodle,
            83: this.props.uiActions.toggleSidebar,
            80: this.props.uiActions.toggleAbout,
        };

        this.props.uiActions.setScreenSize(window.innerWidth, window.innerHeight);
    }

    validateRouteParams(params) {
        let validCode = Validator.validateCompassCode(params.code);
        let validUsername = Validator.validateUsername(params.username);

        if (!validCode[0] || !validUsername[0]) {
            let err = 'There was a problem with your login info:\n\n';
            if (!validCode[0]) err += validCode[1];
            if (!validUsername[0]) err += validUsername[1];
            err += '\n\nYou will now be directed to the login page';
            alert(err);
            browserHistory.push('/');
        }
    }

    componentDidMount() {
        $(window).on('resize', this.props.uiActions.resize);
        $(window).on('keydown', this.handleKeyDown);

        // set up draggable sticky notes
        if (!this.props.route.viewOnly) {
            interact('.draggable').draggable({
                restrict: DRAGGABLE_RESTRICTIONS,
                autoScroll: true,
                onmove: this.dragTarget.bind(this),
                onend: this.socket.emitDragNote
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
        $(window).off('resize', this.updateWindowSize);
        $(window).off('keydown', this.handleKeyDown);
    }

    setTranslation(target, x, y) {
        target.style.webkitTransform =
            target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }

    dragTarget(e) {
        if (!this.isVisualMode()) {
            let x = (parseFloat(e.target.getAttribute('data-x')) || 0) + e.dx;
            let y = (parseFloat(e.target.getAttribute('data-y')) || 0) + e.dy;
            this.setTranslation(e.target, x, y);
        }
    }

    isControlKey(k) {
        return k in this.keypressHandler;
    }

    isModifierKey(e) {
        return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
    }

    handleKeyDown(e) {
        if (this.props.ui.newNote || this.props.ui.editNote || this.props.ui.doodleNote) {
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
                let doc = new jsPDF('l', 'cm', 'a4');
                doc.addImage(imgData, 'PNG', 0, 0, 30, 18);
                doc.save('compass.pdf');
            });
        }, 500);
    }

    getForm() {
        let commonAttrs = {
            bg: this.props.users.nameToColor[this.props.users.me],
            user: this.props.users.me,
            close: this.props.uiActions.closeForm
        };

        if (this.props.ui.newNote) {
            return <NoteForm style={this.center(300,230)}
                mode={'make'}
                note={{}}
                position={this.props.ui.newNote}
                ship={this.socket.emitNewNote}
                {...commonAttrs}
            />;
        } else if (this.props.ui.editNote) {
            return <NoteForm style={this.center(300,230)}
                mode={'edit'}
                note={this.props.ui.editNote}
                ship={this.socket.emitEditNote}
                {...commonAttrs}
            />;
        } else if (this.props.ui.doodleNote) {
            return <DoodleForm style={this.center(450, 345)}
                save={this.socket.emitNewDoodle}
                {...commonAttrs}
            />;
        }
        return null;
    }

    getAbout() {
        if (this.props.ui.showAbout)
            return <About close={this.props.uiActions.toggleAbout} />;
    }

    getFeedback() {
        if (this.props.ui.showFeedback)
            return <Feedback style={this.center(400,250)} close={this.props.uiActions.toggleFeedback}/>;
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

    renderModesToolbar() {
        let ui = this.props.uiActions,
            m = this.props.ui.editingMode;

        return (
            <div id="ic-modes">
                <button id="ic-mode-visual"
                    className={m === EDITING_MODE.VISUAL ? 'selected' : 'unselected'}
                    onClick={() => ui.visualMode(this.props.notes)}>
                    Visual
                </button>
                <button id="ic-mode-compact"
                    className={m === EDITING_MODE.COMPACT ? 'selected' : 'unselected'}
                    onClick={ui.compactMode}>
                    Compact
                </button>
                <button id="ic-mode-normal"
                    className={m === EDITING_MODE.NORMAL ? 'selected' : 'unselected'}
                    onClick={ui.normalMode}>
                    Normal
                </button>
            </div>
        );
    }

    renderCornerButtons() {
        let actions = this.props.uiActions;
        let showChatStyle = {
            background: this.props.chat.unread ? COLORS.RED : COLORS.DARK
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

    getVisualModeToolbar() {
        if (this.isVisualMode())
            return <VisualModeToolbar socket={this.socket}/>;
    }

    isVisualMode() {
        return this.props.ui.editingMode === EDITING_MODE.VISUAL;
    }

    chooseSandboxOrOriginalNotes(w, notes) {
        return _.map(notes, (n, i) => {
            if (w.selected[i]) {
                if (w.color) return Object.assign({}, w.sandbox[i], { color: w.color });
                else return w.sandbox[i];
            } else return n;
        });
    }

    render() {
        // not ready
        if (_.isEmpty(this.props.compass)) return <div />;

        let notes = this.props.notes;
        if (this.props.route.viewOnly) return <Compass notes={notes}/>;

        // Selected notes rendered according to sandbox
        if (this.isVisualMode())
            notes = this.chooseSandboxOrOriginalNotes(this.props.workspace, this.props.notes);

        return (
            <div>
                {this.renderCornerButtons()}
                {this.renderModesToolbar()}
                <Compass destroy={this.socket.emitDeleteNote} notes={notes}/>
                <Sidebar connected={this.socket.socket.connected} destroy={this.socket.emitDeleteCompass} exportCompass={this.exportCompass} />
                <Chat socket={this.socket} />
                {this.getFeedback()}
                {this.getForm()}
                {this.getAbout()}
                {this.getVisualModeToolbar()}
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
        workspace: state.workspace
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

