import React, { Component } from 'react';
import { Link } from 'react-router';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket';

import { COLORS } from '../../lib/constants';

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
    this.modal.alertPrivacyStatement();
    this.hideMenu();
  };

  openPrompt = () => {
    this.modal.alertCompassPrompt();
    this.hideMenu();
  };

  openReleaseNotes = () => {
    this.hideMenu();
  };

  showFeedback = () => {
    this.modal.alertFeedback(this.props.editCode);
    this.hideMenu();
  };

  showAboutUs = () => {
    this.modal.alertAboutUs();
    this.hideMenu();
  };

  renderHelpMenu() {
    return (
      <div className={'ic-menu ic-help-menu'}>
        <section className={'border-bottom'}>
          <div className={'ic-menu-item'} onClick={this.openPrompt}>
            Get Started
          </div>
          <Link to={'https://www.youtube.com/watch?v=3IbxFHQ5Dxo&feature=youtu.be'} target={'_blank'} onClick={this.hideMenu}>
            <div className={'ic-menu-item'}>
              iCompass Guide
            </div>
          </Link>
        </section>
        <section>
          <div className={'ic-menu-item'} onClick={this.showAboutUs}>
            About Us
          </div>
          <div className={'ic-menu-item'} onClick={this.showPrivacyStatement}>
            Privacy Statement
          </div>
          <Link to={'https://github.com/thecardkid/icompass/releases'} target={'_blank'} onClick={this.openReleaseNotes}>
            <div className={'ic-menu-item'}>
              What's new?
            </div>
          </Link>
          <div className={'ic-menu-item'} onClick={this.showFeedback}>
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
                style={{background: this.state.active ? COLORS.BLUE : ''}}
             onClick={this.toggleMenu}>
          ?
        </button>
        {this.state.active && this.renderHelpMenu()}
      </div>
    );
  }
}
