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
import Feedback from '../components/Feedback.jsx';
import FormManager from '../components/FormManager.jsx';
import ModesToolbar from '../components/ModesToolbar.jsx';
import PrivacyStatement from '../components/PrivacyStatement.jsx';
import Sidebar from '../components/Sidebar.jsx';
import VisualModeToolbar from '../components/VisualModeToolbar.jsx';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket.js';
import Toast from '../utils/Toast';

import { KEYCODES, PROMPTS, EDITING_MODE, COLORS, REGEX } from '../../lib/constants';
import { browserHistory } from 'react-router';

class Workspace extends Component {
  constructor(props) {
    super(props);
    this.toast = new Toast();
    this.modal = new Modal();

    this.socket = new Socket();
    this.socket.subscribe({
      'compass found': this.onCompassFound,
      'compass deleted': this.onCompassDeleted,
      'user joined': this.onUserJoined,
      'user left': this.onUserLeft,
      'disconnect': () => this.props.uiActions.setSidebarVisible(true),
      'reconnect': () => this.socket.emitReconnected(this.props),
    });

    if (this.props.route.viewOnly) {
      this.socket.emitFindCompassView(this.props.params);
    } else if (this.validateRouteParams(this.props.params)) {
      this.socket.emitFindCompassEdit(this.props.params);
    }

    this.keypressHandler = {
      78: this.props.uiActions.showNewNote,
      67: this.props.uiActions.toggleChat,
      68: this.props.uiActions.showDoodle,
      83: this.props.uiActions.toggleSidebar,
      80: this.props.uiActions.toggleAbout,
    };

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

    if (validCode && validUsername) return true;

    this.modal.alertRouteErrors(validCode, validUsername);
  }

  componentDidMount() {
    $(window).on('resize', this.props.uiActions.resize);
    $(window).on('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    this.props.compassActions.reset();
    this.props.noteActions.reset();
    this.props.chatActions.reset();
    this.props.uiActions.reset();
    this.props.userActions.reset();
    $(window).off('resize', this.props.uiActions.resize);
    $(window).off('keydown', this.handleKeyDown);
    this.modal.close();
    this.toast.clear();
  }

  isControlKey(k) {
    return k in this.keypressHandler;
  }

  isModifierKey(e) {
    return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
  }

  handleKeyDown = (e) => {
    if (this.modal.show && e.which === KEYCODES.ESC) return this.modal.close();

    if (this.props.ui.newNote || this.props.ui.doodleNote ||
      typeof this.props.ui.editNote === 'number') {
      if (e.which === KEYCODES.ESC) this.props.uiActions.closeForm();
      return;
    }

    if (document.activeElement.id === 'message-text') return;
    if (document.activeElement.id === 'ic-modal-input') return;

    if (this.isControlKey(e.which) && !this.isModifierKey(e)) {
      e.preventDefault();
      this.keypressHandler[e.which]();
    }
  };

  showChat = () => {
    this.props.chatActions.read();
    this.props.uiActions.toggleChat();
  };

  renderCornerButtons = () => {
    let actions = this.props.uiActions;
    let showChatStyle = {
      background: this.props.chat.unread ? COLORS.RED : COLORS.LIGHT,
      color: this.props.chat.unread ? COLORS.LIGHT : COLORS.DARK,
    };

    return (
      <div>
        <button className="ic-corner-btn"
                id="ic-show-sidebar"
                onClick={actions.toggleSidebar}>
          Show Sidebar
        </button>
        <button className="ic-corner-btn"
                id="ic-show-chat"
                onClick={this.showChat}
                style={showChatStyle}>
          Show Chat
        </button>
        <button className="ic-corner-btn"
                id="ic-show-doodle"
                onClick={actions.showDoodle}>
          Doodle
        </button>
      </div>
    );
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
        {this.renderCornerButtons()}
        <Compass />
        <Sidebar connected={this.socket.isConnected()} />
        <ModesToolbar />
        <Chat />
        <Feedback show={ui.showFeedback}
                  close={this.props.uiActions.toggleFeedback} />
        <PrivacyStatement show={ui.showPrivacyStatement}
                          close={this.props.uiActions.togglePrivacyStatement} />
        <About show={ui.showAbout}
               close={this.props.uiActions.toggleAbout} />
        <VisualModeToolbar show={this.props.visualMode} />
        <FormManager center={this.center}
                     commonAttrs={formAttrs} />
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

