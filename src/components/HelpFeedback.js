import React, { Component } from 'react';
import Modal from '../utils/Modal';
import Socket from '../utils/Socket';

export default class HelpFeedback extends Component {
  constructor() {
    super();
    this.state = {
      active: false,
    };
    this.socket = Socket.getInstance();
    this.modal = Modal.getInstance();
  }

  toggleMenu = () => {
    this.setState({ active: !this.state.active });
  };

  hideMenu = () => {
    this.setState({ active: false });
  };

  showPrivacyStatement = () => {
    this.socket.emitMetric('help show privacy');
    this.modal.alertPrivacyStatement();
    this.hideMenu();
  };

  openPrompt = () => {
    this.socket.emitMetric('help prompt');
    this.modal.alertCompassPrompt();
    this.hideMenu();
  };

  openReleaseNotes = () => {
    this.socket.emitMetric('help release notes');
    window.open('https://github.com/thecardkid/icompass/releases', '_blank').focus();
    this.hideMenu();
  };

  showFeedback = () => {
    this.socket.emitMetric('help show feedback');
    this.modal.alertFeedback();
    this.hideMenu();
  };

  contactUs = () => {
    this.socket.emitMetric('help contact us');
    window.location.href = 'mailto:hieumaster95@gmail.com';
    this.hideMenu();
  };

  renderHelpMenu() {
    return (
      <div className={'ic-menu ic-help-menu'}>
        <section className={'border-bottom'}>
          <div className={'ic-menu-item'} onClick={this.openPrompt}>
            Prompt
          </div>
        </section>
        <section>
          <div className={'ic-menu-item'} onClick={this.openReleaseNotes}>
            Release Notes
          </div>
          <div className={'ic-menu-item'} onClick={this.showPrivacyStatement}>
            Privacy Statement
          </div>
          <div className={'ic-menu-item'} onClick={this.showFeedback}>
            Provide Feedback
          </div>
          <div className={'ic-menu-item'} onClick={this.contactUs}>
            Contact Us
          </div>
        </section>
      </div>
    );
  }

  render() {
    return (
      <div id={'ic-help'}>
        <button className={'ic-help-button floating-button'}
             onClick={this.toggleMenu}
             onBlur={this.hideMenu}>
          ?
          {this.state.active && this.renderHelpMenu()}
        </button>
      </div>
    );
  }
}
