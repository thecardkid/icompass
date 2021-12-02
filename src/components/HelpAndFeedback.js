import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';

import FeedbackModal from './modals/FeedbackModal';
import * as uiX from '@actions/ui';
import { trackFeatureEvent } from '@utils/analytics';
import { CSS } from '@utils/constants';

import { helpMenu } from '@cypress/data_cy';
import { AboutUsModal, PrivacyStatementModal, WhatsNewModal } from './modals/SimpleModal';
import GetStartedModal from './modals/GetStartedModal';

const helpButtonClass = 'ic-help-toggler';

class HelpAndFeedback extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
    };
    document.addEventListener('click', (e) => {
      const { classList } = e.target;
      if (!classList.contains('ic-menu-item')
        && !classList.contains(helpButtonClass)) {
        this.hideMenu();
      }
    }, true);
  }

  toggleMenu = () => {
    this.setState(state => {
      const active = !state.active;
      if (active) {
        trackFeatureEvent('Help menu: View');
      }
      return { active };
    });
  };

  hideMenu = () => {
    this.setState({ active: false });
  };

  showPrivacyStatement = () => {
    ReactGA.modalview('modals/privacy-statement');
    this.props.uiX.openPrivacyStatementModal();
    this.hideMenu();
  };

  openPrompt = () => {
    this.props.uiX.openGetStartedModal();
    this.hideMenu();
  };

  showWhatsNew = () => {
    ReactGA.modalview('modals/whats-new');
    this.props.uiX.openWhatsNewModal();
    this.hideMenu();
  };

  showAboutUs = () => {
    ReactGA.modalview('modals/about-us');
    this.props.uiX.openAboutUsModal();
    this.hideMenu();
  };

  openFeedbackModal = () => {
    this.props.uiX.openFeedbackModal();
    this.hideMenu();
  }

  renderHelpMenu() {
    return (
      <div className={'ic-menu ic-help-menu'}>
        <section className={'border-bottom'}>
          <div data-cy={helpMenu.getStarted} className={'ic-menu-item'} onClick={this.openPrompt}>
            <i className={'material-icons'}>play_arrow</i>
            Get Started
          </div>
          <a data-cy={helpMenu.guide} href={'https://youtu.be/qL4Pt9GnvJ0'} target={'_blank'} onClick={this.hideMenu}>
            <div className={'ic-menu-item'}>
              <i className={'material-icons'}>ondemand_video</i>
              iCompass Guide
            </div>
          </a>
        </section>
        <section className={'border-bottom'}>
          <div data-cy={helpMenu.aboutUs} className={'ic-menu-item'} onClick={this.showAboutUs}>
            <i className={'material-icons'}>person</i>
            About Us
          </div>
          <div data-cy={helpMenu.privacyStatement} className={'ic-menu-item'} onClick={this.showPrivacyStatement}>
            <i className={'material-icons'}>lock</i>
            Privacy Statement
          </div>
          <div data-cy={helpMenu.whatsNew} className={'ic-menu-item'} onClick={this.showWhatsNew}>
            <i className={'material-icons'}>new_releases</i>
            What's New?
          </div>
          <div data-cy={helpMenu.leaveFeedback} className={'ic-menu-item'} onClick={this.openFeedbackModal}>
            <i className={'material-icons'}>feedback</i>
            Leave Feedback
          </div>
        </section>
        <section>
          <a data-cy={helpMenu.github} href={'https://github.com/thecardkid/icompass'} target={'_blank'} onClick={this.hideMenu}>
            <div className={'ic-menu-item github'}>
              <svg width="20" height="20"
                   viewBox="0 0 24 24">
                <path d="M10.9,2.1c-4.6,0.5-8.3,4.2-8.8,8.7c-0.5,4.7,2.2,8.9,6.3,10.5C8.7,21.4,9,21.2,9,20.8v-1.6c0,0-0.4,0.1-0.9,0.1 c-1.4,0-2-1.2-2.1-1.9c-0.1-0.4-0.3-0.7-0.6-1C5.1,16.3,5,16.3,5,16.2C5,16,5.3,16,5.4,16c0.6,0,1.1,0.7,1.3,1c0.5,0.8,1.1,1,1.4,1 c0.4,0,0.7-0.1,0.9-0.2c0.1-0.7,0.4-1.4,1-1.8c-2.3-0.5-4-1.8-4-4c0-1.1,0.5-2.2,1.2-3C7.1,8.8,7,8.3,7,7.6C7,7.2,7,6.6,7.3,6 c0,0,1.4,0,2.8,1.3C10.6,7.1,11.3,7,12,7s1.4,0.1,2,0.3C15.3,6,16.8,6,16.8,6C17,6.6,17,7.2,17,7.6c0,0.8-0.1,1.2-0.2,1.4 c0.7,0.8,1.2,1.8,1.2,3c0,2.2-1.7,3.5-4,4c0.6,0.5,1,1.4,1,2.3v2.6c0,0.3,0.3,0.6,0.7,0.5c3.7-1.5,6.3-5.1,6.3-9.3 C22,6.1,16.9,1.4,10.9,2.1z"></path>
              </svg>
              <span>GitHub</span>
            </div>
          </a>
        </section>
      </div>
    );
  }

  render() {
    return (
      <div id={'ic-help'}>
        <button className={'ic-help-button floating-button ' + helpButtonClass}
                style={{background: this.state.active ? CSS.COLORS.BLUE : ''}}
                onClick={this.toggleMenu}>
          <span className={helpButtonClass}>?</span>
        </button>
        {this.state.active && this.renderHelpMenu()}
        <GetStartedModal />
        <AboutUsModal />
        <FeedbackModal />
        <PrivacyStatementModal />
        <WhatsNewModal />
      </div>
    );
  }
}

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HelpAndFeedback);
