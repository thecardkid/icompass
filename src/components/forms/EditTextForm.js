import $ from 'jquery';
import React, { Component } from 'react';

import Modal from '../../utils/Modal';
import Toast from '../../utils/Toast';
import Socket from '../../utils/Socket';

import { PROMPTS, MODALS, REGEX } from '../../../lib/constants';
import StyleToolbar from './StyleToolbar';

export default class EditTextForm extends Component {
  constructor(props) {
    super(props);
    this.toast = Toast.getInstance();
    this.modal = Modal.getInstance();
    this.socket = Socket.getInstance();

    this.state = {
      style: {
        bold: false,
        italic: false,
        underline: false,
        ...props.note.style,
      },
      charCount: props.note.text.length,
    };
  }

  toggleStyle = (style) => () => {
    this.setState({
      style: {
        ...this.state.style,
        [style]: !this.state.style[style]
      },
    });
  };

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

  edit = () => {
    this.getText(({ text, isImage }) => {
      if (!text) return;

      const edits = { text, isImage, style: this.state.style };
      const edited = {
        ...this.props.note,
        ...edits,
      };

      this.socket.emitMetric('note edit');
      this.props.ship(edited, this.props.idx);
      this.props.close();
    });
  };

  handleChange = () => {
    this.setState({ charCount: $('#ic-form-text').val().length });
  };

  getHeader(mode) {
    switch (mode) {
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
    const color = this.props.note.color || this.props.bg;

    let textStyle = '';
    if (this.state.style.bold) textStyle += 'bold ';
    if (this.state.style.italic) textStyle += 'italic ';
    if (this.state.style.underline) textStyle += 'underline';

    return (
      <div className="ic-modal" id="ic-note-form">
        <div className="ic-modal-contents">
          <div className="ic-modal-header">
            <h1 className="ic-modal-title">
              {this.getHeader(this.props.mode)}
              <span style={spanStyle}> {this.state.charCount}/300</span>
            </h1>
            <StyleToolbar selected={this.state.style} handler={this.toggleStyle}/>
          </div>
          <textarea id="ic-form-text"
                    className={textStyle}
                    autoFocus
                    defaultValue={this.props.note.text}
                    onChange={this.handleChange}
                    style={{ background: color }} />
          <div className="note-form-footer">
            <button name="ship" onClick={this.edit}>ship it</button>
            <button name="nvm" onClick={this.props.close}>never mind</button>
          </div>
        </div>
      </div>
    );
  }
}
