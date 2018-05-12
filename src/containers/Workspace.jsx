import $ from 'jquery';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Tappable from 'react-tappable/lib/Tappable';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import * as compassX from '../actions/compass';
import * as noteX from '../actions/notes';
import * as uiX from '../actions/ui';
import * as userX from '../actions/users';
import * as workspaceX from '../actions/workspace';

import Compass from '../components/Compass.jsx';
import FormManager from '../components/forms/FormManager.jsx';
import HelpFeedback from '../components/HelpFeedback';
import VisualModeToolbar from '../components/VisualModeToolbar.jsx';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket';
import Storage from '../utils/Storage';
import Toast from '../utils/Toast';

import { PROMPTS, EDITING_MODE, REGEX } from '../../lib/constants';
import { browserHistory } from 'react-router';
import WorkspaceMenu from '../components/WorkspaceMenu';
import ShareModal from '../components/ShareModal';

class Workspace extends Component {
  constructor(props) {
    super(props);
    this.toast = Toast.getInstance();
    this.modal = Modal.getInstance();

    this.socket = Socket.getInstance();
    this.socket.subscribe({
      'compass found': this.onCompassFound,
      'compass deleted': this.onCompassDeleted,
      'user joined': this.onUserJoined,
      'user left': this.onUserLeft,
      'disconnect': () => this.toast.error('Lost connection to server'),
      'reconnect': () => {
        this.toast.success('Established connection to server');
        this.socket.onReconnect(this.props);
      }
    });

    if (this.props.route.viewOnly) {
      this.socket.emitFindCompassView(this.props.params);
    } else if (this.validateRouteParams(this.props.params)) {
      this.socket.emitFindCompassEdit(this.props.params);
    }

    this.props.uiX.setScreenSize(window.innerWidth, window.innerHeight);
  }

  onCompassFound = (data) => {
    if (data.compass === null) {
      return void this.modal.alert(PROMPTS.COMPASS_NOT_FOUND, () => browserHistory.push('/'));
    }

    this.props.compassX.set(data.compass, data.viewOnly);
    this.props.noteX.updateAll(data.compass.notes);
    this.props.workspaceX.setEditCode(data.compass.editCode);
    this.props.userX.me(data.username);
  };

  onCompassDeleted = () => {
    this.modal.alert(PROMPTS.COMPASS_DELETED, () => browserHistory.push('/'));
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
      this.socket.emitMetricDirectUrlAccess(this.props.router.getCurrentLocation().pathname);
      return true;
    }

    this.modal.alertRouteErrors(validCode, validUsername);
  }

  componentDidMount() {
    $(window).on('resize', this.props.uiX.resize);
    this.notifyIfNewVersion();
  }

  notifyIfNewVersion() {
    if (_.has(window, 'Notification')) {
      const appVersion = 'v2.1.0';
      if (Storage.getVersion() !== appVersion) {
        Storage.setVersion(appVersion);
        const title = 'A new version of iCompass has been released!';
        const options = {
          body: `Click to see what\'s new in ${appVersion}`,
          icon: 'https://s3.us-east-2.amazonaws.com/innovatorscompass/favicon.png',
        };

        const n = new Notification(title, options);

        n.onclick = () => window.open('https://github.com/thecardkid/icompass/releases');
      }
    }
  }

  componentWillUnmount() {
    this.props.compassX.reset();
    this.props.noteX.reset();
    this.props.uiX.reset();
    this.props.userX.reset();
    $(window).off('resize', this.props.uiX.resize);
    this.socket.logout();
    this.modal.close();
    this.toast.clear();
  }

  render() {
    if (_.isEmpty(this.props.compass)) return <div/>;

    if (this.props.route.viewOnly) return <Compass viewOnly={true}/>;

    let formAttrs = {
      bg: this.props.users.nameToColor[this.props.users.me],
      user: this.props.users.me,
      close: this.props.uiX.closeForm,
    };

    return (
      <div>
        <Tappable onTap={this.toast.clear}>
          <div id="ic-toast" onClick={this.toast.clear} />
        </Tappable>
        <HelpFeedback editCode={this.props.compass.editCode}/>
        <WorkspaceMenu />
        <Compass />
        <VisualModeToolbar show={this.props.visualMode} />
        <FormManager commonAttrs={formAttrs} />
        <ShareModal show={this.props.ui.showShareModal}
                    close={this.props.uiX.hideShareModal}
                    compass={this.props.compass}
        />
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
