'use strict';

import React, { Component } from 'react';
import _ from 'underscore';

import Sidebar from './Sidebar.jsx';
import NoteForm from './NoteForm.jsx';
import StickyNote from './StickyNote.jsx';
import Explanation from './Explanation.jsx';
import HelpScreen from './HelpScreen.jsx';
import Shared from './Shared.jsx';
import Chat from './Chat.jsx';

import { exportPrompt, quadrantsInfo, keys } from '../utils/constants.js';

let modifier = false; // to differentiate between 'c' and 'ctrl-c'

class CompassEdit extends Component {
	constructor(props, context) {
	    super(props, context);

	    this.state = {
            vw: window.innerWidth,
            vh: window.innerHeight,
            newNote: false,
            editNote: false,
            compass: this.props.compass,
            username: this.props.username,
            users: {},
            showSidebar: true,
            showChat: true,
            showExplanation: false,
            showHelp: false,
            disconnected: false,
            unread: false,
            messages: []
        };

	    this.updateNotes = this.updateNotes.bind(this);
	    this.updateUsers = this.updateUsers.bind(this);
	    this.handleDisconnect = this.handleDisconnect.bind(this);
	    this.handleReconnect = this.handleReconnect.bind(this);
	    this.updateMessages = this.updateMessages.bind(this);

        // socket events
	    this.socket = io();
        this.socket.on('update notes', this.updateNotes);
        this.socket.on('update users', this.updateUsers);
        this.socket.on('disconnect', this.handleDisconnect);
        this.socket.on('reconnect', this.handleReconnect);
        this.socket.on('new message', this.updateMessages);

        // api events
	    this.apiEditNote = this.apiEditNote.bind(this);
	    this.apiMoveNote = this.apiMoveNote.bind(this);
	    this.apiMakeNote = this.apiMakeNote.bind(this);

	    // Shared methods
	    this.renderNote = Shared.renderNote.bind(this);
	    this.center = Shared.center.bind(this);
	    this.showSavePrompt = Shared.showSavePrompt.bind(this);
	    this.exportCompass = Shared.exportCompass.bind(this);

	    // user events
	    this.updateVw = this.updateVw.bind(this);
	    this.handleKeyDown = this.handleKeyDown.bind(this);
	    this.handleKeyUp = this.handleKeyUp.bind(this);
	    this.renderNote = this.renderNote.bind(this);
	    this.showEditForm = this.showEditForm.bind(this);
	    this.closeForm = this.closeForm.bind(this);
	    this.toggleSidebar = this.toggleSidebar.bind(this);
	    this.toggleExplain = this.toggleExplain.bind(this);
	    this.toggleHelp = this.toggleHelp.bind(this);
	    this.toggleChat = this.toggleChat.bind(this);

        this.keypressHandler = {
            78: () => this.setState({newNote: true, editNote: false}),
            67: this.toggleChat,
            72: this.toggleHelp,
            83: this.toggleSidebar,
            87: this.toggleExplain
        };
	}

	componentDidMount() {
	    $(window).on('resize', this.updateVw);
	    $(window).on('keydown', this.handleKeyDown);
	    $(window).on('keyup', this.handleKeyUp);
        // $(window).on('beforeunload', () => true);
	    this.socket.emit('connect compass', {
	        code: this.state.compass.editCode,
	        username: this.state.username,
	        compassId: this.state.compass._id
	    });
	}

    handleKeyDown(e) {
        if (this.state.newNote || this.state.editNote) {
            if (e.which === 27) this.closeForm();
            return;
        }

        if (document.activeElement.id === 'message-text') return;

        switch (e.which) {
            case keys.N:
            case keys.C:
            case keys.H:
            case keys.W:
            case keys.S:
                if (!modifier) {
                    e.preventDefault();
                    this.keypressHandler[e.which]();
                }
                break;
            case keys.SHIFT:
            case keys.CTRL:
            case keys.ALT:
            case keys.CMD:
                modifier = true;
                break;
            default: break;
        }
    }

    handleKeyUp(e) {
        switch (e.which) {
            case keys.SHIFT:
            case keys.CTRL:
            case keys.ALT:
            case keys.CMD:
                modifier = false;
                break;
            default: break;
        }
    }

    handleDisconnect() {
        // alert('You have been disconnected');
        this.setState({showSidebar: true, disconnected: true})
    }

