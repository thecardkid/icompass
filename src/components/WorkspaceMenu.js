import $ from 'jquery';
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import ExportSubmenu from './submenus/ExportSubmenu';
import ModesSubmenu from './submenus/ModesSubmenu';
import NotesSubmenu from './submenus/NotesSubmenu';
import ResizeSubmenu from './submenus/ResizeSubmenu';
import ShortcutManager from './ShortcutManager';

import { trackFeatureEvent } from '../utils/Analytics';
import MaybeTappable from '../utils/MaybeTappable';
import ModalSingleton from '../utils/Modal';
import SocketSingleton from '../utils/Socket';
import Storage from '../utils/Storage';
import ToastSingleton from '../utils/Toast';

import * as uiX from '../actions/ui';
import * as workspaceX from '../actions/workspace';
import { EDITING_MODE, COLORS, REGEX } from '../../lib/constants';
import { workspaceMenu } from '../../test/cypress/data_cy';

class WorkspaceMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      darkTheme: Storage.isDarkTheme(),
      submenus: {
        exports: false,
        notes: false,
        modes: false,
        users: false,
        resize: false,
      },
    };

    this.shortcuts = {
      68: props.uiX.showDoodle,
      73: props.uiX.showImage,
      78: props.uiX.showNewNote,
      shift: {
        49: this.changeMode('standard'),
        50: this.changeMode('compact'),
        51: this.changeMode('bulk'),
      },
    };
    this.shortcutEvents = {
      68: 'Shortcut N new note',
      73: 'Shortcut I new image',
      78: 'Shortcut D new doodle',
      49: 'Shortcut Shift-1 (standard mode)',
      50: 'Shortcut Shift-2 (compact mode)',
      51: 'Shortcut Shift-3 (bulk mode)',
    };
    this.modal = ModalSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
    this.toast = ToastSingleton.getInstance();
  }

  _handleShortcuts = (e) => {
    let shortcuts = this.shortcuts;

    if (e.metaKey) return;

    if (e.shiftKey) shortcuts = this.shortcuts.shift;

    if (_.has(shortcuts, e.which)) {
      e.preventDefault();
      shortcuts[e.which]();
      trackFeatureEvent(this.shortcutEvents[e.which]);
    }
  };

  changeMode = (mode) => () => {
    switch (mode) {
      case 'standard':
        this.toast.info('Switched to standard mode');
        this.props.uiX.normalMode();
        break;

      case 'compact':
        this.toast.info('Switched to compact mode');
        this.props.uiX.compactMode();
        break;

      case 'bulk':
        this.toast.info('Switched to bulk edit mode');
        this.props.uiX.visualMode(this.props.notes.length);
        break;

      default:
        return;
    }
    this.hideMenu();
  };

  showShareModal = () => {
    ReactGA.modalview('modals/menu-share');
    this.props.uiX.showShareModal();
    this.hideMenu();
  };

  buttonChangeMode = (switchTo) => () => {
    trackFeatureEvent('Menu: Switch mode');
    this.changeMode(switchTo)();
    // Hack - for some reason, when clicking on a mode it fires
    // a "show" event for the submenu. So we get around that by
    // hiding after a short delay.
    setTimeout(() => this.hideSubmenus(), 100);
  };

  openNewWorkspace = () => {
    trackFeatureEvent('Menu: New workspace');
    window.open('/', '_blank').focus();
    this.hideMenu();
  };

  triggerEmailModal = () => {
    // Track here instead of in emailReminder because
    // that function calls itself
    ReactGA.modalview('modals/menu-email');
    this.emailReminder();
    this.hideMenu();
  };

  emailReminder = (email) => {
    email = typeof email === 'string' ? email : '';

    this.modal.prompt({
      heading: 'Receive a Link to this Workspace',
      body: [
        ' You\'ll need the link to the compass to access it again. To email yourself the link now, enter your email address below.',
        'I will not store your email address or send you spam.',
      ],
      defaultValue: email,
      cb: (status, email) => {
        if (!status) return;

        if (REGEX.EMAIL.test(email)) {
          return this.socket.emitSendMail(this.props.compass.editCode, this.props.users.me, email, this.props.compass.topic);
        } else {
          this.toast.error(`"${email}" is not a valid email address`);
          this.emailReminder(email);
        }
      },
    });
  };

  bookmark = () => {
    const { topic, editCode } = this.props.compass;

    if (Storage.hasBookmark(editCode)) {
      this.modal.alert({
        heading: 'Already bookmarked!',
        body: 'Check for the yellow bookmark icon in the bottom left.',
      });
    } else {
      ReactGA.modalview('modals/menu-bookmark');
      this.modal.prompt({
        heading: 'Bookmark',
        body: [
          'Bookmarks give you quick access to workspaces from the app\'s home page - but can be lost if your browser cache is erased.',
          'To never lose access to your compass, email yourself a link, or copy and paste it somewhere secure.'
        ],
        defaultValue: topic,
        cb: (submit, bookmarkName) => {
          if (submit) {
            let username = this.props.users.me.replace(/\d+/g, '');
            Storage.addBookmark(bookmarkName, editCode, username);
            this.toast.success('Bookmarked this workspace!');
            this.props.uiX.setBookmark(true);
          }
        },
      });
    }

    this.hideMenu();
  };

  logout = () => {
    trackFeatureEvent('Menu: Log out');
    browserHistory.push('/');
  };

  confirmDelete = () => {
    ReactGA.modalview('modals/menu-delete');
    this.modal.confirm({
      body: 'You are about to delete this workspace. This action cannot be undone',
      confirmText: 'Delete',
      cb: (confirmed) => {
        if (confirmed) {
          Storage.removeBookmarkByCenter(this.props.compass.topic);
          this.socket.emitDeleteCompass(this.props.compass._id);
        }
      },
    });
    this.hideMenu();
  };

  showSubmenu = (submenu) => () => {
    this.setState({ submenus: {
      exports: false,
      notes: false,
      modes: false,
      users: false,
      resize: false,
      [submenu]: true,
    }});
  };

  hideSubmenus = () => {
    this.setState({ submenus: {
      exports: false,
      notes: false,
      modes: false,
      users: false,
      resize: false,
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

  toggleDarkTheme = (e) => {
    const darkTheme = Storage.setDarkTheme(e.target.checked);
    this.setState({ darkTheme });
  };

  renderMenu = () => {
    const { exports, notes, modes, users, resize } = this.state.submenus;

    return (
      <div className={'ic-menu ic-workspace-menu'}>
        <section className={'border-bottom'} onMouseEnter={this.hideSubmenus}>
          <div data-cy={workspaceMenu.newWorkspace} className={'ic-menu-item'} onClick={this.openNewWorkspace}>
            <i className={'material-icons'}>create_new_folder</i>
            New Workspace
          </div>
          <div data-cy={workspaceMenu.darkTheme} className={'ic-menu-item'}>
            <i className={'material-icons'}>brightness_2</i>
            Dark Theme
            <label className={'switch'}>
              <input type={'checkbox'} onChange={this.toggleDarkTheme} checked={this.state.darkTheme}/>
              <span className={'slider'} />
            </label>
          </div>
        </section>
        <section className={'border-bottom'} onMouseEnter={this.hideSubmenus}>
          <div data-cy={workspaceMenu.email} className={'ic-menu-item'} onClick={this.triggerEmailModal}>
            <i className={'material-icons'}>email</i>
            Save via Email
          </div>
          <div data-cy={workspaceMenu.bookmark} className={'ic-menu-item'} onClick={this.bookmark}>
            <i className={'material-icons'}>bookmark</i>
            Save as Bookmark
          </div>
          <div data-cy={workspaceMenu.share} className={'ic-menu-item'} onClick={this.showShareModal}>
            <i className={'material-icons'}>share</i>
            Share Workspace
          </div>
        </section>
        <section className={'border-bottom'}>
          <MaybeTappable onTapOrClick={this.showSubmenu('exports')}>
            <div data-cy={workspaceMenu.exportAs} className={'ic-menu-item has-more'} onMouseOver={this.showSubmenu('exports')}>
              <i className={'material-icons'}>arrow_right_alt</i>
              Export as
              {exports && <ExportSubmenu uiX={this.props.uiX} hideMenu={this.hideMenu}/>}
            </div>
          </MaybeTappable>
        </section>
        <section className={'border-bottom'}>
          <MaybeTappable onTapOrClick={this.showSubmenu('resize')}>
            <div data-cy={workspaceMenu.moveCenter} className={'ic-menu-item has-more'} onMouseOver={this.showSubmenu('resize')}>
              Move Center
              {resize && <ResizeSubmenu uiX={this.props.uiX} hideMenu={this.hideMenu}/>}
            </div>
          </MaybeTappable>
          <MaybeTappable onTapOrClick={this.showSubmenu('notes')}>
            <div data-cy={workspaceMenu.notes} className={'ic-menu-item has-more'} onMouseOver={this.showSubmenu('notes')}>
              Add Note
              {notes && <NotesSubmenu uiX={this.props.uiX} hideMenu={this.hideMenu}/>}
            </div>
          </MaybeTappable>
          <MaybeTappable onTapOrClick={this.showSubmenu('modes')}>
            <div data-cy={workspaceMenu.modes} className={'ic-menu-item has-more'} onMouseOver={this.showSubmenu('modes')}>
              Change Mode
              {modes && <ModesSubmenu modes={this.props.modes} changeMode={this.buttonChangeMode} hideMenu={this.hideMenu}/>}
            </div>
          </MaybeTappable>
          <MaybeTappable onTapOrClick={this.showSubmenu('users')}>
            <div data-cy={workspaceMenu.users} className={'ic-menu-item has-more'} onMouseOver={this.showSubmenu('users')}>
              Collaborators
              {users && this.renderUsersSubmenu()}
            </div>
          </MaybeTappable>
        </section>
        <section onMouseEnter={this.hideSubmenus}>
          <div data-cy={workspaceMenu.logout} className={'ic-menu-item'} onClick={this.logout}>
            <i className={'material-icons'}>lock</i>
            Log Out
          </div>
          <div data-cy={workspaceMenu.deleteWorkspace} className={'ic-menu-item dangerous'} onClick={this.confirmDelete}>
            <i className={'material-icons'}>delete</i>
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
        exports: false,
        notes: false,
        modes: false,
        users: false,
        resize: false,
      },
    });
  };

  render() {
    if (this.state.darkTheme) {
      $('#container').addClass('dark-theme');
      $('#ic-modal-container').addClass('dark-theme');
    } else {
      $('#container').removeClass('dark-theme');
      $('#ic-modal-container').removeClass('dark-theme');
    }

    return (
      <div id={'ic-workspace-menu'}>
        <button className={'ic-workspace-button floating-button'}
                style={{background: this.state.active ? COLORS.BLUE : ''}}
              onClick={this.toggleMenu}>
          <i className="material-icons">menu</i>
        </button>
        {this.state.active && this.renderMenu()}
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
