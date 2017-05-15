'use strict';

import React, { Component } from 'react';
import _ from 'underscore';

import Menu from './Menu.jsx';
import NoteForm from './NoteForm.jsx';
import StickyNote from './StickyNote.jsx';
import Explanation from './Explanation.jsx';
import HelpScreen from './HelpScreen.jsx';
import Chat from './Chat.jsx';

import { exportPrompt, quadrantsInfo } from '../utils/constants.js'

class Compass extends Component {
	constructor(props, context) {
	    super(props, context);

	    this.state = {
            vw: window.innerWidth,
            vh: window.innerHeight,
            newNote: false,
            compass: this.props.compass,
            username: this.props.username,
            users: {},
            showMenu: true,
            showExplanation: false,
            showHelp: false,
            disconnected: false
        };

	    this.updateNotes = this.updateNotes.bind(this);
	    this.updateUsers = this.updateUsers.bind(this);
	    this.handleDisconnect = this.handleDisconnect.bind(this);
	    this.handleReconnect = this.handleReconnect.bind(this);

        // socket events
	    this.socket = io();
        this.socket.on('update notes', this.updateNotes);
        this.socket.on('update users', this.updateUsers);
        this.socket.on('disconnect', this.handleDisconnect);
        this.socket.on('reconnect', this.handleReconnect);

        // api events
	    this.apiEditNote = this.apiEditNote.bind(this);
	    this.apiMoveNote = this.apiMoveNote.bind(this);
	    this.apiMakeNote = this.apiMakeNote.bind(this);

	    // user events
	    this.updateVw = this.updateVw.bind(this);
	    this.handleKey = this.handleKey.bind(this);
	    this.renderNote = this.renderNote.bind(this);
	    this.showEditForm = this.showEditForm.bind(this);
	    this.closeForm = this.closeForm.bind(this);
	    this.toggleMenu = this.toggleMenu.bind(this);
	    this.toggleExplain = this.toggleExplain.bind(this);
	    this.center = this.center.bind(this);
	    this.exportCompass = this.exportCompass.bind(this);
	    this.showSavePrompt = this.showSavePrompt.bind(this);
	    this.toggleHelp = this.toggleHelp.bind(this);
	}

	componentDidMount() {
	    $(window).on('resize', this.updateVw);
	    $(window).on('keydown', this.handleKey);
        $(window).on('beforeunload', () => true);
	    this.socket.emit('connect compass', {
	        hashcode: this.state.compass.id,
	        username: this.state.username,
	        compassId: this.state.compass._id
	    });
	}

    handleDisconnect() {
        alert('You have been disconnected');
        this.setState({showMenu: true, disconnected: true})
    }

    handleReconnect() {
        alert('You have been reconnected');
        this.socket.emit('reconnected', {
            hashcode: this.state.compass.id,
            compassId: this.state.compass._id,
            username: this.state.username,
            color: this.state.users.usernameToColor[this.state.username]
        })
        this.setState({disconnected: false});
    }

    updateNotes(newNotes) {
        let compass = this.state.compass;
        compass.notes = newNotes;
        this.setState({compass: compass});
    }

    updateUsers(newUsers) {
        this.setState({users: newUsers});
    }

    updateVw() {
        this.setState({
            vw: window.innerWidth,
            vh: window.innerHeight
        });
    }

    handleKey(e) {
        if (this.state.newNote || this.state.editNote) {
            if (e.which === 27) this.closeForm();
            return;
        }

        switch (e.which) {
            case 78:
                e.preventDefault();
                this.setState({newNote: true, editNote: false});
                break;
            case 72:
                e.preventDefault();
                this.toggleHelp();
                break;
            case 87:
                e.preventDefault();
                this.toggleExplain();
                break;
            case 77:
                e.preventDefault();
                this.toggleMenu();
                break;
        }
    }

    toggleMenu() {
        this.setState({showMenu: !this.state.showMenu});
    }

    toggleExplain() {
        this.setState({showExplanation: !this.state.showExplanation});
    }

    toggleHelp() {
        this.setState({showHelp: !this.state.showHelp});
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
        this.setState({compass: compass}); // positive update
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

    renderNote(note, i) {
        return (
            <StickyNote key={note._id}
                note={note}
                i={i}
                w={this.state.vw}
                h={this.state.vh}
                edit={this.showEditForm}
                moveNote={this.apiMoveNote}
            />
        );
    }

    center(w, h) {
        return {
            top: (this.state.vh - h) / 2,
            left: (this.state.vw - w) / 2
        };
    }

    exportCompass() {
        window.html2canvas(document.body).then((canvas) => {
            let imgData = canvas.toDataURL('image/png');
            let doc = new jsPDF('l', 'cm', 'a4');
            doc.addImage(imgData, 'PNG', 0, 0, 30, 18);
            doc.save(this.state.compass.center + '-compass.pdf');
        });
    }

    renderQuadrant(q, i) {
        return (
            <div key={q.id} className="ic-quadrant" id={q.id}>
                <h1>{q.id.toUpperCase()}</h1>
                <h2>{q.prompt}</h2>
            </div>
        );
    }

    showSavePrompt() {
        if (confirm(exportPrompt)) this.exportCompass();
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
        let quadrants = _.map(quadrantsInfo, this.renderQuadrant);

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
            <button id="show-menu" onClick={this.toggleMenu}>Show Menu</button>
            <div id="hline" style={{top: this.state.vh/2 - 2}}></div>
            <div id="vline" style={{left: this.state.vw/2 - 2}}></div>
            <Menu
                id={this.state.compass.id}
                users={this.state.users.usernameToColor}
                you={this.state.username}
                show={this.state.showMenu}
                disconnected={this.state.disconnected}
                toggleMenu={this.toggleMenu}
            />
        </div>
		);
	}
};

export default Compass;

