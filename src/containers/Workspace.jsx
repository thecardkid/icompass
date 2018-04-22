import $ from 'jquery';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Tappable from 'react-tappable/lib/Tappable';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import * as chatActions from '../actions/chat';
import * as compassActions from '../actions/compass';
import * as noteActions from '../actions/notes';
import * as uiActions from '../actions/ui';
import * as userActions from '../actions/users';
import * as workspaceActions from '../actions/workspace';

import About from '../components/About.jsx';
import Chat from '../components/Chat.jsx';
import Compass from '../components/Compass.jsx';
import FormManager from '../components/FormManager.jsx';
import HelpFeedback from '../components/HelpFeedback';
import Sidebar from '../components/Sidebar.jsx';
import VisualModeToolbar from '../components/VisualModeToolbar.jsx';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket.js';
import Toast from '../utils/Toast';

import { PROMPTS, EDITING_MODE, REGEX } from '../../lib/constants';
import { browserHistory } from 'react-router';
import WorkspaceMenu from '../components/WorkspaceMenu';

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
      'reconnect': () => this.toast.success('Established connection to server'),
    });

    if (this.props.route.viewOnly) {
      this.socket.emitFindCompassView(this.props.params);
    } else if (this.validateRouteParams(this.props.params)) {
      this.socket.emitFindCompassEdit(this.props.params);
    }

    this.props.uiActions.setScreenSize(window.innerWidth, window.innerHeight);
  }

  onCompassFound = (data) => {
    if (data.compass === null) {
      return void this.modal.alert(PROMPTS.COMPASS_NOT_FOUND, () => browserHistory.push('/'));
    }

    this.props.compassActions.set(data.compass, data.viewOnly);
    this.props.noteActions.updateAll(data.compass.notes);
    this.props.userActions.me(data.username);
  };

  onCompassDeleted = () => {
    this.modal.alert(PROMPTS.COMPASS_DELETED, () => browserHistory.push('/'));
  };

  onUserJoined = (data) => {
    this.props.chatActions.userJoined(data.joined);
    this.props.userActions.update(data);
  };

  onUserLeft = (data) => {
    this.props.chatActions.userLeft(data.left);
    this.props.userActions.update(data);
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
    $(window).on('resize', this.props.uiActions.resize);
  }

  componentWillUnmount() {
    this.props.compassActions.reset();
    this.props.noteActions.reset();
    this.props.chatActions.reset();
    this.props.uiActions.reset();
    this.props.userActions.reset();
    $(window).off('resize', this.props.uiActions.resize);
    this.socket.logout();
    this.modal.close();
    this.toast.clear();
  }

  showChat = () => {
    this.props.chatActions.read();
    this.props.uiActions.toggleChat();
  };

  render() {
    if (_.isEmpty(this.props.compass)) return <div/>;

    if (this.props.route.viewOnly) return <Compass viewOnly={true}/>;

    let { ui } = this.props;
    let formAttrs = {
      bg: this.props.draftMode ? 'grey' : this.props.users.nameToColor[this.props.users.me],
      user: this.props.users.me,
      close: this.props.uiActions.closeForm,
    };

    return (
      <div>
        <Tappable onTap={this.toast.clear}>
          <div id="ic-toast" onClick={this.toast.clear} />
        </Tappable>
        <Compass />
        <Sidebar connected={this.socket.isConnected()} />
        <Chat />
        <About show={ui.showAbout}
               close={this.props.uiActions.toggleAbout} />
        <VisualModeToolbar show={this.props.visualMode} />
        <FormManager commonAttrs={formAttrs} />
        <HelpFeedback />
        <WorkspaceMenu />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    compass: state.compass,
    users: state.users,
    chat: state.chat,
    ui: state.ui,
    workspace: state.workspace,
    visualMode: state.ui.editingMode === EDITING_MODE.VISUAL || false,
    draftMode: state.ui.editingMode === EDITING_MODE.DRAFT || false,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    noteActions: bindActionCreators(noteActions, dispatch),
    compassActions: bindActionCreators(compassActions, dispatch),
    userActions: bindActionCreators(userActions, dispatch),
    chatActions: bindActionCreators(chatActions, dispatch),
    uiActions: bindActionCreators(uiActions, dispatch),
    workspaceActions: bindActionCreators(workspaceActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Workspace);