    handleReconnect() {
        // alert('You have been reconnected');
        this.socket.emit('reconnected', {
            code: this.state.compass.editCode,
            compassId: this.state.compass._id,
            username: this.state.username,
            color: this.state.users.usernameToColor[this.state.username]
        })
        this.setState({disconnected: false});
    }

    updateNotes(newNotes) {
        let { compass } = this.state;
        compass.notes = newNotes;
        this.setState({ compass });
    }

    updateUsers(users) {
        this.setState({ users });
    }

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
    }

    updateVw() {
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

    validateText() {
        let text = $('#ic-form-text').val();
        if (text === '') return false;
        if (text.length > 200) {
            alert('You can\'t fit that much on a post-it!');
            return false;
        }
        return text;
    }

    alertInvalidAction() {
        alert('You are not connected to the server.');
    }

    apiMakeNote() {
        if (this.state.disconnected) return this.alertInvalidAction();
        let text = this.validateText();
        if (!text) return;

        this.socket.emit('new note', {
            text: text,
            color: this.state.users.usernameToColor[this.state.username],
            x: 0.5,
            y: 0.5
        });
        this.closeForm();
    }

    apiMoveNote(event, n, i) {
        if (this.state.disconnected) return this.alertInvalidAction();
        let h = $('#'+n._id).height();
        let note = JSON.parse(JSON.stringify(n));
        note.x = event.clientX / this.state.vw;
        note.y = (event.clientY - h) / this.state.vh;

        let compass = this.state.compass;
        compass.notes[i] = note;
        this.setState({ compass }); // positive update
        this.socket.emit('update note', note);
    }

    apiEditNote() {
        if (this.state.disconnected) return this.alertInvalidAction();
        let text = this.validateText();
        if (!text) return;

        let note = JSON.parse(JSON.stringify(this.state.editNote));
        note.text = text;
        this.socket.emit('update note', note);
        this.closeForm();
    }

    closeForm() {
        $('#form-text').val('');
        this.setState({newNote: false, editNote: false});
    }

    showEditForm(note) {
        this.setState({editNote: note, newNote: false});
    }

    getForm() {
        if (this.state.newNote) {
            return <NoteForm
                style={this.center(300,230)}
                title={'Make a new post-it'}
                make={this.apiMakeNote}
                close={this.closeForm}
            />
        } else if (this.state.editNote) {
            return <NoteForm
                style={this.center(300,230)}
                title={'Edit this post-it'}
                text={this.state.editNote.text}
                make={this.apiEditNote}
                close={this.closeForm}
            />
        }
        return null;
    }

    getHelpScreen() {
        if (this.state.showHelp)
            return <HelpScreen style={this.center(420,300)} close={this.toggleHelp}/>
        return null;
    }

    getExplanation() {
        if (this.state.showExplanation)
            return <Explanation close={this.toggleExplain} />;
        return null;
    }

	render() {
        let form = this.getForm();
        let helpScreen = this.getHelpScreen();
        let explanation = this.getExplanation();
        let stickies = _.map(this.state.compass.notes, this.renderNote);
        let quadrants = _.map(quadrantsInfo, Shared.renderQuadrant);

        return (
        <div id="compass">
            {stickies}
            {form}
            {helpScreen}
            {explanation}
            {quadrants}
            <div id="center" style={this.center(100,100)}>
                {this.state.compass.center}
                <button id="export" onClick={this.showSavePrompt}>Save as PDF</button>
            </div>
            <button id="show-menu" onClick={this.toggleSidebar}>Show Sidebar</button>
            <div id="hline" style={{top: this.state.vh/2 - 2}}></div>
            <div id="vline" style={{left: this.state.vw/2 - 2}}></div>
            <Sidebar viewCode={this.state.compass.viewCode}
                editCode={this.state.compass.editCode}
                users={this.state.users.usernameToColor}
                you={this.state.username}
                show={this.state.showSidebar}
                disconnected={this.state.disconnected}
                toggleSidebar={this.toggleSidebar}
            />
            <Chat messages={this.state.messages}
                colorMap={this.state.users.usernameToColor}
                username={this.state.username}
                socket={this.socket}
                unread={this.state.unread}
                show={this.state.showChat}
                toggle={this.toggleChat}
            />
        </div>
		);
	}
};

export default CompassEdit;

