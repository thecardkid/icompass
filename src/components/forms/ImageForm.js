import React, { Component } from 'react';

export default class ImageForm extends Component {
  render() {
    const color = this.props.note.color || this.props.bg;

    return (
      <div className="ic-modal" id="ic-note-form" style={this.props.style}>
        <div className="ic-modal-contents">
          <div className="ic-modal-header">
            <h1 className="ic-modal-title">Insert an image</h1>
          </div>
          <textarea id="ic-form-text"
                    autoFocus
                    defaultValue={this.props.value || ''}
                    onChange={this.handleChange}
                    style={{ background: color }} />
          <div className="note-form-footer">
            <div>
              <button className={'switch-form'} data-tip="Create a text note" data-for="image-tooltip">
                <i className={'material-icons'}>text_format</i>
              </button>
              {/*<ReactTooltip id={'image-tooltip'} place={'top'} effect={'solid'}/>*/}
              <button className={'switch-form'} data-tip="Insert a doodle" data-for="doodle-tooltip">
                <i className={'material-icons'}>brush</i>
              </button>
              {/*<ReactTooltip id={'doodle-tooltip'} place={'top'} effect={'solid'}/>*/}
            </div>
            <button name="ship" onClick={this.make}>ship it</button>
            <button name="nvm" onClick={this.props.close}>never mind</button>
          </div>
        </div>
      </div>
    );
  }
}
