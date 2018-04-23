import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';

import { REGEX } from '../../../lib/constants';

export default class ImageForm extends Component {
  state = {
    imgSource: '',
  };

  handleChange = (e) => {
    this.setState({ imgSource: e.target.value });
  };

  renderPreview = () => {
    if (!REGEX.URL.test(this.state.imgSource)) {
      return;
    }

    return (
      <div className="preview">
        <p>Preview</p>
        <img src={this.state.imgSource} />
      </div>
    );
  };

  submit = () => {
    this.props.submit(this.state.imgSource);
  };

  render() {
    const color = this.props.bg;

    return (
      <div className="ic-modal ic-form" id="ic-image-form">
        <div className="ic-modal-contents">
          <div className="ic-modal-header">
            <h1 className="ic-modal-title">Insert an image</h1>
          </div>
          <textarea id="ic-form-text"
                    autoFocus
                    defaultValue={this.props.value || ''}
                    onChange={this.handleChange}
                    style={{ background: color }} />
          {this.renderPreview()}
          <div className="note-form-footer">
            <div>
              <button className={'switch-form'} data-tip="Create a text note" data-for="image-tooltip">
                <i className={'material-icons'}>text_format</i>
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
