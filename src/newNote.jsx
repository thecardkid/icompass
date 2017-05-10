'use strict';

import React, { Component } from 'react';
import _ from 'underscore';

class NoteForm extends Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <div id="note-form" style={this.props.style}>
                <div id="form-contents">
                    <h1 id="form-title">{this.props.title}</h1>
                    <textarea autoFocus id="form-text" defaultValue={this.props.text || ''}/>
                    <button onClick={this.props.make}>ship it</button>
                    <button onClick={this.props.close}>never mind</button>
                </div>
            </div>
        );
    }
}

export default NoteForm;

