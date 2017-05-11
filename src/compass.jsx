'use strict';

import React, { Component } from 'react';
import _ from 'underscore';

import Menu from './menu.jsx';
import NoteForm from './newNote.jsx';
import StickyNote from './sticky.jsx';
import HelpScreen from './helpScreen.jsx';
import Instructions from './instructions.jsx';

// TODO: In menu.jsx, change current username to 'you'

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
            showMenu: false,
            showHelp: false,
            showInstructions: false,
            update: false,
        };

        let addNote = (newNote) => {
            let compass = this.state.compass;
            compass.notes.push(newNote);
            this.setState({compass: compass});
        };

        let refreshNotes = (newNotes) => {
            let compass = this.state.compass;
            compass.notes = newNotes;
            this.setState({compass: compass});
        }

        let updateUsers = (newUsers) => this.setState({users: newUsers});

        // socket events
	    this.socket = io();
        this.socket.on('add note', newNote => addNote(newNote));
        this.socket.on('user joined', updateUsers);
        this.socket.on('user left', updateUsers); // TODO: handle this
        this.socket.on('refresh notes', refreshNotes);

        // api events
	    this.apiEditNote = this.apiEditNote.bind(this);
	    this.apiMakeNote = this.apiMakeNote.bind(this);

	    // user events
	    this.updateVw = this.updateVw.bind(this);
	    this.handleKey = this.handleKey.bind(this);
	    this.renderNote = this.renderNote.bind(this);
	    this.showEditForm = this.showEditForm.bind(this);
	    this.closeForm = this.closeForm.bind(this);
	    this.toggleMenu = this.toggleMenu.bind(this);
	    this.toggleHelp = this.toggleHelp.bind(this);
	    this.center = this.center.bind(this);
	    this.exportCompass = this.exportCompass.bind(this);
	    this.showSavePrompt = this.showSavePrompt.bind(this);
	    this.toggleInstructions = this.toggleInstructions.bind(this);
	}

	componentDidMount() {
	    $(window).on('resize', this.updateVw);
	    $(window).on('keydown', this.handleKey);
        $(window).on('beforeunload', () => true);
	    this.socket.emit('connect compass', {
	        hashcode: this.state.compass.id,
	        username: this.state.username,
	        manager: this.state.users
	    });
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
                this.toggleInstructions();
                break;
            case 87:
                e.preventDefault();
                this.toggleHelp();
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

    toggleHelp() {
        this.setState({showHelp: !this.state.showHelp});
    }

    toggleInstructions() {
        this.setState({showInstructions: !this.state.showInstructions});
    }

    validateText() {
        let text = $('#form-text').val();

        if (text === '') return false;
        if (text.length > 200) {
            alert('You can\'t fit that much on a post-it!');
            return false;
        }

        return text;
    }

    apiMakeNote() {
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

    apiEditNote(id) {
        let text = this.validateText();
        if (!text) return;

        this.socket.emit('edit note', {
            noteId: this.state.editNote._id,
            text: text
        });
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
                w={this.state.vw}
                h={this.state.vh}
                edit={this.showEditForm}
                socket={this.socket}
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

    showSavePrompt() {
        let text = 'I see you want to save this compass as a PDF. You can:\n\n' +
            '1. Click \'OK\' and I can try to create a pdf for you, but the image ' +
            'quality may not be to your liking. Or\n\n' +
            '2. Click \'Cancel\' and take a screenshot (recommended)';

        if (confirm(text)) this.exportCompass();
    }

	render() {
        let form;
        if (this.state.newNote) {
            form = <NoteForm
                style={this.center(300,230)}
                title={'Make a new post-it'}
                make={this.apiMakeNote}
                close={this.closeForm}
            />
        } else if (this.state.editNote) {
            form = <NoteForm
                style={this.center(300,230)}
                title={'Edit this post-it'}
                text={this.state.editNote.text}
                make={this.apiEditNote}
                close={this.closeForm}
            />
        }

        let instructions;
        if (this.state.showInstructions) {
            instructions = <Instructions style={this.center(420,300)} close={this.toggleInstructions}/>
        }

        let helpScreen;
        if (this.state.showHelp)
            helpScreen = <HelpScreen close={this.toggleHelp} />;

        let stickies = _.map(this.state.compass.notes, this.renderNote);

        return (
        <div id="compass">
            {stickies}
            {form}
            {instructions}
            {helpScreen}
            <div className="quadrant" id="observations">
                <h1>OBSERVATIONS</h1>
                <h2>What's happening? Why?</h2>
            </div>
            <div className="quadrant" id="principles">
                <h1>PRINCIPLES</h1>
                <h2>What matters most?</h2>
            </div>
            <div className="quadrant" id="ideas">
                <h1>IDEAS</h1>
                <h2>What could happen?</h2>
            </div>
            <div className="quadrant" id="experiments">
                <h1>EXPERIMENTS</h1>
                <h2>What's a way to try?</h2>
            </div>
            <div id="center" style={this.center(100,100)}>
                {this.state.compass.center}
                <button id="export" onClick={this.showSavePrompt}>Save as PDF</button>
            </div>
            <button id="show-menu" onClick={this.toggleMenu}>Show Menu</button>
            <div id="horiz-line" style={{top: this.state.vh/2 - 2}}></div>
            <div id="vert-line" style={{left: this.state.vw/2 - 2}}></div>
            <Menu
                id={this.state.compass.id}
                users={this.state.users}
                show={this.state.showMenu}
                toggleMenu={this.toggleMenu}
            />
        </div>
		);
	}
};

export default Compass;

