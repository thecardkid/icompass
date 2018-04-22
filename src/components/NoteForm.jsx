import $ from 'jquery';
import React, { Component } from 'react';

import Modal from '../utils/Modal';
import Toast from '../utils/Toast';
import Socket from '../utils/Socket';

import { PROMPTS, COLORS, MODALS, REGEX } from '../../lib/constants';

export default class NoteForm extends Component {
  constructor(props) {
    super(props);
    this.toast = Toast.getInstance();
    this.modal = Modal.getInstance();
    this.socket = Socket.getInstance();

    this.state = {
      bold: false,
      italic: false,
      underline: false,
      charCount: this.props.note.text ? this.props.note.text.length : 0,
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
    this.setState({ bold: !this.state.bold });
  }

  italicize() {
    this.setState({ italic: !this.state.italic });
  }

  underline() {
    this.setState({ underline: !this.state.underline });
  }

  getText(cb) {
    let text = $('#ic-form-text').val();
    if (!text) cb({});

    if (REGEX.URL.test(text)) {
      return this.modal.confirm(MODALS.IMPORT_IMAGE, (isImage) => cb({ text, isImage }));
    }

    if (text.length > 300) {
      this.toast.error(PROMPTS.POST_IT_TOO_LONG);
      return cb({});
    }

    cb({ text, isImage: false });
  }

  make() {
    this.getText(({ text, isImage }) => {
      if (!text) return;

      let x = 0.5, y = 0.5;
      if (typeof this.props.position === 'object') {
        x = this.props.position.x;
        y = this.props.position.y;
      }

      let style = { ...this.state };
      delete style.charCount;

      let note = {
        text, isImage, x, y,
        doodle: null,
        color: this.props.bg,
        style,
        user: this.props.user,
      };

      this.socket.emitMetric(`note ${isImage ? 'image' : 'create'}`);
      this.props.ship(note);
      this.props.close();
    });
  }

  edit() {
    this.getText(({ text, isImage }) => {
      if (!text) return;

      let style = Object.assign({}, this.state);
      delete style.charCount;
      let edits = { text, isImage, style };
      let edited = Object.assign({}, this.props.note, edits);

      this.socket.emitMetric('note edit');
      this.props.ship(edited, this.props.idx);
      this.props.close();
    });
  }

  renderToolbar() {
    let selected = { background: COLORS.DARK, color: 'white' };
    return (
      <div className="ic-text-ibu">
        <button name="underline"
                style={this.state.underline ? selected : null}
                onClick={this.underline}>
          <u>U</u>
        </button>
        <button name="italic"
                style={this.state.italic ? selected : null}
                onClick={this.italicize}>
          <i>I</i>
        </button>
        <button name="bold"
                style={this.state.bold ? selected : null}
                onClick={this.bold}>
          <b>B</b>
        </button>
      </div>
    );
  }

  handleChange() {
    this.setState({ charCount: $('#ic-form-text').val().length });
  }

  getHeader(mode) {
    switch (mode) {
      case 'make':
        return 'Create a note';
      case 'make draft':
        return 'Create a draft';
      case 'edit':
        return 'Edit this note';
      case 'edit draft':
        return 'Edit this draft';
      default:
        return '';
    }
  }

  render() {
    const spanStyle = { color: this.state.charCount > 300 ? 'red' : 'black' };
    const click = this.props.mode.includes('make') ? this.make : this.edit;
    const color = this.props.note.color || this.props.bg;

    let textStyle = '';
    if (this.state.bold) textStyle += 'bold ';
    if (this.state.italic) textStyle += 'italic ';
    if (this.state.underline) textStyle += 'underline';

    return (
      <div className="ic-modal" id="ic-note-form" style={this.props.style}>
        <div className="ic-modal-contents">
          <div className="ic-modal-header">
            <h1 className="ic-modal-title">
              {this.getHeader(this.props.mode)}
              <span style={spanStyle}> {this.state.charCount}/300</span>
            </h1>
            {this.renderToolbar()}
          </div>
          <textarea id="ic-form-text"
                    className={textStyle}
                    autoFocus
                    defaultValue={this.props.note.text}
                    onChange={this.handleChange}
                    style={{ background: color }}>
                    </textarea>
          <div className="note-form-footer">
            <button name="ship" onClick={click}>ship it</button>
            <button name="nvm" onClick={this.props.close}>never mind</button>
          </div>
        </div>
      </div>
    );
  }
}
