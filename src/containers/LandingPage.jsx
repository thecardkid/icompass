'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserHistory, Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as uiActions from 'Actions/ui';

import BookmarkList from 'Components/BookmarkList.jsx';

import Modal from 'Utils/Modal.jsx';
import Socket from 'Utils/Socket.jsx';
import Toast from 'Utils/Toast.jsx';
import Validator from 'Utils/Validator.jsx';

import { ERROR_MSG } from 'Lib/constants';

const LOGIN_TYPE = {
  MAKE: 0,
  FIND: 1,
};

class LandingPage extends Component {
  constructor(props) {
    super(props);
    this.toast = new Toast();
    this.modal = new Modal();

    this.socket = new Socket(this);
    this.state = { loginType: null };

    this.props.uiActions.setScreenSize(window.innerWidth, window.innerHeight);
  }

  componentDidMount() {
    $(window).on('resize', this.props.uiActions.resize);
  }

  componentWillUnmount() {
    $(window).off('resize', this.props.uiActions.resize);
  }

  setLoginType = (type) => {
    $('#compass-center').val('');
    $('#compass-code').val('');
    $('#username').val('');
    this.setState({ data: null, loginType: type });
  };

  validateFindInput = () => {
    let code = Validator.validateCompassCode($('#compass-code').val());
    let username = Validator.validateUsername($('#username').val());

    if (!code[0]) return this.modal.alert(code[1]);
    if (!username[0]) return this.modal.alert(username[1]);

    this.setState({ username: username[1] });
    this.socket.emitFindCompass(code[1], username[1]);
  };

  validateMakeInput = () => {
    let center = Validator.validateCenter($('#compass-center').val());
    let username = Validator.validateUsername($('#username').val());

    if (!center[0]) return this.modal.alert(center[1]);
    if (!username[0]) return this.modal.alert(username[1]);

    this.setState({ username: username[1] });
    this.socket.emitCreateCompass(center[1], username[1]);
  };

  renderChooseMode = () => {
    return (
      <div className="section">
        <h1>Are you making or finding a compass?</h1>
        <button className="ic-button" name="make" onClick={() => this.setLoginType(LOGIN_TYPE.MAKE)}>making</button>
        <button className="ic-button" name="find" onClick={() => this.setLoginType(LOGIN_TYPE.FIND)}>finding</button>
      </div>
    );
  };

  renderFindInput = () => {
    return (
      <div className="section">
        <h1>I need some info</h1>
        <div className="response">
          <input id="compass-code"
                 placeholder="The code of the compass you're looking for"
                 autoCorrect="off"
                 autoCapitalize="none"/>
        </div>
        <div className="response">
          <input id="username"
                 placeholder={'Your name (as you\'d like it to appear, no spaces)'}/>
        </div>
        <button className="ic-button" name="next" onClick={this.validateFindInput}>next</button>
      </div>
    );
  };

  renderMakeInput = () => {
    return (
      <div className="section">
        <h1>I need some info</h1>
        <div className="response">
          <input id="compass-center"
                 placeholder="Topic: Who's involved?"/>
        </div>
        <div className="response">
          <input id="username"
                 placeholder={'Your name (as you\'d like it to appear, no spaces)'}/>
        </div>
        <button className="ic-button" name="next" onClick={this.validateMakeInput}>next</button>
      </div>
    );
  };

  renderModeInput = () => {
    if (this.state.loginType === LOGIN_TYPE.FIND) {
      return this.renderFindInput();
    } else if (this.state.loginType === LOGIN_TYPE.MAKE) {
      return this.renderMakeInput();
    }

    return null;
  };

  getNullNotification = () => {
    let error = <h2>I couldn&apos;t find your compass. Do you have the right code?</h2>;
    if (this.state.loginType === LOGIN_TYPE.MAKE)
      error = (
        <h2>Something went wrong. I&apos;tm not sure what. Please
          <Link to='https://github.com/thecardkid/innovators-compass/issues'>submit a bug</Link>
        </h2>
      );

    return (
      <div className="section third">
        <h1>Sorry!</h1>
        {error}
      </div>
    );
  };

  toWorkspace = () => {
    let email = $('#email').val();
    let valid = Validator.validateEmail(email);
    let d = this.state.data, u = this.state.username;
    let mode = d.viewOnly ? 'view' : 'edit';

    if (email && !valid[0]) return this.toast.error(ERROR_MSG.INVALID('Email'));
    if (email && valid[0]) this.socket.emitSendMail(d.code, d.center, u, email);

    switch (this.state.loginType) {
      case LOGIN_TYPE.MAKE:
        return browserHistory.push(`/compass/edit/${d.code}/${u}`);

      case LOGIN_TYPE.FIND:
        return browserHistory.push(`/compass/${mode}/${d.code}/${u}`);
    }
  };

  getMakeSuccessNotification = () => {
    return (
      <div className="section third">
        <h1>success</h1>
        <h2>Your workspace is ready. If you would like me to email you a link to your workspace, enter your email below.
          I won&apos; keep your email address or send you spam.</h2>
        <input id="email" type="text"/>
        <button className="ic-button" name="to-workspace" onClick={this.toWorkspace}>let&apos;s go</button>
      </div>
    );
  };

  getFindSuccessNotification = (viewOnly) => {
    let mode = viewOnly ? 'View-only' : 'Edit';
    return (
      <div className="section third">
        <h1>{mode} access</h1>
        <h2>You will be logged in as {this.state.username}</h2>
        <button className="ic-button" name="to-workspace" onClick={this.toWorkspace}>to workspace</button>
      </div>
    );
  };

  renderFetchResult = () => {
    if (typeof this.state.data !== 'object' || this.state.data === null) return;

    if (!this.state.data.success)
      return this.getNullNotification();

    if (this.state.loginType === LOGIN_TYPE.MAKE)
      return this.getMakeSuccessNotification();

    if (this.state.loginType === LOGIN_TYPE.FIND)
      return this.getFindSuccessNotification(this.state.data.viewOnly);
  };

  render() {
    let w = this.props.ui.vw - 200;
    let loginStyle = {
      width: Math.min(600, w),
      marginLeft: Math.max(0, this.props.ui.vw - 200 - 600) / 2,
    };

    return (
      <div>
        <BookmarkList/>
        <div id="ic-landing-container" style={{ width: w }}>
          <div id="ic-landing" style={loginStyle}>
            <h1 id="ic-welcome">Welcome to Innovators' Compass!<br/> Powerful questions, and space to explore them, to
              make anything better</h1>
            <div id="ic-tour"><Link to="/tutorial">First-timer? Take the tour!</Link></div>
            {this.renderChooseMode()}
            {this.renderModeInput()}
            {this.renderFetchResult()}
          </div>
        </div>
      </div>
    );
  }
}

LandingPage.propTypes = {
  ui: PropTypes.object.isRequired,
  uiActions: PropTypes.objectOf(PropTypes.func).isRequired,
};

function mapStateToProps(state) {
  return {
    ui: state.ui,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    uiActions: bindActionCreators(uiActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);
