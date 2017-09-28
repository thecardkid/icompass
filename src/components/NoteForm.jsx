'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Modal from 'Utils/Modal.jsx';
import Toast from 'Utils/Toast.jsx';
import Validator from 'Utils/Validator.jsx';

import { PROMPTS, COLORS, MODALS } from 'Lib/constants';

export default class NoteForm extends Component {
    constructor(props) {
        super(props);
        this.toast = new Toast();
        this.modal = new Modal();

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

    getText(cb) {
        let text = $('#ic-form-text').val();
        if (!text) cb({});
        let validText = Validator.validateStickyText(text);

        let isImage = false;
        if (validText[0]) {
            this.modal.confirm(MODALS.IMPORT_IMAGE, (isImage) => {
                cb({ text, isImage });
            });
        } else if (!validText[1]) {
            this.toast.error(PROMPTS.POST_IT_TOO_LONG);
            text = null;
            cb({ text, isImage });
        } else if (validText[1]) {
            cb({ text, isImage });
        }
    }

    make() {
        this.getText((data) => {
            let { text, isImage } = data;
            if (!text) return;

            let x = 0.5, y = 0.5;
            if (typeof this.props.position === 'object') {
                x = this.props.position.x;
                y = this.props.position.y;
            }

            let style = Object.assign({}, this.state);
            delete style.charCount;

            let note = {
                text, isImage, x, y,
                doodle: null,
                color: this.props.bg,
                style,
                user: this.props.user
            };

            this.props.ship(note);
            this.props.close();
        });
    }

    edit() {
        this.getText((data) => {
            let { text, isImage } = data;
            if (!text) return;

            let style = Object.assign({}, this.state);
            delete style.charCount;
            let edited = { text, isImage, style };

            this.props.ship(edited, this.props.idx);
            this.props.close();
        });
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

    getHeader(mode) {
        switch (mode) {
            case 'make': return 'Create a note';
            case 'make draft': return 'Create a draft';
            case 'edit': return 'Edit this note';
            case 'edit draft': return 'Edit this draft';
            default: return '';
        }
    }

    render() {
        let header = this.getHeader(this.props.mode);
        header += ' ' + this.state.charCount + '/300';
        let click = this.props.mode.includes('make') ? this.make : this.edit;
        let color = this.props.note.color || this.props.bg;

        let textStyle = '';
        if (this.state.bold) textStyle += 'bold ';
        if (this.state.italic) textStyle += 'italic ';
        if (this.state.underline) textStyle += 'underline';

        return (
            <div className="ic-modal" id="ic-note-form" style={this.props.style}>
                <div className="ic-modal-contents">
                    <div className="ic-modal-header">
                        <h1 className="ic-modal-title">{header}</h1>
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
    user: PropTypes.string,
    idx: PropTypes.number,
};
