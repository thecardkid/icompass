import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ReactTooltip from 'react-tooltip';

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
    this.setState({ imgSource: e.target.value });
  };

  renderPreview = () => {
    let img;
    if (REGEX.URL.test(this.state.imgSource)) {
      img = <img src={this.state.imgSource} />;
    }

    return (
      <div className="preview">
        <p>
          Preview <span><i className={'material-icons'}>help</i></span>
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

  render() {
    return (
      <div className="ic-modal ic-form" id="ic-image-form">
        <div className="ic-modal-contents">
          <div className="ic-modal-header">
            <h1 className="ic-modal-title">Insert an image</h1>
          </div>
          <textarea id="ic-form-text"
                    autoFocus
                    value={this.state.imgSource}
                    onChange={this.handleChange}
                    style={{ background: this.props.bg }} />
          {this.renderPreview()}
          <div className="note-form-footer">
            <div>
              <button className={'switch-form'} data-tip="Create a text note" data-for="image-tooltip" onClick={this.switchText}>
                <i className={'material-icons'}>text_format</i>
              </button>
              <ReactTooltip id={'image-tooltip'} place={'top'} effect={'solid'}/>
              <button className={'switch-form'} data-tip="Insert a doodle" data-for="doodle-tooltip" onClick={this.switchDoodle}>
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

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(() => ({}), mapDispatchToProps)(ImageForm);
