import classnames from 'classnames';
import React, { Component } from 'react';

export default class DynamicModal extends Component {
  dontClose(e) {
    e.stopPropagation();
  }

  close = () => {
    this.props.close();
  };

  render() {
    return (
      <div id={'ic-backdrop'} onClick={this.close}>
        <div className={classnames('ic-dynamic-modal', this.props.className)} onClick={this.dontClose}>
          <div className={'contents'}>
            <div className={'header'}>
              <h1 className={'title'}>{this.props.heading}</h1>
              <button className={'ic-close-window'} onClick={this.close}>
                <i className={'material-icons'}>close</i>
              </button>
            </div>
            <div className={'body'}>
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
