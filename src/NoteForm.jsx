'use strict';

import React, { Component } from 'react';
import _ from 'underscore';

class NoteForm extends Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <div className="ic-modal" id="ic-note-form" style={this.props.style}>
                <div id="ic-form-contents">
                    <h1 id="ic-form-title">{this.props.title}</h1>
                    <textarea autoFocus id="ic-form-text" defaultValue={this.props.text || ''}/>
                    <button className="ic-button" onClick={this.props.make}>ship it</button>
                    <button className="ic-button" onClick={this.props.close}>never mind</button>
                </div>
            </div>
        );
    }
}

export default NoteForm;

