'use strict';

import React, { Component } from 'react';
import _ from 'underscore';
import { type } from '../utils';

import Menu from './menu.jsx';
import NewNote from './newNote.jsx';
import HelpScreen from './helpScreen.jsx';

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
        };

        let updateNotes = (newNote) => {
            let compass = this.state.compass;
            compass.notes.push(newNote);
            this.setState({compass: compass});
        };

        let updateUsers = (newUsers) => this.setState({users: newUsers});

	    this.socket = io();
        this.socket.on('update notes', newNote => updateNotes(newNote));
        this.socket.on('user joined', updateUsers);
        this.socket.on('user left', updateUsers);

	    this.updateVw = this.updateVw.bind(this);
	    this.handleKey = this.handleKey.bind(this);
	    this.renderList = this.renderList.bind(this);
	    this.makeNote = this.makeNote.bind(this);
	    this.closeForm = this.closeForm.bind(this);
	    this.exportCompass = this.exportCompass.bind(this);
	    this.toggleMenu = this.toggleMenu.bind(this);
	    this.toggleHelp = this.toggleHelp.bind(this);
	}

	componentDidMount() {
	    $(window).on('resize', this.updateVw);
	    $(window).on('keydown', this.handleKey);
	    window.onbeforeunload = () => true;
	    this.socket.emit('connect compass', {
	        hashcode: this.state.compass.id,
	        username: this.state.username
	    });
	}

    updateVw() {
        this.setState({
            vw: window.innerWidth,
            vh: window.innerHeight
        });
    }

    handleKey(e) {
        if (this.state.newNote) return;

        let noteType;
        switch (e.which) {
            case 79:
                noteType = type.OBSERVATION;
                break;
            case 80:
                noteType = type.PRINCIPLE;
                break;
            case 73:
                noteType = type.IDEA;
                break;
            case 69:
                noteType = type.EXPERIMENT;
                break;
            case 72:
                this.toggleHelp();
                e.preventDefault();
                break;
        }

        if (noteType) {
            this.setState({newNote: true, type: noteType});
            e.preventDefault();
        }
    }

    toggleMenu() {
        this.setState({showMenu: !this.state.showMenu});
    }

    toggleHelp() {
        this.setState({showHelp: !this.state.showHelp});
    }

    exportCompass() {
        let compass = this.state.compass;
        let fileType = 'text/plain';
        let link = document.createElement('a');
        let filename = compass.center + '-compass';

        let newline = '\r\n';
        let text = 'Centered on ' + compass.center + newline;
        text += 'ID: ' + compass.id + newline + newline;

        _.map(type, (value) => {
            text += value.toUpperCase() + newline;
            let list = _.filter(compass.notes, (e) => e.quadrant === value);

            _.map(list, (e, i) => {
                text += '- ' + e.text + newline;
            });

            text += newline;
        });

        link.setAttribute('download', filename);
        link.setAttribute('href', 'data:' + fileType + ';charset=utf-8,' + encodeURIComponent(text));
        link.click();
    }

    makeNote() {
        let text = $('#new-note-text').val();

        if (text === '') return;

        this.socket.emit('new note', {
            type: this.state.type.toLowerCase(),
            text: text,
            user: this.state.username
        });
        this.closeForm();
    }

    closeForm() {
        $('#new-note-text').val('');
        this.setState({newNote: false, type: null});
    }

    renderList(type) {
        let list = _.filter(this.state.compass.notes, (e) => e.quadrant === type);
        let renderElem = (e, i) => {
            return (
                <li key={e.quadrant+i}>
                    <a style={{background: e.color}}>
                        <p>{e.text}</p>
                    </a>
                </li>
            );
        }
        return (
            <div className="quadrant" id={type}>
                <h1>{type+'s'}</h1>
                <ul>
                    {_.map(list, renderElem)}
                </ul>
            </div>
        )
    }

	render() {
        let centerStyle = (w, h) => {
            return {
                top: (this.state.vh - h) / 2,
                left: (this.state.vw - w) / 2
            };
        };

        let newNote;
        if (this.state.newNote) {
            newNote = <NewNote
                style={centerStyle(300,230)}
                type={this.state.type}
                make={this.makeNote}
                close={this.closeForm}
            />
        }

        let helpScreen;
        if (this.state.showHelp) {
            helpScreen = <HelpScreen close={this.toggleHelp} />;
        }

        let observations = this.renderList(type.OBSERVATION),
            principles = this.renderList(type.PRINCIPLE),
            ideas = this.renderList(type.IDEA),
            experiments = this.renderList(type.EXPERIMENT);

        return (
        <div id="compass">
            {observations}
            {principles}
            {ideas}
            {experiments}
            {newNote}
            {helpScreen}
            <div id="center" style={centerStyle(100,100)}>{this.state.compass.center}</div>
            <button id="show-menu" onClick={this.toggleMenu}>Show Menu</button>
            <div id="horiz-line" style={{top: this.state.vh/2 - 2}}></div>
            <div id="vert-line" style={{left: this.state.vw/2 - 2}}></div>
            <Menu
                id={this.state.compass.id}
                users={this.state.users}
                show={this.state.showMenu}
                toggleMenu={this.toggleMenu}
                exportCompass={this.exportCompass}
            />
        </div>
		);
	}
};

export default Compass;

