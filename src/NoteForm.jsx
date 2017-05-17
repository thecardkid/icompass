'use strict';

import React, { Component } from 'react';
import _ from 'underscore';

export default class NoteForm extends Component {

    render() {
        return (
            <div className="ic-modal" id="ic-note-form" style={this.props.style}>
                <div id="ic-form-contents">
                    <h1 id="ic-form-title">{this.props.title}</h1>
                    <textarea autoFocus id="ic-form-text" defaultValue={this.props.text || ''}/>
                    <button name="ship" className="ic-button" onClick={this.props.make}>ship it</button>
                    <button name="nvm" className="ic-button" onClick={this.props.close}>never mind</button>
                </div>
            </div>
        );
    }
}

