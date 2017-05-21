'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import _ from 'underscore';

import Sidebar from './Sidebar.jsx';
import NoteForm from './NoteForm.jsx';
import Explanation from './Explanation.jsx';
import Shared from './Shared.jsx';
import Chat from './Chat.jsx';
import DoodleForm from './DoodleForm.jsx';

import Validator from './Validator.jsx';
import Socket from './Socket.jsx';

import { PROMPTS, KEYCODES, COLORS } from '../utils/constants.js';

let modifier = false; // to differentiate between 'c' and 'ctrl-c'
let drag = false;

export default class CompassEdit extends Component {

    constructor(props, context) {
        super(props, context);
        this.socket = new Socket(this);

        if (!this.props.compass) {
            this.validateParams(this.props);
            this.browserHistory = browserHistory;
            this.socket.emitFindCompassEdit();
        }

        this.state = {
            vw: window.innerWidth,
            vh: window.innerHeight,
            compass: this.props.compass,
            username: this.props.username,
            newNote: false,
            editNote: false,
            dragNote: false,
            doodleNote: false,
            users: this.props.users || {},
            showSidebar: true,
            showChat: true,
            showExplanation: false,
            showHelp: false,
            disconnected: false,
            unread: false,
            messages: [{
                info: true,
                text: 'These messages will be cleared when you log out'
            }]
        };

        // Shared methods
        this.renderNote = Shared.renderNote.bind(this);
        this.center = Shared.center.bind(this);
        this.getCompassStructure = Shared.getCompassStructure.bind(this);

        // user events
        this.showEditForm = this.showEditForm.bind(this);
        this.showDoodleForm = this.showDoodleForm.bind(this);
        this.closeForm = this.closeForm.bind(this);
        this.showNewNote = this.showNewNote.bind(this);
        this.toggleSidebar = this.toggleSidebar.bind(this);
        this.toggleExplain = this.toggleExplain.bind(this);
        this.toggleHelp = this.toggleHelp.bind(this);
        this.toggleChat = this.toggleChat.bind(this);
        this.renderQuadrant = Shared.renderQuadrant;

        // window listeners
        this.updateWindowSize = this.updateWindowSize.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        this.keypressHandler = {
            78: this.showNewNote,
            67: this.toggleChat,
            68: this.showDoodleForm,
            83: this.toggleSidebar,
            87: this.toggleExplain
        };
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
        $(window).on('resize', this.updateWindowSize);
        $(window).on('keydown', this.handleKeyDown);
        $(window).on('keyup', this.handleKeyUp);

        // set up draggable sticky notes
        interact('.draggable').draggable({
            restrict: {
                restriction: 'parent',
                endOnly: true,
                elementRect: {top:0, left:0, bottom:1, right:1}
            },
            autoScroll: true,
            onstart: this.beginDrag.bind(this),
            onmove: this.dragTarget.bind(this),
            onend: this.socket.emitDragNote
        });
    }

