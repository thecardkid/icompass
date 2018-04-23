import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import ModesSubmenu from './ModesSubmenu';
import NotesSubmenu from './NotesSubmenu';
import ShareSubmenu from './ShareSubmenu';
import ShortcutManager from './ShortcutManager';

import ModalSingleton from '../utils/Modal';
import SocketSingleton from '../utils/Socket';
import ToastSingleton from '../utils/Toast';

import * as uiX from '../actions/ui';
import * as workspaceX from '../actions/workspace';
import { EDITING_MODE, MODALS, PROMPTS, REGEX } from '../../lib/constants';
import Storage from '../utils/Storage';

class WorkspaceMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      submenus: {
        share: false,
        notes: false,
        modes: false,
        users: false,
      },
    };
    this.shortcuts = {
      68: props.uiX.showDoodle,
      73: props.uiX.showImage,
      78: props.uiX.showNewNote,
      shift: {
        49: this.handleChangeMode('standard'),
        50: this.handleChangeMode('compact'),
        51: this.handleChangeMode('draft'),
        52: this.handleChangeMode('bulk'),
      },
    };
    this.modal = ModalSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
    this.toast = ToastSingleton.getInstance();
  }

  _handleShortcuts = (e) => {
    let shortcuts = this.shortcuts;

    if (e.shiftKey) shortcuts = this.shortcuts.shift;

    if (_.has(shortcuts, e.which)) {
      e.preventDefault();
      this.socket.emitMetric('shortcut key', e.which);
      shortcuts[e.which]();
    }
  };

  changeMode = (mode) => {
    switch (mode) {
      case 'standard':
        this.toast.info('Switched to standard mode');
        return this.props.uiX.normalMode();

      case 'compact':
        this.toast.info('Switched to compact mode');
        return this.props.uiX.compactMode();

      case 'draft':
        this.toast.info('Switched to draft mode');
        return this.props.uiX.draftMode();

      case 'bulk':
        this.toast.info('Switched to bulk edit mode');
        return this.props.uiX.visualMode(this.props.notes.length);

      default:
        return;
    }
  };

  handleChangeMode = (switchTo) => () => {
    if (this.props.modes.draft && switchTo !== 'draft' && this.props.hasDrafts) {
      this.modal.confirm(MODALS.EXIT_DRAFT_MODE, (confirmed) => {
        if (confirmed) {
          this.changeMode(switchTo);
        }
      });
    } else {
      this.changeMode(switchTo);
    }
  };

  buttonChangeMode = (switchTo) => () => {
    this.socket.emitMetric(`menu ${switchTo}`);
    this.handleChangeMode(switchTo)();
  };

  openNewWorkspace = () => {
    this.socket.emitMetric('menu new workspace');
    window.open('/', '_blank').focus();
  };

  triggerEmailModal = () => {
    this.socket.emitMetric('menu email');
    this.emailReminder();
  };

  emailReminder = () => {
    this.modal.promptForEmail((status, email) => {
      if (!status) return;

      if (REGEX.EMAIL.test(email)) {
        return this.socket.emitSendMail(this.props.compass.editCode, this.props.me, email);
      } else {
        this.toast.error(`"${email}" is not a valid email address`);
        this.emailReminder();
      }
    });
  };

  bookmark = () => {
    const { topic, editCode } = this.props.compass;
    this.socket.emitMetric('menu bookmark');
    this.modal.prompt(MODALS.SAVE_BOOKMARK, (submit, bookmarkName) => {
      if (submit) {
        let username = this.props.users.me.replace(/\d+/g, '');
        Storage.addBookmark(bookmarkName, editCode, username);
        this.toast.success(PROMPTS.SAVE_SUCCESS);
      }
    }, topic);
  };

  logout = () => {
    this.socket.emitMetric('menu log out');
    browserHistory.push('/');
  };

  confirmDelete = () => {
    this.socket.emitMetric('menu delete workspace');
    this.modal.confirm(MODALS.DELETE_COMPASS, (deleteCompass) => {
      if (deleteCompass) {
        Storage.removeBookmarkByCenter(this.props.compass.center);
        this.socket.emitDeleteCompass(this.props.compass._id);
      }
    });
  };

  showSubmenu = (submenu) => () => {
    this.setState({ submenus: {
      [submenu]: true,
    }});
  };

  hideSubmenus = () => {
    this.setState({ submenus: {
      share: false,
      notes: false,
      modes: false,
      users: false,
    }});
  };

  renderUsersSubmenu = () => {
    const { me } = this.props.users;
    const users = _.map(this.props.users.nameToColor, (color, name) => {
      return (
        <div className={'ic-menu-item ic-user'} key={`user-${name}`}>
          <span className={'user-color'} style={{background: color}} />
          {name === me ? `${name} (You)` : name}
        </div>
      );
    });
    return (
      <div className={'ic-menu ic-users-submenu'}>
        <section>{users}</section>
      </div>
    );
  };

  renderMenu = () => {
    const { share, notes, modes, users } = this.state.submenus;

    return (
      <div className={'ic-menu ic-workspace-menu'}>
        <section className={'border-bottom'} onMouseEnter={this.hideSubmenus}>
          <div className={'ic-menu-item'} onClick={this.openNewWorkspace}>
            New Workspace
          </div>
          <div className={'ic-menu-item'} onClick={this.triggerEmailModal}>
            Save via Email
          </div>
          <div className={'ic-menu-item'} onClick={this.bookmark}>
            Save as Bookmark
          </div>
        </section>
        <section className={'border-bottom'}>
          <div className={'ic-menu-item has-more'} onMouseOver={this.showSubmenu('share')}>
            {share && <ShareSubmenu compass={this.props.compass}/>}
            Share
          </div>
          <div className={'ic-menu-item has-more'} onMouseOver={this.showSubmenu('notes')}>
            Notes
            {notes && <NotesSubmenu uiX={this.props.uiX}/>}
          </div>
          <div className={'ic-menu-item has-more'} onMouseOver={this.showSubmenu('modes')}>
            Editing Modes
            {modes && <ModesSubmenu modes={this.props.modes} changeMode={this.buttonChangeMode}/>}
          </div>
          <div className={'ic-menu-item has-more'} onMouseOver={this.showSubmenu('users')}>
            Collaborators
            {users && this.renderUsersSubmenu()}
          </div>
        </section>
        <section onMouseEnter={this.hideSubmenus}>
          <div className={'ic-menu-item'} onClick={this.logout}>
            Log Out
          </div>
          <div className={'ic-menu-item'} onClick={this.confirmDelete}>
            Delete Workspace
          </div>
        </section>
      </div>
    );
  };

  toggleMenu = () => {
    if (this.state.active) {
      return this.hideMenu();
    }
    this.setState({ active: true });
  };

  hideMenu = () => {
    this.setState({
      active: false,
      submenus: {
        share: false,
        notes: false,
        modes: false,
        users: false,
      },
    });
  };

  render() {
    return (
      <div id={'ic-workspace-menu'}>
        <button className={'ic-workspace-button floating-button'}
              onClick={this.toggleMenu}
              onBlur={this.hideMenu}>
          <i className="material-icons">menu</i>
          {this.state.active && this.renderMenu()}
        </button>
        <ShortcutManager handle={this._handleShortcuts} />
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    compass: state.compass,
    notes: state.notes,
    users: state.users,
    modes: {
      normal: state.ui.editingMode === EDITING_MODE.NORMAL || false,
      compact: state.ui.editingMode === EDITING_MODE.COMPACT || false,
      bulk: state.ui.editingMode === EDITING_MODE.VISUAL || false,
      draft: state.ui.editingMode === EDITING_MODE.DRAFT || false,
    },
    hasDrafts: (state.workspace.drafts || []).length > 0,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
    workspaceX: bindActionCreators(workspaceX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkspaceMenu);
