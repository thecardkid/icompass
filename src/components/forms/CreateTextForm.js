import $ from 'jquery';
import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';

import Modal from '../../utils/Modal';
import Toast from '../../utils/Toast';
import Socket from '../../utils/Socket';

import { PROMPTS, MODALS, REGEX } from '../../../lib/constants';
import StyleToolbar from './StyleToolbar';

export default class CreateTextForm extends Component {
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
      },
      charCount: 0,
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

  make = () => {
    this.getText(({ text, isImage }) => {
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
        style: this.state.style,
        user: this.props.user,
      };

      this.socket.emitMetric(`note ${isImage ? 'image' : 'create'}`);
      this.props.ship(note);
      this.props.close();
    });
  };

  handleChange = () => {
    this.setState({ charCount: $('#ic-form-text').val().length });
  };

  getHeader(mode) {
    switch (mode) {
      case 'make':
        return 'Create a note';
      case 'make draft':
        return 'Create a draft';
      default:
        return '';
    }
  }

  render() {
    const spanStyle = { color: this.state.charCount > 300 ? 'red' : 'black' };

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
                    onChange={this.handleChange}
                    style={{ background: this.props.bg }} />
          <div className="note-form-footer">
            <div>
              <button className={'switch-form'} data-tip="Insert an image" data-for="image-tooltip">
                <i className={'material-icons'}>photo</i>
              </button>
              <ReactTooltip id={'image-tooltip'} place={'top'} effect={'solid'}/>
              <button className={'switch-form'} data-tip="Insert a doodle" data-for="doodle-tooltip">
                <i className={'material-icons'}>brush</i>
              </button>
              <ReactTooltip id={'doodle-tooltip'} place={'top'} effect={'solid'}/>
            </div>
            <button name="ship" onClick={this.make}>ship it</button>
            <button name="nvm" onClick={this.props.close}>never mind</button>
          </div>
        </div>
      </div>
    );
  }
}
