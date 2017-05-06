'use strict';

import React, { Component } from 'react';
import _ from 'underscore';
import EventEmitter from 'event-emitter';
import { type } from '../utils';

var colors = [
    '#ffc', // yellow
    '#cfc', // green
    '#ccf', // purple
    '#cff', // blue
    '#fcf', // pink
];

class Note extends Component {
    constructor(props, context) {
        super(props, context);

        console.log(props);
    }
}

class Main extends Component {
	constructor(props, context) {
	    super(props, context);

        this.state = {
            vw: window.innerWidth,
            vh: window.innerHeight,
            newNote: false,
            compass: this.props.compass,
            username: this.props.username,
            users: {},
        };

        let updateNotes = (newNote) => {
            let compass = this.state.compass;
            compass.notes.push(newNote);
            this.setState({compass: compass});
        };

	    this.socket = io();
        this.socket.on('update notes', newNote => updateNotes(newNote));
        this.socket.on('user joined', (newUser) => {
            let users = this.state.users;
            users[newUser] = colors[0];
            colors = colors.splice(1);
            this.setState({users: users});
        });
	    this.updateVw = this.updateVw.bind(this);
	    this.handleKey = this.handleKey.bind(this);
	    this.renderList = this.renderList.bind(this);
	    this.makeNote = this.makeNote.bind(this);
	    this.closeForm = this.closeForm.bind(this);
	}

	componentDidMount() {
	    $(window).on('resize', this.updateVw);
	    $(window).on('keydown', this.handleKey);
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
        }

        if (noteType) {
            $('#new-note-text').focus();
            this.setState({newNote: true, type: noteType});
        }
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
                    <a style={{background: this.state.users[e.user]}}>
                        <p>{e.text}</p>
                    </a>
                </li>
            );
        }
        return (
            <div className="quadrant" id={type}>
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

        let newNoteClass = 'hidden', title = 'New ';
        if (this.state.newNote) {
            newNoteClass = '';
            title += this.state.type;
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
            <div id="center" style={centerStyle(100,100)}>{this.state.compass.id}</div>
            <div id="new-note" className={newNoteClass} style={centerStyle(300,230)}>
                <h3 id="new-note-title">{title}</h3>
                <input id="new-note-text"/>
                <button id="make-note" onClick={this.makeNote}>add note</button>
                <button id="nevermind" onClick={this.closeForm}>never mind</button>
            </div>
        </div>
		);
	}
};

export default Main;

