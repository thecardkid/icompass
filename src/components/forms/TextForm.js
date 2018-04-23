import $ from 'jquery';
import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';

import StyleToolbar from './StyleToolbar';
import { MODALS, PROMPTS, REGEX } from '../../../lib/constants';
import ModalSingleton from '../../utils/Modal';

export default class TextForm extends Component {
  state = {
    style: {
      bold: false,
      italic: false,
      underline: false,
    },
    charCount: 0,
  };

  modal = ModalSingleton.getInstance();

  toggleStyle = (style) => () => {
    this.setState({
      style: {
        ...this.state.style,
        [style]: !this.state.style[style]
      },
    });
  };

  handleChange = () => {
    this.setState({ charCount: $('#ic-form-text').val().length });
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

  submit = () => {
    this.getText(({ text, isImage }) => {
      this.props.submit(text, isImage, this.state.style);
    });
  };

  render() {
    let textStyle = '';
    if (this.state.style.bold) textStyle += 'bold ';
    if (this.state.style.italic) textStyle += 'italic ';
    if (this.state.style.underline) textStyle += 'underline';

    return (
      <div className="ic-modal" id="ic-note-form">
        <div className="ic-modal-contents">
          <div className="ic-modal-header">
            {this.props.renderHeader(this.state)}
            <StyleToolbar selected={this.state.style} handler={this.toggleStyle}/>
          </div>
          <textarea id="ic-form-text"
                    className={textStyle}
                    autoFocus
                    defaultValue={this.props.defaultText || ''}
                    onChange={this.handleChange}
                    style={{ background: this.props.bg }}/>
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
            <button name="ship" onClick={this.submit}>ship it</button>
            <button name="nvm" onClick={this.props.close}>never mind</button>
          </div>
        </div>
      </div>
    );
  }
}
