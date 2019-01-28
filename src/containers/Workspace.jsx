import $ from 'jquery';
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import request from 'superagent';
import _ from 'underscore';

import * as compassX from '../actions/compass';
import * as noteX from '../actions/notes';
import * as uiX from '../actions/ui';
import * as userX from '../actions/users';
import * as workspaceX from '../actions/workspace';

import BulkEditToolbar from '../components/BulkEditToolbar.jsx';
import Compass from '../components/Compass.jsx';
import HelpAndFeedback from '../components/HelpAndFeedback';
import FormManager from '../components/forms/FormManager.jsx';
import ShareModal from '../components/ShareModal';
import WorkspaceMenu from '../components/WorkspaceMenu';
import MaybeTappable from '../utils/MaybeTappable';

import { isWebdriverIO } from '../utils/Browser';
import Modal from '../utils/Modal';
import Socket from '../utils/Socket';
import Storage from '../utils/Storage';
import Toast from '../utils/Toast';

import { EDITING_MODE, REGEX } from '../../lib/constants';
import { browserHistory } from 'react-router';

class Workspace extends Component {
  constructor(props) {
    super(props);
    this.toast = Toast.getInstance();
    this.modal = Modal.getInstance();

    if (this.props.route.viewOnly) {
      request.get('/api/v1/workspace/view')
        .query({ id: this.props.params.code })
        .end((err, res) => {
          if (err || !res.body || res.body.compass == null) {
            return void this.alertNotFound();
          }

          this.onCompassFound(res.body);
        });
      ReactGA.pageview('/compass/view/');
    } else if (this.validateRouteParams(this.props.params)) {
      this.socket = Socket.getInstance();
      this.socket.subscribe({
        'compass found': this.onCompassFound,
        'compass deleted': this.onCompassDeleted,
        'user joined': this.onUserJoined,
        'user left': this.onUserLeft,
        'disconnect': () => this.toast.error('Lost connection to server'),
        'reconnect': this.handleReconnect,
        'bad username': this.handleBadUsername,
        'username exists': this.handleUsernameExists,
      });
      this.socket.emitFindCompassEdit(this.props.params);
      ReactGA.pageview('/compass/edit/');
    }

    this.props.uiX.setScreenSize(window.innerWidth, window.innerHeight);
  }

  handleReconnect = () => {
    this.toast.success('Established connection to server');
    this.socket.onReconnect({
      editCode: this.mustGetEditCode(),
      users: this.props.users,
    });
  };

  handleBadUsername = () => {
    this.modal.alert({
      heading: 'Please fix your username',
      body: [
        'Usernames can only contain letters, and shorter than 15 characters.',
        'Click "OK" to pick a new one.',
      ],
      cb: () => browserHistory.push(`/compass/edit/${this.props.params.editCode}`),
    });
  };

  handleUsernameExists = () => {
    this.modal.alert({
      heading: 'Whoops..',
      body: [
        'Someone already took that username',
        'Click "OK" to pick a new one',
      ],
      cb: () => browserHistory.push(`/compass/edit/${this.props.params.editCode}`),
    });
  };

  mustGetEditCode() {
    const editCodeRegex = /[a-zA-Z0-9]{8}/;
    if (this.props.compass && this.props.compass.editCode && editCodeRegex.test(this.props.compass.editCode)) {
      return this.props.compass.editCode;
    }
    if (this.props.params.code && editCodeRegex.test(this.props.params.code)) {
      return this.props.params.code;
    }
    this.modal.alert({
      heading: 'Sorry!',
      body: 'There was a problem retrieving your workspace. Please copy and paste the workspace link you received and refresh the page.',
    });
  }

  alertNotFound() {
    ReactGA.exception({
      description: 'Workspace not found',
    });
    this.modal.alert({
      heading: 'Workspace not found',
      body: [
        'Please check the code you provided. The permissions (edit/view) and the code might not match.',
        'You will now be directed to the login page',
      ],
      cb: () => browserHistory.push('/'),
    });
  }

