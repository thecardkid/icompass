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

import Sidebar from 'Components/Sidebar.jsx';
import NoteForm from 'Components/NoteForm.jsx';
import About from 'Components/About.jsx';
import Chat from 'Components/Chat.jsx';
import DoodleForm from 'Components/DoodleForm.jsx';
import Feedback from 'Components/Feedback.jsx';
import Compass from 'Components/Compass.jsx';

import Validator from 'Utils/Validator.jsx';
import Socket from 'Utils/Socket.jsx';

import { KEYCODES, COLORS, MODES, DRAGGABLE_RESTRICTIONS } from 'Lib/constants';

/* eslint react/prop-types: 0 */
class Workspace extends Component {
    constructor(props) {
        super(props);
        this.socket = new Socket(this);
        this.isEditable = this.props.route.mode === MODES.EDIT;
        this.socket.socket.on('update notes', this.props.noteActions.updateAll);

        if (this.isEditable) {
            this.validateRouteParams(this.props.params);
            this.socket.emitFindCompassEdit();
        } else {
            this.socket.emitFindCompassView();
        }

        // user events
        this.exportCompass = this.exportCompass.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.clickShowChat = this.clickShowChat.bind(this);
        this.renderCornerButtons = this.renderCornerButtons.bind(this);
        this.center = this.center.bind(this);

        this.keypressHandler = {
            78: this.props.uiActions.showNewNote,
            67: this.props.uiActions.toggleChat,
            68: this.props.uiActions.showDoodle,
            83: this.props.uiActions.toggleSidebar,
            65: this.props.uiActions.toggleAbout
        };

        this.props.uiActions.setScreenSize(window.innerWidth, window.innerHeight);
    }

    validateRouteParams(params) {
        let validCode = Validator.validateCompassCode(params.code);
        let validUsername = Validator.validateUsername(params.username);

        if (!validCode[0] || !validUsername[0]) {
            let err = 'There was a problem with your login info:\n\n';
            if (!validCode[0]) err += validCode[1] + '\n\n';
            if (!validUsername[0]) err += validUsername[1] + '\n\n';
            err += 'You will now be directed to the login page';
            alert(err);
            browserHistory.push('/');
        }
    }

    componentDidMount() {
        $(window).on('resize', this.props.uiActions.resize);
        $(window).on('keydown', this.handleKeyDown);

        // set up draggable sticky notes
        if (this.isEditable) {
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
        $(window).off('resize', this.updateWindowSize);
        $(window).off('keydown', this.handleKeyDown);
    }

    setTranslation(target, x, y) {
        // translate the element
        target.style.webkitTransform =
        target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

        // update the posiion attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }

    dragTarget(e) {
        let x = (parseFloat(e.target.getAttribute('data-x')) || 0) + e.dx;
        let y = (parseFloat(e.target.getAttribute('data-y')) || 0) + e.dy;
        this.setTranslation(e.target, x, y);
    }

    isControlKey(k) {
        return k === KEYCODES.N ||
            k === KEYCODES.D ||
            k === KEYCODES.C ||
            k === KEYCODES.A ||
            k === KEYCODES.S ||
            k === KEYCODES.D;
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
        if (this.props.ui.newNote) {
            return <NoteForm style={this.center(300,230)}
                mode={'make'}
                note={{}}
                ship={this.socket.emitNewNote}
                close={this.props.uiActions.closeForm}
                bg={this.props.users.nameToColor[this.props.users.me]}
            />;
        } else if (this.props.ui.editNote) {
            return <NoteForm style={this.center(300,230)}
                mode={'edit'}
                note={this.props.ui.editNote}
                ship={this.socket.emitEditNote}
                close={this.props.uiActions.closeForm}
                bg={this.props.users.nameToColor[this.props.users.me]}
            />;
        } else if (this.props.ui.doodleNote) {
            return <DoodleForm style={this.center(450, 345)}
                bg={this.props.users.nameToColor[this.props.users.me]}
                close={this.props.uiActions.closeForm}
                save={this.socket.emitNewDoodle}
            />;
        }
        return null;
    }

    getAbout() {
        if (this.props.ui.showAbout)
            return <About close={this.props.uiActions.toggleAbout} />;
        return null;
    }

    getFeedback() {
        if (this.props.ui.showFeedback) return <Feedback style={this.center(400,200)} close={this.props.uiActions.toggleFeedback}/>;
    }

    clickShowChat() {
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
                    onClick={this.clickShowChat}
                    style={showChatStyle}>
                    Show Chat
                </button>
            </div>
        );
    }

    render() {
        if (_.isEmpty(this.props.compass)) return <div></div>;

        if (this.props.route.mode === MODES.VIEW)
            return <Compass />;

        return (
            <div>
                {this.renderCornerButtons()}
                <Compass destroy={this.socket.emitDeleteNote} />
                <Sidebar socket={this.socket} exportCompass={this.exportCompass} />
                <Chat socket={this.socket} />
                {this.getFeedback()}
                {this.getForm()}
                {this.getAbout()}
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
        ui: state.ui
    };
}

function mapDispatchToProps(dispatch) {
    return {
        noteActions: bindActionCreators(noteActions, dispatch),
        compassActions: bindActionCreators(compassActions, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
        chatActions: bindActionCreators(chatActions, dispatch),
        uiActions: bindActionCreators(uiActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Workspace);

