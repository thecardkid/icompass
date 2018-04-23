import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { bindActionCreators } from 'redux';

import * as uiX from '../../actions/ui';

import { REGEX } from '../../../lib/constants';
import SocketSingleton from '../../utils/Socket';

class ImageForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgSource: props.defaultUrl || '',
    };
    this.socket = SocketSingleton.getInstance();
  }

  handleChange = (e) => {
    const { value } = e.target;

    if (value.includes('drive.google.com')) {
      const fileId = value.split('/')[5];
      const imgSource = `https://drive.google.com/thumbnail?id=${fileId}`;
      this.setState({ imgSource });
      return;
    }

    this.setState({ imgSource: value });
  };

  renderPreview = () => {
    let img;
    if (REGEX.URL.test(this.state.imgSource)) {
      img = <img src={this.state.imgSource} />;
    }

    return (
      <div className="preview">
        <p>
          Preview
          <span data-tip
                data-for="help-tooltip"
          ><i className={'material-icons'}>help</i></span>
          <ReactTooltip id={'help-tooltip'} place={'top'} effect={'solid'} data-multiline={true}>
            <div className={'ic-image-help'}>
              <h1>Troubleshooting</h1>
              <br/>
              <p>
                To insert an image from Google Images, click once to expand the image, then <u>Right Click > Copy Image Address</u> and paste in the link.
              </p>
              <br/>
              <p>
                To insert an image from Google Drive, go that image and click on <u>Share > Get Shareable Link</u>, and use the link given (the link should end with "usp=sharing").
              </p>
            </div>
          </ReactTooltip>
        </p>
        {img}
      </div>
    );
  };

  submit = () => {
    this.props.submit(this.state.imgSource);
  };

  switchText = () => {
    this.socket.emitMetric('switch image to text');
    this.props.uiX.switchToText();
  };

  switchDoodle = () => {
    this.socket.emitMetric('switch image to doodle');
    this.props.uiX.switchToDoodle();
  };

  renderSwitches = () => {
    return (
      <div>
        <button className={'switch-form'}
                data-tip="Create a text note"
                data-for="text-tooltip"
                onClick={this.switchText}>
          <i className={'material-icons'}>text_format</i>
        </button>
        <ReactTooltip id={'text-tooltip'} place={'top'} effect={'solid'}/>
        <button className={'switch-form'}
                data-tip="Create a sketch"
                data-for="doodle-tooltip"
                onClick={this.switchDoodle}>
          <i className={'material-icons'}>brush</i>
        </button>
        <ReactTooltip id={'doodle-tooltip'} place={'top'} effect={'solid'}/>
      </div>
    );
  };

  render() {
    return (
      <div className="ic-modal ic-form" id="ic-image-form">
        <div className="ic-modal-contents">
          <div className="ic-modal-header">
            <h1 className="ic-modal-title">{this.props.title}</h1>
          </div>
          <textarea id="ic-form-text"
                    autoFocus
                    value={this.state.imgSource}
                    onChange={this.handleChange}
                    style={{ background: this.props.bg }} />
          {this.renderPreview()}
          <div className="note-form-footer">
            {this.props.switch && this.renderSwitches()}
            <button name="ship" onClick={this.submit}>ship it</button>
            <button name="nvm" onClick={this.props.close}>never mind</button>
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(() => ({}), mapDispatchToProps)(ImageForm);
