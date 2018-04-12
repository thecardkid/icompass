import $ from 'jquery';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory, Link } from 'react-router';
import Tappable from 'react-tappable/lib/Tappable';
import { bindActionCreators } from 'redux';

import * as uiX from '../actions/ui';

import BookmarkList from '../components/BookmarkList.jsx';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket.js';
import Toast from '../utils/Toast';

import { ERROR_MSG, REGEX } from '../../lib/constants';

const FORM_TYPE = { MAKE: 0, FIND: 1 };

class LandingPage extends Component {
  constructor(props) {
    super(props);
    this.toast = Toast.getInstance();
    this.modal = Modal.getInstance();
    this.state = { formType: FORM_TYPE.MAKE };

    this.socket = Socket.getInstance();
    this.socket.subscribe({
      'compass ready': this.onCompassReady,
    });

    this.props.uiX.setScreenSize(window.innerWidth, window.innerHeight);
  }

  componentDidMount() {
    this.start = Date.now();
    $(window).on('resize', this.props.uiX.resize);
  }

  componentWillUnmount() {
    $(window).off('resize', this.props.uiX.resize);
  }

  onCompassReady = (data) => {
    this.setState({ data });
  };

  setFormType = (type) => () => {
    $('#compass-center').val('');
    $('#compass-code').val('');
    $('#username').val('');
    this.setState({ data: null, formType: type });
  };

  validateFindInput = (e) => {
    e.preventDefault();

    const code = this.refs.code.value;
    const username = this.refs.username.value;

    if (code.length !== 8) {
      return this.modal.alert(ERROR_MSG.INVALID('Your code'));
    }

    if (!REGEX.CHAR_ONLY.test(username)) {
      return this.modal.alert(ERROR_MSG.UNAME_HAS_NON_CHAR);
    }

    this.setState({ username });
    this.socket.emitFindCompass(code, username);
    this.socket.emitMetricLandingPage(this.start, Date.now(), 'find');
  };

  validateMakeInput = (e) => {
    e.preventDefault();

    const topic = this.refs.topic.value;
    const username = this.refs.username.value;

    if (!REGEX.CHAR_ONLY.test(username)) {
      return this.modal.alert(ERROR_MSG.UNAME_HAS_NON_CHAR);
    }

    this.setState({ username });
    this.socket.emitCreateCompass(topic, username);
    this.socket.emitMetricLandingPage(this.start, Date.now(), 'create');
  };

  renderFindForm = () => {
    return (
      <form onSubmit={this.validateFindInput}>
        <input id="compass-code"
               ref="code"
               required
               placeholder="The code of the compass you're looking for"
               maxLength={8}
               autoCorrect="off"
               autoCapitalize="none" />
        <input id="username"
               ref="username"
               maxLength={15}
               required
               placeholder={'Your name (as you\'d like it to appear, no spaces)'} />
        <input type="submit"
               value="submit" />
      </form>
    );
  };

  renderMakeForm = () => {
    return (
      <form onSubmit={this.validateMakeInput}>
        <input id="compass-center"
               ref="topic"
               required
               maxLength={30}
               placeholder="Topic" />
        <input id="username"
               ref="username"
               maxLength={15}
               required
               placeholder={'Your name (as you\'d like it to appear, no spaces)'} />
        <input type="submit"
               value="submit" />
      </form>
    );
  };

  renderForm = () => {
    if (this.state.formType === FORM_TYPE.FIND) {
      return this.renderFindForm();
    } else if (this.state.formType === FORM_TYPE.MAKE) {
      return this.renderMakeForm();
    }

    return null;
  };

  alertError = () => {
    if (this.state.formType === FORM_TYPE.FIND) {
      this.modal.alert('I couldn\'t find your compass. Do you have the right code?');
    } else if (this.state.formType === FORM_TYPE.MAKE) {
      this.modal.alert('Some thing went wrong. Please submit a bug at https://github.com/thecardkid/innovators-compass/issues');
    }
  };

  promptForEmail = () => {
    this.modal.promptForEmail((status, email) => {
      if (!status) {
        this.toast.warn('You need to complete this action');
        return this.promptForEmail();
      }

      if (!email.length) {
        const { code } = this.state.data;
        return browserHistory.push(`/compass/edit/${code}/${this.state.username}`);
      }

      if (REGEX.EMAIL.test(email)) {
        const { code } = this.state.data;
        this.socket.emitSendMail(code, this.state.username, email);
        return browserHistory.push(`/compass/edit/${code}/${this.state.username}`);
      }

      this.toast.error(`"${email}" is not a valid email address`);
      this.promptForEmail();
    });
  };

  notifyPrivileges = (viewOnly) => {
    let mode = viewOnly ? 'view-only' : 'edit';
    this.modal.alert(`You will be logged in as "${this.state.username}" with ${mode} access.`, () => {
      browserHistory.push(`/compass/view/${this.state.data.code}/${this.state.username}`);
    });
  };

  renderFetchResult = () => {
    if (typeof this.state.data !== 'object' || this.state.data === null) return;

    if (!this.state.data.success)
      return this.alertError();

    if (this.state.formType === FORM_TYPE.MAKE)
      return this.promptForEmail();

    if (this.state.formType === FORM_TYPE.FIND)
      return this.notifyPrivileges(this.state.data.viewOnly);
  };

  render() {
    const active = this.state.formType === FORM_TYPE.MAKE;

    return (
      <div>
        <Tappable onTap={this.toast.clear}>
          <div id="ic-toast" onClick={this.toast.clear} />
        </Tappable>
        <BookmarkList start={this.start}/>
        <div id="ic-landing-container" style={{ width: this.props.ui.vw - 200 }}>
          <div id="ic-landing">
            <h1 id="ic-welcome">Welcome to Innovators' Compass!<br/> Powerful questions, and space to explore them, to
              make anything better</h1>
            <div id="ic-tour"><Link to="/tutorial">First-timer? Take the tour!</Link></div>

            <div className="form section">
              <div id="header">
                <div className={active ? 'active' : ''}
                     name="make"
                     onClick={this.setFormType(FORM_TYPE.MAKE)}>
                  create workspace
                </div>
                <div className={active ? '' : 'active'}
                     name="find"
                     onClick={this.setFormType(FORM_TYPE.FIND)}>
                  find workspace
                </div>
              </div>
              {this.renderForm()}
            </div>
            {this.renderFetchResult()}
          </div>
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
