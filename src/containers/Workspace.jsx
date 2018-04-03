import interact from 'interactjs';
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

import { KEYCODES, PROMPTS, EDITING_MODE, COLORS, DRAGGABLE_RESTRICTIONS, REGEX } from '../../lib/constants';
import { browserHistory } from 'react-router';

class Workspace extends Component {
  constructor(props) {
    super(props);
    this.toast = new Toast();
    this.modal = new Modal();

    this.socket = new Socket();
    this.socket.subscribe({
      'compass found': this.onCompassFound,
      'update notes': this.onUpdateNotes,
      'deleted notes': this.onDeleteNotes,
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

    this.notes = null;
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

  // TODO move to note manager
  onUpdateNotes = (notes) => {
    this.props.noteActions.updateAll(notes);

    if (this.props.visualMode)
      this.props.workspaceActions.updateSelected(notes.length);
  };

  onDeleteNotes = (deletedIdx) => {
    if (this.props.visualMode)
      this.props.workspaceActions.removeNotesIfSelected(deletedIdx);
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

  componentWillUpdate(nextProps) {
    this.notes = this.chooseDisplayedNotes(nextProps.workspace, nextProps.notes);
  }

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

    if (!this.props.route.viewOnly) {
      interact('.draggable').draggable({
        restrict: DRAGGABLE_RESTRICTIONS,
        autoScroll: true,
        onmove: this.dragTarget.bind(this),
        onend: this.dragEnd.bind(this),
      });
    }
  }

  componentWillUnmount() {
    this.socket.disconnect();
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

  setTranslation(target, x, y) {
    target.style.webkitTransform =
      target.style.transform = `translate(${x}px, ${y}px)`;
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }

  dragTarget(e) {
    if (!this.props.visualMode) {
      let x = (parseFloat(e.target.getAttribute('data-x')) || 0) + e.dx;
      let y = (parseFloat(e.target.getAttribute('data-y')) || 0) + e.dy;
      this.setTranslation(e.target, x, y);
    }
  }

  dragEnd(e) {
    if (this.props.visualMode) return this.toast.warn(PROMPTS.VISUAL_MODE_NO_CHANGE);

    this.setTranslation(e.target, 0, 0);

    let i = Number(e.target.id.substring(4));
    let x = this.notes[i].x + e.dx / this.props.ui.vw,
      y = this.notes[i].y + e.dy / this.props.ui.vh;
    let note = Object.assign({}, this.notes[i], { x, y });

    if (this.props.draftMode && !note.draft) return this.toast.warn(PROMPTS.DRAFT_MODE_NO_CHANGE);
    if (note.draft) this.props.workspaceActions.dragDraft(i, x, y);
    else if (this.socket.emitDragNote(note)) {
      this.props.noteActions.drag(i, x, y);
    }
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

  center = (w, h) => {
    return {
      top: Math.max((this.props.ui.vh - h) / 2, 0),
      left: Math.max((this.props.ui.vw - w) / 2, 0),
    };
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

  submitDraft = (note, idx) => {
    this.props.workspaceActions.undraft(idx);

    delete note.draft;
    note.color = this.props.users.nameToColor[this.props.users.me];
    this.socket.emitNewNote(note);
  };

  chooseDisplayedNotes(w, notes) {
    if (this.props.visualMode) {
      return _.map(notes, (note, i) => {
        let copy = Object.assign({}, note);
        copy.style = Object.assign({}, note.style);
        if (w.selected[i]) {
          if (!copy.doodle) {
            if (w.bold !== null) copy.style.bold = w.bold;
            if (w.italic !== null) copy.style.italic = w.italic;
            if (w.underline !== null) copy.style.underline = w.underline;
          }
          if (w.color !== null) copy.color = w.color;
        }

        return copy;
      });
    } else if (this.props.draftMode) {
      return w.drafts.concat(notes);
    } else {
      return notes;
    }
  }

  render() {
    if (_.isEmpty(this.props.compass)) return <div/>;

    if (this.props.route.viewOnly) return <Compass notes={this.notes}/>;

    let ui = this.props.ui;
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
        <Compass destroy={this.socket.emitDeleteNote}
                 notes={this.notes}
                 submitDraft={this.submitDraft} />
        <Sidebar />
        <ModesToolbar />
        <Chat />
        <Feedback show={ui.showFeedback}
                  style={this.center(400, 250)}
                  close={this.props.uiActions.toggleFeedback} />
        <PrivacyStatement show={ui.showPrivacyStatement}
                          style={this.center(400, 200)}
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
    notes: state.notes,
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

