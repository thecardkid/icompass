import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import request from 'superagent';
import _ from 'underscore';

import * as compassX from '@actions/compass';
import * as noteX from '@actions/notes';
import * as uiX from '@actions/ui';
import * as userX from '@actions/users';
import * as workspaceX from '@actions/workspace';

import BulkEditToolbar from '@components/BulkEditToolbar.jsx';
import Compass from '@components/Compass.jsx';
import HelpAndFeedback from '@components/HelpAndFeedback';
import WorkspaceMenu from '@components/WorkspaceMenu';
import FormManager from '@components/forms/FormManager.jsx';
import { AlertDisconnectedModal } from '@components/modals/ConfirmModal';
import {
  RefreshRequiredModal,
  WorkspaceDeletedModal,
  WorkspaceNotFoundModal,
} from '@components/modals/ConfirmModalWithRedirect';
import {
  UsernamePrompt,
} from '@components/modals/Prompt';

import { EDITING_MODES } from '@utils/constants';
import { isCharOnly, modalCheckEmail } from '@utils/regex';
import Socket from '@utils/Socket';
import Storage from '@utils/Storage';

import events from '@socket_events';

class Workspace extends Component {
  constructor(props) {
    super(props);

    if (this.props.location.query['fi']) {
      this.props.uiX.setIsFiona();
    }
    if (this.props.route.viewOnly) {
      request.get('/api/v1/workspace/view')
        .query({ id: this.props.params.code })
        .end((err, res) => {
          if (err || !res.body || res.body.compass == null) {
            this.alertNotFound();
            return;
          }
          this.setupWorkspace(res.body.compass, true);
        });
      ReactGA.pageview('/compass/view/');
    } else {
      const { code, username } = this.props.params;
      request.get('/api/v1/workspace/edit')
        .query({ code })
        .end((err, res) => {
          if (err || !res.body || res.body.compass == null) {
            this.alertNotFound();
            return;
          }
          this.socket = Socket.getInstance();
          this.socket.subscribe({
            [events.RECONNECT]: this.handleReconnect,
            [events.DISCONNECT]: this.handleDisconnect,
            [events.frontend.REFRESH_REQUIRED]: this.props.uiX.openRefreshRequiredModal,
            [events.frontend.WORKSPACE_DELETED]: this.onCompassDeleted,
            [events.frontend.USER_JOINED]: this.onUserJoined,
            [events.frontend.USER_LEFT]: this.onUserLeft,
            [events.frontend.BAD_USERNAME]: this.handleBadUsername,
            [events.frontend.DUPLICATE_USERNAME]: this.handleDuplicateUsername,
          });
          this.setupWorkspace(res.body.compass, false);
          if (!username || !!this.checkUsername(username)) {
            this.props.uiX.openUsernamePromptModal();
          } else {
            this.joinRoom(username);
          }
        });
      ReactGA.pageview('/compass/edit/');
    }
  }

  handleReconnect = () => {
    // Clear toast in handleDisconnect.
    this.props.uiX.toastClear();
  };

  handleDisconnect = (reason) => {
    if (reason === 'ping timeout') {
      this.props.uiX.openDisconnectedModal();
    } else {
      this.props.uiX.toastError('Lost connection to server');
    }
  };

  checkUsername = (u) => {
    if (u.length > 15) {
      return 'Username too long, please choose something fewer than 15 characters';
    }
    if (!isCharOnly(u)) {
      return 'Username must be letters-only';
    }
    return null;
  };

  handleBadUsername = () => {
    this.props.uiX.openUsernamePromptModal();
    this.props.uiX.toastError('Username not valid');
  };

  handleDuplicateUsername = () => {
    this.props.uiX.openUsernamePromptModal();
    this.props.uiX.toastError('Someone else already took that username');
  };

  handleSocketServerError = (clientAction) => {
    this.props.uiX.toastError(`Failed to ${clientAction.toLowerCase()}. Please reload the page, or try again later`);
  };

  alertNotFound() {
    this.props.uiX.openWorkspaceNotFoundModal();
  }

  setupWorkspace = (compass, isViewOnly) => {
    if (compass === null) {
      this.alertNotFound();
      return;
    }
    this.props.compassX.set(compass, isViewOnly);
    this.props.noteX.updateAll(compass.notes);
    this.props.workspaceX.setEditCode(compass.editCode);
  };

  joinRoomReconnect = () => {
    this.socket.emitJoinRoom({
      workspaceEditCode: this.props.compass.editCode,
      username: this.props.users.me,
      isReconnecting: true,
    });
  }

  joinRoom = (username) => {
    this.socket.emitJoinRoom({
      workspaceEditCode: this.props.compass.editCode,
      username,
      isReconnecting: false,
    });
    this.props.userX.me(username);
  };

  onCompassDeleted = () => {
    this.props.uiX.openWorkspaceDeletedModal();
  };

  onUserJoined = (data) => {
    this.props.userX.update(data);
  };

  onUserLeft = (data) => {
    this.props.userX.update(data);
  };

 componentWillUnmount() {
    this.props.compassX.reset();
    this.props.noteX.reset();
    this.props.uiX.reset();
    this.props.uiX.toastClear();
    this.props.userX.reset();

    if (this.socket) {
      this.socket.logout();
    }
  }

  render() {
    if (_.isEmpty(this.props.compass)) {
      return (
        <div>
          <WorkspaceNotFoundModal redirectURL={'/'} />
        </div>
      );
    }
    if (this.props.route.viewOnly) {
      return <Compass viewOnly={true}/>;
    }
    return (
      <div>
        <HelpAndFeedback editCode={this.props.compass.editCode} />
        <WorkspaceMenu />
        <Compass />
        <BulkEditToolbar show={this.props.visualMode} />
        <FormManager commonAttrs={{
          bg: Storage.getStickyNoteColor(),
          user: this.props.users.me,
          close: this.props.uiX.closeForm,
        }} />
        <WorkspaceDeletedModal redirectURL={'/'} />
        <RefreshRequiredModal redirectURL={`/compass/edit/${this.props.compass.editCode}/${this.props.users.me}`} />
        <UsernamePrompt onSubmit={this.joinRoom}
                        validateFn={this.checkUsername}
        />
        <AlertDisconnectedModal onConfirm={this.joinRoomReconnect} />
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
    visualMode: state.ui.editingMode === EDITING_MODES.VISUAL || false,
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