    componentWillUnmount() {
        this.socket.disconnect();
        $(window).off('resize', this.updateWindowSize);
        $(window).off('keydown', this.handleKeyDown);
        $(window).off('keyup', this.handleKeyUp);
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

    beginDrag(e) {
        // id of target e.g. 'note8'
        let draggedNoteIndex = Number(e.target.id.substring(4));
        this.setState({dragNote: draggedNoteIndex});
    }

    dragTarget(e) {
        drag = true;
        let x = (parseFloat(e.target.getAttribute('data-x')) || 0) + e.dx;
        let y = (parseFloat(e.target.getAttribute('data-y')) || 0) + e.dy;

        this.setTranslation(e.target, x, y);
    }

    isControlKey(k) {
        return k === KEYCODES.N ||
            k === KEYCODES.D ||
            k === KEYCODES.C ||
            k === KEYCODES.W ||
            k === KEYCODES.S ||
            k === KEYCODES.D;
    }

    isModifierKey(k) {
        return k === KEYCODES.SHIFT ||
            k === KEYCODES.ALT ||
            k === KEYCODES.CTRL ||
            k === KEYCODES.CMD;
    }

    handleKeyDown(e) {
        if (this.state.newNote || this.state.editNote || this.state.doodleNote) {
            if (e.which === 27) this.closeForm();
            return;
        }

        if (document.activeElement.id === 'message-text') return;

        if (this.isControlKey(e.which) && !modifier) {
            e.preventDefault();
            this.keypressHandler[e.which]();
        } else if (this.isModifierKey(e.which)) {
            modifier = true;
            setTimeout(() => modifier = false, 5000);
        }
    }

    handleKeyUp(e) {
        if (this.isModifierKey(e.which))
            modifier = false;
    }

    updateWindowSize() {
        this.setState({vw: window.innerWidth, vh: window.innerHeight});
    }

    toggleSidebar() {
        this.setState({showSidebar: !this.state.showSidebar});
    }

    toggleExplain() {
        this.setState({showExplanation: !this.state.showExplanation});
    }

    toggleHelp() {
        this.setState({showHelp: !this.state.showHelp});
    }

    toggleChat() {
        this.setState({showChat: !this.state.showChat, unread: false});
    }

    closeForm() {
        $('#form-text').val('');
        this.setState({newNote: false, editNote: false, doodleNote: false});
    }

    showNewNote() {
        this.setState({newNote: true, editNote: false, doodleNote: false});
    }

    showEditForm(note) {
        if (drag) return drag = false;
        if (note.doodle) return;
        this.setState({editNote: note, newNote: false, doodleNote: false});
    }

    showDoodleForm() {
        this.setState({editNote: false, newNote: false, doodleNote: true});
    }

    alertInvalidAction() {
        alert(PROMPTS.NOT_CONNECTED);
        this.setState({showSidebar: true});
    }

    getForm() {
        if (this.state.newNote) {
            return <NoteForm
                style={this.center(300,230)}
                title={'Make a new post-it'}
                make={this.socket.emitNewNote}
                close={this.closeForm}
            />;
        } else if (this.state.editNote && drag === false) {
            return <NoteForm
                style={this.center(300,230)}
                title={'Edit this post-it'}
                text={this.state.editNote.text}
                make={this.socket.emitEditNote}
                close={this.closeForm}
            />;
        } else if (this.state.doodleNote) {
            return <DoodleForm
                style={this.center(450, 345)}
                bg={this.state.users.usernameToColor[this.state.username]}
                close={this.closeForm}
                save={this.socket.emitNewDoodle}
            />;
        }
        return null;
    }

    getExplanation() {
        if (this.state.showExplanation)
            return <Explanation close={this.toggleExplain} />;
        return null;
    }

    getStickies() {
        return _.map(this.state.compass.notes, this.renderNote);
    }

    getSidebar() {
        return (
            <Sidebar viewCode={this.state.compass.viewCode}
                editCode={this.state.compass.editCode}
                users={this.state.users.usernameToColor}
                you={this.state.username}
                show={this.state.showSidebar}
                disconnected={this.state.disconnected}
                toggleSidebar={this.toggleSidebar}
                destroy={this.socket.emitDeleteCompass}
            />
        );
    }

    getChat() {
        return (
            <Chat messages={this.state.messages}
                colorMap={this.state.users.usernameToColor}
                username={this.state.username}
                socket={this.socket}
                show={this.state.showChat}
                toggleChat={this.toggleChat}
                emitMessage={this.socket.emitMessage}
            />
        );
    }

    render() {
        if (!this.state.compass)
            return <div id="compass"></div>;

        return (
            <div id="compass">
                {this.getStickies()}
                {this.getForm()}
                {this.getExplanation()}
                {this.getCompassStructure(this.state.compass.center)}
                <button id="show-sidebar" onClick={this.toggleSidebar}>Show Sidebar</button>
                {this.getSidebar()}
                <button id="show-chat" onClick={this.toggleChat} style={{background: this.state.unread ? COLORS.RED : COLORS.DARK}}>Show Chat</button>
                {this.getChat()}
            </div>
        );
    }
}

CompassEdit.propTypes = {
    params: PropTypes.object,
    compass: PropTypes.object,
    username: PropTypes.string,
    users: PropTypes.object
};

