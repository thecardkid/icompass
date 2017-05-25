'use strict';

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import _ from 'underscore';

import * as noteActions from '../actions/notes';
import * as compassActions from '../actions/compass';
import * as userActions from '../actions/users';
import * as chatActions from '../actions/chat';
import * as uiActions from '../actions/ui';

import Sidebar from 'Components/Sidebar.jsx';
import NoteForm from 'Components/NoteForm.jsx';
import About from 'Components/About.jsx';
import Chat from 'Components/Chat.jsx';
import DoodleForm from 'Components/DoodleForm.jsx';
import Feedback from 'Components/Feedback.jsx';

import Validator from 'Utils/Validator.jsx';
import Socket from 'Utils/Socket.jsx';
import Shared from 'Utils/Shared.jsx';

import { KEYCODES, COLORS, MODES } from 'Lib/constants.js';

/* eslint react/prop-types: 0 */
class CompassEdit extends Component {

    constructor(props, context) {
        super(props, context);
        this.socket = new Socket(this);
        this.socket.socket.on('update notes', this.props.noteActions.updateAll);

        if (this.props.tutorial === true) {
            this.props.compassActions.set(this.props.tutorialCompass, MODES.EDIT);
            this.props.userActions.update({users: this.props.tutorialUsers});
            this.props.userActions.me(this.props.tutorialUsername);
        } else if (_.isEmpty(this.props.compass)) {
            this.validateParams(this.props);
            this.socket.emitFindCompassEdit();
        }

        // Shared methods
        this.renderNote = Shared.renderNote.bind(this);
        this.center = Shared.center.bind(this);
        this.getCompassStructure = Shared.getCompassStructure.bind(this);
        this.renderQuadrant = Shared.renderQuadrant;

        // user events
        this.exportCompass = this.exportCompass.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.clickShowChat = this.clickShowChat.bind(this);

        this.keypressHandler = {
            78: this.props.uiActions.showNewNote,
            67: this.props.uiActions.toggleChat,
            68: this.props.uiActions.showDoodle,
            83: this.props.uiActions.toggleSidebar,
            65: this.props.uiActions.toggleAbout
        };

        this.props.uiActions.setScreenSize(window.innerWidth, window.innerHeight);
    }

    validateParams(props) {
        let validCode = Validator.validateCompassCode(props.params.code);
        let validUsername = Validator.validateUsername(props.params.username);

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
        interact('.draggable').draggable({
            restrict: {
                restriction: 'parent',
                endOnly: true,
                elementRect: {top:0, left:0, bottom:1, right:1}
            },
            autoScroll: true,
            onmove: this.dragTarget.bind(this),
            onend: this.socket.emitDragNote
        });
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
        this.setState({showChat: false, showSidebar: false}, () => {
            window.html2canvas(document.body).then((canvas) => {
                let imgData = canvas.toDataURL('image/png');
                let doc = new jsPDF('l', 'cm', 'a4');
                doc.addImage(imgData, 'PNG', 0, 0, 30, 18);
                doc.save('compass.pdf');
            });
        });
    }

    getForm() {
        if (this.props.ui.newNote) {
            return <NoteForm
                style={this.center(300,230)}
                title={'Make a new post-it'}
                make={this.socket.emitNewNote}
                close={this.props.uiActions.closeForm}
            />;
        } else if (this.props.ui.editNote) {
            return <NoteForm
                style={this.center(300,230)}
                title={'Edit this post-it'}
                text={this.props.ui.editNote.text}
                make={this.socket.emitEditNote}
                close={this.props.uiActions.closeForm}
            />;
        } else if (this.props.ui.doodleNote) {
            return <DoodleForm
                style={this.center(450, 345)}
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

    getStickies() {
        return _.map(this.props.notes, this.renderNote);
    }

    getSidebar() {
        return (
            <Sidebar viewCode={this.props.compass.viewCode}
                editCode={this.props.compass.editCode}
                users={this.props.users.nameToColor}
                you={this.props.users.me}
                show={this.props.ui.showSidebar}
                disconnected={this.socket.socket.disconnected}
                toggleSidebar={this.props.uiActions.toggleSidebar}
                toggleFeedback={this.props.uiActions.toggleFeedback}
                destroy={this.socket.emitDeleteCompass}
                exportCompass={this.exportCompass}
            />
        );
    }

    getChat() {
        return (
            <Chat messages={this.props.chat.messages}
                colorMap={this.props.users.nameToColor}
                username={this.props.users.me}
                socket={this.socket}
                show={this.props.ui.showChat}
                toggleChat={this.props.uiActions.toggleChat}
                emitMessage={this.socket.emitMessage}
            />
        );
    }

    getFeedback() {
        if (this.props.ui.showFeedback) return <Feedback style={this.center(400,200)} close={this.props.uiActions.toggleFeedback}/>;
    }

    clickShowChat() {
        this.props.chatActions.read();
        this.props.uiActions.toggleChat();
    }

    render() {
        if (_.isEmpty(this.props.compass))
            return <div id="compass"></div>;

        return (
            <div id="compass">
                {this.getFeedback()}
                {this.getStickies()}
                {this.getForm()}
                {this.getAbout()}
                {this.getCompassStructure(this.props.compass.center)}
                <button className="ic-corner-btn" id="ic-compact" onClick={this.props.uiActions.toggleCompactMode}>Compact</button>
                <button className="ic-corner-btn" id="ic-show-sidebar" onClick={this.props.uiActions.toggleSidebar}>Show Sidebar</button>
                {this.getSidebar()}
                <button className="ic-corner-btn" id="ic-show-chat" onClick={this.clickShowChat} style={{background: this.props.chat.unread ? COLORS.RED : COLORS.DARK}}>Show Chat</button>
                {this.getChat()}
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

export default connect(mapStateToProps, mapDispatchToProps)(CompassEdit);

