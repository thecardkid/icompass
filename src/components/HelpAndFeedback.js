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
          <a data-cy={helpMenu.guide} href={'https://www.youtube.com/watch?v=3IbxFHQ5Dxo&feature=youtu.be'} target={'_blank'} onClick={this.hideMenu}>
            <div className={'ic-menu-item'}>
              <i className={'material-icons'}>ondemand_video</i>
              iCompass Guide
            </div>
          </a>
        </section>
        <section>
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
      </div>
    );
  }

  render() {
    return (
      <div id={'ic-help'}>
        <button className={'ic-help-button floating-button'}
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
