import $ from 'jquery';
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
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
import CopyWorkspaceModal from '../components/modals/CopyWorkspaceModal';
import GDocModal from '../components/modals/GDocModal';
import ScreenshotModal from '../components/modals/ScreenshotModal';
import ShareModal from '../components/modals/ShareModal';
import WorkspaceMenu from '../components/WorkspaceMenu';

import { isWebdriverIO } from '../utils/browser';
import Modal from '../utils/Modal';
import Socket from '../utils/Socket';
import Storage from '../utils/Storage';
import Toast from '../utils/Toast';

import { EDITING_MODE, REGEX } from '../../lib/constants';
import events from 'socket-events';

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
            this.alertNotFound();
            return;
          }
          this.onCompassFound(res.body.compass, true);
        });
      ReactGA.pageview('/compass/view/');
    } else if (this.validateRouteParams(this.props.params)) {
      this.socket = Socket.getInstance();
      this.socket.subscribe({
        [events.DISCONNECT]: () => this.toast.error('Lost connection to server'),
        [events.RECONNECT]: this.handleReconnect.bind(this),
        [events.frontend.WORKSPACE_DELETED]: this.onCompassDeleted,
        [events.frontend.USER_JOINED]: this.onUserJoined,
        [events.frontend.USER_LEFT]: this.onUserLeft,
        [events.frontend.BAD_USERNAME]: this.handleBadUsername.bind(this),
        [events.frontend.DUPLICATE_USERNAME]: this.handleUsernameExists.bind(this),
      });
      const { code, username } = this.props.params;
      request.get('/api/v1/workspace/edit')
        .query({ code })
        .end((err, res) => {
          if (err || !res.body || res.body.compass == null) {
            this.alertNotFound();
            return;
          }
          this.socket.emitJoinRoom({ workspaceEditCode: code, username });
          this.onCompassFound(res.body.compass, false, username);
        });
      ReactGA.pageview('/compass/edit/');
    }

    if (this.props.location.query['fi']) {
      this.props.uiX.setIsFiona();
    }

    this.props.uiX.resize();
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
        'Click "Got it" to pick a new one.',
      ],
      cb: () => browserHistory.push(`/compass/edit/${this.props.params.code}`),
    });
  };

  handleUsernameExists = () => {
    this.modal.alert({
      heading: 'Whoops..',
      body: [
        'Someone already took that username',
        'Click "Got it" to pick a new one.',
      ],
      cb: () => browserHistory.push(`/compass/edit/${this.props.params.code}`),
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

  onCompassFound = (compass, isViewOnly, username) => {
    if (compass === null) {
      this.alertNotFound();
      return;
    }

    this.props.compassX.set(compass, isViewOnly);
    this.props.noteX.updateAll(compass.notes);
    this.props.workspaceX.setEditCode(compass.editCode);
    this.props.userX.me(username);

    // Skip notifying feature changes if the workspace is being
    // created.
    if (compass.center.length > 0) {
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
    this.modal.alertRouteErrors(validCode, validUsername, code);
  }

  componentDidMount() {
    $(window).on('resize', this.props.uiX.resize);
  }

  notifyIfNewVersion = ({ mustShow = false } = {}) => {
    const appVersion = 'v2.5.0';
    // mustShow overrides automatic decision-making
    if (mustShow || (!isWebdriverIO() &&
      // Don't show release notes to first-time visitors
      Storage.getVersion() !== 'v0.0.0' &&
      Storage.getVersion() !== appVersion)) {
      Storage.setVersion(appVersion);

      this.modal.alert({
        heading: `${appVersion} Release`,
        body: [
          'New feature(s):',
          [
            '● <b>Menu > Move Center</b> to change the box sizes (thank you Hannah for the suggestion!)',
          ].join('<br/>'),
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

    return (
      <div>
        <HelpAndFeedback editCode={this.props.compass.editCode}
                         notifyVersionChanges={this.notifyIfNewVersion}
        />
        <WorkspaceMenu />
        <Compass />
        <BulkEditToolbar show={this.props.visualMode} />
        <FormManager commonAttrs={{
          bg: this.props.users.nameToColor[this.props.users.me],
          user: this.props.users.me,
          close: this.props.uiX.closeForm,
        }} />
        {this.props.ui.showShareModal &&
          <ShareModal close={this.props.uiX.hideShareModal}
                      compass={this.props.compass}/>
        }
        {this.props.ui.showGDocModal &&
          <GDocModal close={this.props.uiX.hideGDocModal}
                     compass={this.props.compass}
                     notes={this.props.notes}/>
        }
        {this.props.ui.showScreenshotModal &&
          <ScreenshotModal close={this.props.uiX.hideScreenshotModal}/>
        }
        {this.props.ui.showCopyWorkspaceModal &&
          <CopyWorkspaceModal close={this.props.uiX.hideCopyWorkspaceModal} compass={this.props.compass} />
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    notes: state.notes,
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
