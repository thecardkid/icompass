import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { bindActionCreators } from 'redux';

import * as uiX from '../../actions/ui';

import { REGEX } from '../../../lib/constants';
import SocketSingleton from '../../utils/Socket';
import FormPalette from './FormPalette';

class ImageForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgSource: props.defaultUrl || '',
      color: props.bg,
    };
    this.socket = SocketSingleton.getInstance();
    this.driveUrlRegex = /https:\/\/drive\.google\.com\/file\/d\/.*\/view\?usp=sharing/;
  }

  handleChange = (e) => {
    const { value } = e.target;

    if (this.driveUrlRegex.test(value)) {
      const fileId = value.split('/')[5];
      const imgSource = `https://drive.google.com/thumbnail?id=${fileId}`;
      this.setState({ imgSource });
      return;
    }

    this.setState({ imgSource: value });
  };

  setColor = (color) => () => {
    this.setState({ color });
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

  submit = (isDraft) => () => {
    this.props.submit(this.state, isDraft);
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
        <button className={'switch-form switch-text'}
                data-tip="Create a text note"
                data-for="text-tooltip"
                onClick={this.switchText}>
          <i className={'material-icons'}>text_format</i>
        </button>
        <ReactTooltip id={'text-tooltip'} place={'bottom'} effect={'solid'}/>
        <button className={'switch-form switch-doodle'}
                data-tip="Create a sketch"
                data-for="doodle-tooltip"
                onClick={this.switchDoodle}>
          <i className={'material-icons'}>brush</i>
        </button>
        <ReactTooltip id={'doodle-tooltip'} place={'bottom'} effect={'solid'}/>
      </div>
    );
  };

  renderDraftButton = () => {
    return (
      <div>
        <button name={'draft'}
                onClick={this.submit(true)}
                data-tip="Drafts are invisible to others until you submit them"
                data-for="draft-tooltip"
        >Draft</button>
        <ReactTooltip id={'draft-tooltip'} place={'bottom'} effect={'solid'} delayShow={500}/>
      </div>
    );
  };

  dontClose(e) {
    e.stopPropagation();
  }

  render() {
    return (
      <div id={'ic-backdrop'} onClick={this.props.close}>
        <div className="ic-form" id="ic-image-form" onClick={this.dontClose}>
          <div className="contents">
            <div className="header">
              <h1 className="title">{this.props.title}</h1>
              {this.props.colors && <FormPalette setColor={this.setColor}/>}
            </div>
            <textarea id="ic-form-text"
                      autoFocus
                      value={this.state.imgSource}
                      onChange={this.handleChange}
                      style={{ background: this.state.color }} />
            {this.renderPreview()}
            <div className="note-form-footer">
              {this.props.switch && this.renderSwitches()}
              <button name="ship" onClick={this.submit(false)}>{this.props.switch ? 'Publish' : 'Edit'}</button>
              {this.props.switch && this.renderDraftButton()}
              <button name="nvm" onClick={this.props.close}>Cancel</button>
            </div>
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
