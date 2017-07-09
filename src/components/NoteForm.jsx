'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Validator from 'Utils/Validator.jsx';

import { PROMPTS, COLORS } from 'Lib/constants';

export default class NoteForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bold: false,
            italic: false,
            underline: false,
            charCount: this.props.note.text ? this.props.note.text.length : 0
        };
        if (this.props.note.style) Object.assign(this.state, this.props.note.style);

        this.bold = this.bold.bind(this);
        this.italicize = this.italicize.bind(this);
        this.underline = this.underline.bind(this);
        this.make = this.make.bind(this);
        this.edit = this.edit.bind(this);
        this.handleChange = this.handleChange.bind(this);
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
        else if (!validText[1])
            return alert(PROMPTS.POST_IT_TOO_LONG);

        return { text, isImage };
    }

    make() {
        let { text, isImage } = this.getText();
        if (!text) return;

        let x = 0.5, y = 0.5;
        if (typeof this.props.position === 'object') {
            x = this.props.position.x;
            y = this.props.position.y;
        }

        let note = {
            text, isImage, x, y,
            doodle: null,
            color: this.props.bg,
            style: this.state,
            user: this.props.user
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
        let selected = {background: COLORS.DARK, color: 'white'};
        return (
            <div className="ic-text-ibu">
                <button name="underline" style={this.state.underline ? selected : null} onClick={this.underline}><u>U</u></button>
                <button name="italic" style={this.state.italic ? selected : null} onClick={this.italicize}><i>I</i></button>
                <button name="bold" style={this.state.bold ? selected : null} onClick={this.bold}><b>B</b></button>
            </div>
        );
    }

    handleChange() {
        this.setState({
            charCount: $('#ic-form-text').val().length
        });
    }

    render() {
        let header = this.props.mode === 'make' ? 'Create a note' : 'Edit this note';
        header += ' /' + this.state.charCount;
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
                    <textarea id="ic-form-text"
                        className={textStyle}
                        autoFocus
                        defaultValue={this.props.note.text}
                        onChange={this.handleChange}
                        style={{background: color}}>
                    </textarea>
                    <button name="nvm" className="ic-button" onClick={this.props.close}>never mind</button>
                    <button name="ship" className="ic-button" onClick={click}>ship it</button>
                </div>
            </div>
        );
    }
}

NoteForm.propTypes = {
    mode: PropTypes.string.isRequired,
    style: PropTypes.object.isRequired,
    note: PropTypes.object.isRequired,
    ship: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    bg: PropTypes.string.isRequired,
    position: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.objectOf(PropTypes.number)
    ]),
    user: PropTypes.string
};

