'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Validator from 'Utils/Validator.jsx';

import { PROMPTS } from 'Lib/constants';

export default class NoteForm extends Component {
    constructor(props) {
        super(props);

        this.state = { bold: false, italic: false, underline: false };
        if (this.props.note) Object.assign(this.state, this.props.note.style);

        this.bold = this.bold.bind(this);
        this.italicize = this.italicize.bind(this);
        this.underline = this.underline.bind(this);
        this.make = this.make.bind(this);
        this.edit = this.edit.bind(this);
    }

    bold() {
        this.setState({bold: !this.state.bold});
    }

    italicize() {
        this.setState({italic: !this.state.italic});
    }

    underline() {
        this.setState({underline: !this.state.underline});
    }

    getText() {
        let text = $('#ic-form-text').val();
        if (!text) return {};
        let validText = Validator.validateStickyText(text);
        let isImage;

        if (validText[0])
            isImage = confirm(PROMPTS.CONFIRM_IMAGE_LINK);
        else
            if (!validText[1]) return alert(PROMPTS.POST_IT_TOO_LONG);

        return { text, isImage };
    }

    make() {
        let { text, isImage } = this.getText();
        if (!text) return;
        let note = {
            text, isImage,
            doodle: null,
            color: this.props.bg,
            x: 0.5, y: 0.5,
            style: this.state
        };

        this.props.ship(note);
    }

    edit() {
        let { text, isImage } = this.getText();
        if (!text) return;
        let edited = {
            text, isImage,
            style: this.state
        };

        this.props.ship(edited);
    }

    renderToolbar() {
        return (
            <div className="ic-text-ibu">
                <button name="underline" onClick={this.underline}><u>U</u></button>
                <button name="italic" onClick={this.italicize}><i>I</i></button>
                <button name="bold" onClick={this.bold}><b>B</b></button>
            </div>
        )
    }

    render() {
        let header = this.props.mode === 'make' ? 'Create a note' : 'Edit this note';
        let click = this.props.mode === 'make' ? this.make : this.edit;
        let color = this.props.note.color || this.props.bg;

        let textStyle = '';
        if (this.state.bold) textStyle += 'bold ';
        if (this.state.italic) textStyle += 'italic ';
        if (this.state.underline) textStyle += 'underline';

        return (
            <div className="ic-modal" id="ic-note-form" style={this.props.style}>
                <div id="ic-form-contents">
                    <div id="ic-form-header">
                        <h1 id="ic-form-title">{header}</h1>
                        {this.renderToolbar()}
                    </div>
                    <textarea id="ic-form-text" className={textStyle} autoFocus defaultValue={this.props.note.text} style={{background: color}}></textarea>
                    <button name="ship" className="ic-button" onClick={click}>ship it</button>
                    <button name="nvm" className="ic-button" onClick={this.props.close}>never mind</button>
                </div>
            </div>
        );
    }
}

NoteForm.propTypes = {
    style: PropTypes.object.isRequired,
    note: PropTypes.object.isRequired,
    ship: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    bg: PropTypes.string.isRequired
};

