import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import request from 'superagent';

import * as uiX from '@actions/ui';
import BookmarkList from '@components/BookmarkList.jsx';
import { PrivacyStatementModal } from '@components/modals/SimpleModal';
import Storage from '@utils/Storage';
import DevOnly from '@utils/DevOnly';
import getAPIClient from '@utils/api';
import { isCharOnly } from '@utils/regex';

class LandingPage extends Component {
  constructor(props) {
    super(props);

    if (this.props.location.query['tutorial']) {
      props.uiX.enableTutorial();
    }
  }

  submit = async (e) => {
    e.preventDefault();

    const topic = this.refs.topic.value;
    const username = this.refs.username.value;

    if (!isCharOnly(username)) {
      return this.props.uiX.toastError('Username cannot contain spaces or numbers, only letters.');
    }

    this.setState({ username });
    try {
      const data = await getAPIClient().createWorkspace({ topic });
      if (data === null) {
        return;
      }
      const alwaysSend = Storage.getAlwaysSendEmail();
      let redirectURL = `/compass/edit/${data.code}/${username}`;
      if (alwaysSend.enabled) {
        // `Await` here would block the critical path by a few seconds.
        getAPIClient().sendReminderEmail({
          topic: data.topic,
          editCode: data.code,
          username,
          recipientEmail: alwaysSend.email,
          isAutomatic: true,
        });
        redirectURL += '?autoEmail=1'
      }
      this.props.uiX.tutorialGoToStep(1);
      return browserHistory.push(redirectURL);
    } catch(err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  automateSetup = async (e) => {
    e.preventDefault();
    const resp = await request.post('/api/v1/workspace/create_dev').send();
    if (resp.body.error) {
      alert(resp.body.error);
      return;
    }
    const alwaysSend = Storage.getAlwaysSendEmail();
    let url = `/compass/edit/${resp.body.code}/dev?auto=1`;
    if (alwaysSend.enabled) {
      url += '&autoEmail=1';
    }
    browserHistory.push(url);
  };

  sizeImage() {
    const r = 1.9174434087882823;
    const { vw, vh } = this.props.ui;
    const screenRatio = vw / vh;

    let width, height;
    if (screenRatio <= r) {
      width = r * vh;
      height = vh;
    } else {
      width = vw;
      height = vw / r;
    }

    // This is to hide the blurry borders of the image, caused
    // by filter: blur.
    const blurPx = 5;
    return {
      width: width + blurPx,
      height: height + blurPx,
      top: -(blurPx / 2),
      left: -(blurPx / 2),
    };
  }

  render() {
    const tutorialEnabled = this.props.ui.tutorial.enabled;

    return (
      <div id={'ic-landing'}>
        <img src={'https://innovatorscompass.s3.us-east-2.amazonaws.com/landingpage.jpg'} className={'ic-background'} style={this.sizeImage()}/>
        {this.props.workspace.supportLegacyBookmarks && <BookmarkList />}
        <PrivacyStatementModal />
        <div id={'ic-landing-container'}>
          <div id={'message'}>
            <h1>Innovators' Compass</h1>
            <h2>Powerful questions, and space to explore them, to make anything better.</h2>
          </div>
          <div id={'get-started-form'}>
            <form onSubmit={this.submit}>
              <p>What topic are you working on?</p>
              <input id="compass-center"
                     ref="topic"
                     required />
              <p>Your name</p>
              <input id="username"
                     ref="username"
                     maxLength={15}
                     required />
              <div className={'ic-show-privacy-statement'} onClick={this.props.uiX.openPrivacyStatementModal}>
                <u>Privacy Statement</u>
              </div>
              <br/>
              <button type={'submit'} id={'user-submit'}>
                Get started
                <i className="material-icons">arrow_forward</i>
              </button>
              <DevOnly>
                <button className={'automate-workspace-setup'} onClick={this.automateSetup}>
                  Automate Setup (only shown in development)
                </button>
              </DevOnly>
            </form>
          </div>
          {tutorialEnabled ? (
            <p className={'ic-guide'}>
              First-timer? Start the <u onClick={() => this.props.uiX.startTutorial(0)}>tutorial</u>.
            </p>
          ): (
            <a href={'https://youtu.be/qL4Pt9GnvJ0'} className={'ic-guide'}>
              First-timer? Watch this <u>short one-minute video</u>!
            </a>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    ui: state.ui,
    workspace: state.workspace,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);