  onCompassFound = (data) => {
    if (data.compass === null) {
      return void this.alertNotFound();
    }

    this.props.compassX.set(data.compass, data.viewOnly);
    this.props.noteX.updateAll(data.compass.notes);
    this.props.workspaceX.setEditCode(data.compass.editCode);
    this.props.userX.me(data.username);

    // Skip notifying feature changes if the workspace is being
    // created.
    if (data.compass.center.length > 0) {
      this.notifyIfNewVersion();
    }
  };

  onCompassDeleted = () => {
    this.modal.alert({
      heading: 'Workspace Deleted',
      body: 'You will now be redirected to the home page.',
      cb: () => browserHistory.push('/'),
    });
  };

  onUserJoined = (data) => {
    this.props.userX.update(data);
  };

  onUserLeft = (data) => {
    this.props.userX.update(data);
  };

  validateRouteParams({ code, username }) {
    let validCode = true,
      validUsername = true;

    if (code.length !== 8) validCode = false;
    if (!REGEX.CHAR_ONLY.test(username) || username.length > 15) validUsername = false;

    if (validCode && validUsername) {
      return true;
    }

    ReactGA.exception({
      description: `Invalid URL params {code: "${validCode}", username: "${validUsername}"}`,
    });
    this.modal.alertRouteErrors(validCode, validUsername);
  }

  componentDidMount() {
    $(window).on('resize', this.props.uiX.resize);
  }

  notifyIfNewVersion = ({ mustShow = false } = {}) => {
    const appVersion = 'v2.3.0';
    // mustShow overrides automatic decision-making
    if (mustShow || (!isWebdriverIO() && Storage.getVersion() !== appVersion)) {
      Storage.setVersion(appVersion);

      this.modal.alert({
        heading: `${appVersion} Release!!`,
        body: [
          'New features:',
          [
            '● Workspace topic is now visible in the top right corner',
            '● Check a box when creating a new workspace to always receive an email',
          ].join('<br/>'),
          // 'See the full list <a href="https://github.com/thecardkid/icompass/releases" target="_blank"><u>here</u></a>.',
        ],
      });
    }
  };

  componentWillUnmount() {
    this.props.compassX.reset();
    this.props.noteX.reset();
    this.props.uiX.reset();
    this.props.userX.reset();
    $(window).off('resize', this.props.uiX.resize);
    this.modal.close();
    this.toast.clear();

    if (this.socket) this.socket.logout();
  }

  render() {
    if (_.isEmpty(this.props.compass)) return <div/>;

    if (this.props.route.viewOnly) {
      return <Compass viewOnly={true}/>;
    }

    let formAttrs = {
      bg: this.props.users.nameToColor[this.props.users.me],
      user: this.props.users.me,
      close: this.props.uiX.closeForm,
    };

    return (
      <div>
        <MaybeTappable onTapOrClick={this.toast.clear}>
          <div id={'ic-toast'} />
        </MaybeTappable>
        <HelpAndFeedback editCode={this.props.compass.editCode}
                         notifyVersionChanges={this.notifyIfNewVersion}
        />
        <WorkspaceMenu />
        <Compass />
        <BulkEditToolbar show={this.props.visualMode} />
        <FormManager commonAttrs={formAttrs} />
        <ShareModal show={this.props.ui.showShareModal}
                    close={this.props.uiX.hideShareModal}
                    compass={this.props.compass} />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    compass: state.compass,
    users: state.users,
    ui: state.ui,
    workspace: state.workspace,
    visualMode: state.ui.editingMode === EDITING_MODE.VISUAL || false,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    noteX: bindActionCreators(noteX, dispatch),
    compassX: bindActionCreators(compassX, dispatch),
    userX: bindActionCreators(userX, dispatch),
    uiX: bindActionCreators(uiX, dispatch),
    workspaceX: bindActionCreators(workspaceX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Workspace);
