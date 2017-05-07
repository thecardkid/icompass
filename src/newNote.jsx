'use strict';

import React, { Component } from 'react';
import _ from 'underscore';
import { type } from '../utils';

class NewNote extends Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <div id="new-note" style={this.props.style}>
                <div id="note-contents">
                    <h1 id="new-note-title">{'New ' + this.props.type}</h1>
                    <textarea autoFocus id="new-note-text"/>
                    <button id="make-note" onClick={this.props.make}>add note</button>
                    <button id="nevermind" onClick={this.props.close}>never mind</button>
                </div>
            </div>
        );
    }
}

export default NewNote;

