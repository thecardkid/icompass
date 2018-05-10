import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ReactTooltip from 'react-tooltip';

import FormPalette from './FormPalette';
import ShortcutManager from '../ShortcutManager';

import * as uiX from '../../actions/ui';

import { PROMPTS } from '../../../lib/constants';
import ModalSingleton from '../../utils/Modal';
import SocketSingleton from '../../utils/Socket';

class TextForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      style: {
        bold: false,
        italic: false,
        underline: false,
        ...props.defaultStyle,
      },
      color: props.bg,
      charCount: (props.defaultText || '').length,
    };

    this.modal = ModalSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
  }

  _handleShortcuts = (e) => {
    if (e.metaKey) {
      switch(e.which) {
        case 66:
          this.toggleStyle('bold')();
          break;

        case 73:
          this.toggleStyle('italic')();
          break;

        case 85:
          this.toggleStyle('underline')();
          break;
      }
    }
  };

  toggleStyle = (style) => () => {
    this.setState({
      style: {
        ...this.state.style,
        [style]: !this.state.style[style]
      },
    });
  };

  setColor = (color) => () => {
    this.setState({ color });
    this.props.uiX.changeFormColor(color);
  };

  handleChange = () => {
    this.setState({ charCount: this.refs.text.value.length });
  };

  submit = (isDraft) => () => {
    const text = this.refs.text.value;

    if (text.length === 0) return;

    if (text.length > 300) {
      return this.toast.error(PROMPTS.POST_IT_TOO_LONG);
    }

    this.props.submit(text, false, this.state, isDraft);
  };

  renderStyleToolbar() {
    const { bold, italic, underline } = this.state.style;

    return (
      <div>
        <div className="ic-text-ibu">
          <button name="underline"
                  className={underline ? 'active' : ''}
                  onClick={this.toggleStyle('underline')}>
            <u>U</u>
          </button>
          <button name="italic"
                  className={italic ? 'active' : ''}
                  onClick={this.toggleStyle('italic')}>
            <i>I</i>
          </button>
          <button name="bold"
                  className={bold ? 'active' : ''}
                  onClick={this.toggleStyle('bold')}>
            <b>B</b>
          </button>
        </div>
        {this.props.colors && <FormPalette setColor={this.setColor}/>}
      </div>
    );
  }

  switchImage = () => {
    this.socket.emitMetric('switch text to image');
    this.props.uiX.switchToImage();
  };

  switchDoodle = () => {
    this.socket.emitMetric('switch text to doodle');
    this.props.uiX.switchToDoodle();
  };

  renderSwitches = () => {
    return (
      <div>
        <button className={'switch-form switch-image'}
                data-tip="Insert a photo"
                data-for="image-tooltip"
                onClick={this.switchImage}>
          <i className={'material-icons'}>photo</i>
        </button>
        <ReactTooltip id={'image-tooltip'} place={'bottom'} effect={'solid'}/>
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

  dontClose(e) {
    e.stopPropagation();
  }

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

  render() {
    const spanStyle = { color: this.state.charCount > 300 ? 'red' : 'black' };

    let textStyle = '';
    if (this.state.style.bold) textStyle += 'bold ';
    if (this.state.style.italic) textStyle += 'italic ';
    if (this.state.style.underline) textStyle += 'underline';

    return (
      <div id={'ic-backdrop'} onClick={this.props.close}>
        <ShortcutManager handle={this._handleShortcuts} formShortcut={true}/>
        <div className="ic-form" id="ic-note-form" onClick={this.dontClose}>
          <div className="contents">
            <div className="header">
              <h1 className={'title'}>
                {this.props.title}
                <span style={spanStyle}> {this.state.charCount}/300</span>
              </h1>
              {this.renderStyleToolbar()}
            </div>
            <textarea id="ic-form-text"
                      className={textStyle}
                      ref={'text'}
                      autoFocus
                      defaultValue={this.props.defaultText || ''}
                      onChange={this.handleChange}
                      style={{ background: this.state.color }}/>
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

export default connect(() => ({}), mapDispatchToProps)(TextForm);
