import $ from 'jquery';
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import request from 'superagent';

import * as uiX from '../actions/ui';

import BookmarkList from '../components/BookmarkList.jsx';

import Modal from '../utils/Modal';
import Storage from '../utils/Storage';
import Toast from '../utils/Toast';
import DevOnly from '../utils/DevOnly';
import { sendReminderEmail } from '../utils/api';
import { isEmail, isCharOnly } from '../utils/regex';

class LandingPage extends Component {
  constructor(props) {
    super(props);
    this.toast = Toast.getInstance();
    this.modal = Modal.getInstance();

    ReactGA.pageview('/');
    this.props.uiX.resize();
  }

  componentDidMount() {
    $(window).on('resize', this.props.uiX.resize);
  }

  componentWillUnmount() {
    $(window).off('resize', this.props.uiX.resize);
  }

  validateMakeInput = async (e) => {
    e.preventDefault();

    const topic = this.refs.topic.value;
    const username = this.refs.username.value;

    if (!isCharOnly(username)) {
      return this.toast.error('Username cannot contain spaces or numbers, only letters.');
    }

    this.setState({ username });
    try {
      const resp = await request.post('/api/v1/workspace/create').send({ topic })
      const data = resp.body;
      if (data.error) {
        // Caught later on.
        throw new Error(data.error);
      }
      const alwaysSend = Storage.getAlwaysSendEmail();
      if (alwaysSend.enabled) {
        await sendReminderEmail({
          topic: data.topic,
          editCode: data.code,
          username,
          recipientEmail: alwaysSend.email,
          isAutomatic: true,
        });
        return browserHistory.push(`/compass/edit/${data.code}/${this.state.username}`);
      }
      this.setState({ data }, this.promptForEmail);
    } catch(err) {
      this.modal.alert({
        heading: 'Failed to create new workspace',
        body: 'An error has occurred',
      });
    }
  };

  automateSetup = async (e) => {
    e.preventDefault();
    const resp = await request.post('/api/v1/workspace/create_dev').send();
    if (resp.body.error) {
      alert(resp.body.error);
      return;
    }
    browserHistory.push(`/compass/edit/${resp.body.code}/dev`);
  };

  // TODO this is an atrocity.
  promptForEmail = () => {
    let alwaysSendChecked = false;
    this.modal.promptForEmail(
      async (hasValue, email) => {
        const { username, data: { code, topic } } = this.state;
        if (hasValue) {
          if (!isEmail(email)) {
            this.toast.error(`"${email}" is not a valid email address`);
            return this.promptForEmail();
          }

          if (alwaysSendChecked) {
            Storage.setAlwaysSendEmail(true, email);
          }

          await sendReminderEmail({
            topic: topic,
            editCode: code,
            username,
            recipientEmail: email,
            isAutomatic: false,
          });
        }
        return browserHistory.push(`/compass/edit/${code}/${username}`);
      },
      (enabled) => {
        alwaysSendChecked = enabled;
      },
    );
  };

  sizeImage() {
    const r = 1.9174434087882823;
    const { vw, vh } = this.props.ui;
    const screenRatio = vw / vh;

    if (screenRatio <= r) {
      return {
        width: r * vh,
        height: vh,
      };
    } else {
      return {
        width: vw,
        height: vw / r,
      };
    }
  }

  render() {
    return (
      <div id={'ic-landing'}>
        <img src={'https://s3.us-east-2.amazonaws.com/innovatorscompass/landing.jpg'} className={'ic-background'} style={this.sizeImage()}/>
        <BookmarkList />
        <div id={'ic-landing-container'}>
          <div id={'message'}>
            <h1>Innovators' Compass</h1>
            <h2>Powerful questions, and space to explore them, to make anything better.</h2>
          </div>
          <div id={'get-started-form'}>
            <form onSubmit={this.validateMakeInput}>
              <p>What topic are you working on?</p>
              <input id="compass-center"
                     ref="topic"
                     required />
              <p>Your name</p>
              <input id="username"
                     ref="username"
                     maxLength={15}
                     required />
              <div className={'ic-show-privacy-statement'} onClick={this.modal.alertPrivacyStatement}>
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
          <a href={'https://youtu.be/3IbxFHQ5Dxo'} className={'ic-guide'}>
            First-timer? Watch this <u>short two-minute video</u>!
          </a>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    ui: state.ui,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);
