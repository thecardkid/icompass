import $ from 'jquery';
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import ShortcutManager from './ShortcutManager';
import { DeleteWorkspaceModal } from './modals/ConfirmDelete';
import CopyWorkspaceModal from './modals/CopyWorkspaceModal';
import GDocModal from './modals/GDocModal';
import { BookmarkWorkspacePrompt, EmailWorkspacePrompt } from './modals/Prompt';
import { ExplainViewModesModal } from './modals/SimpleModal';
import ScreenshotModal from './modals/ScreenshotModal';
import ShareModal from './modals/ShareModal';
import EditablesSubmenu from './submenus/EditablesSubmenu';
import ExportSubmenu from './submenus/ExportSubmenu';
import NotesSubmenu from './submenus/NotesSubmenu';
import ResizeSubmenu from './submenus/ResizeSubmenu';

import * as uiX from '@actions/ui';
import * as workspaceX from '@actions/workspace';
import getAPIClient from '@utils/api';
import { trackFeatureEvent } from '@utils/analytics';
import { CSS, EDITING_MODES } from '@utils/constants';
import { modalCheckEmail } from '@utils/regex';
import MaybeTappable from '@utils/MaybeTappable';
import SocketSingleton from '@utils/Socket';
import Storage from '@utils/Storage';

import { workspaceMenu } from '@cypress/data_cy';

const sliderClass = 'ic-menu-dark-theme-slider';
const menuButtonClass = 'ic-menu-toggler';

class WorkspaceMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alwaysSendEmail: Storage.getAlwaysSendEmail().enabled,
      active: false,
      darkTheme: Storage.isDarkTheme(),
      submenus: {
        exports: false,
        notes: false,
        modes: false,
        users: false,
        resize: false,
        editables: false,
      },
    };

    this.shortcuts = {
      68: props.uiX.showDoodle,
      73: props.uiX.showImage,
      78: props.uiX.showNewNote,
      shift: {
        // 49: this.changeMode('standard'),
        // 50: this.changeMode('compact'),
        51: this.changeMode('bulk'),
      },
    };
    this.socket = SocketSingleton.getInstance();

    document.addEventListener('click', (e) => {
      const { classList } = e.target;
      if (!classList.contains('ic-menu-item')
        && !classList.contains(sliderClass)
        && !classList.contains(menuButtonClass)) {
        this.hideMenu();
      }
    }, true);
  }

  _handleShortcuts = (e) => {
    let shortcuts = this.shortcuts;
    if (e.metaKey) {
      return;
    }
    if (e.shiftKey) {
      shortcuts = this.shortcuts.shift;
    }
    if (_.has(shortcuts, e.which)) {
      e.preventDefault();
      shortcuts[e.which]();
    }
  };

  changeMode = (mode) => () => {
    switch (mode) {
      case 'standard':
        this.props.uiX.toastInfo('Switched to standard view');
        this.props.uiX.normalMode();
        break;

      case 'compact':
        this.props.uiX.toastInfo('Switched to compact view');
        this.props.uiX.compactMode();
        break;

      case 'bulk':
        this.props.uiX.visualMode(this.props.notes.length);
        break;

      default:
        return;
    }
    this.hideMenu();
  };

  openShareModal = () => {
    ReactGA.modalview('modals/menu-share');
    this.props.uiX.openShareModal();
    this.hideMenu();
  };

  openCopyWorkspaceModal = () => {
    ReactGA.modalview('modals/menu-copy-workspace');
    this.props.uiX.openCopyWorkspaceModal();
    this.hideMenu();
  };

  buttonChangeMode = (switchTo) => () => {
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

  openEmailPrompt = () => {
    ReactGA.modalview('modals/menu-email');
    this.props.uiX.openEmailWorkspaceModal();
    this.hideMenu();
  };

  openBookmarkModal = () => {
    if (Storage.hasBookmark(this.props.compass.editCode)) {
      this.props.uiX.toastSuccess('Bookmarked this workspace');
    } else {
      ReactGA.modalview('modals/menu-bookmark');
      this.props.uiX.openBookmarkWorkspaceModal();
    }
    this.hideMenu();
  };

  logout = () => {
    trackFeatureEvent('Menu: Log out');
    browserHistory.push('/');
  };

  confirmDelete = () => {
    ReactGA.modalview('modals/menu-delete');
    this.props.uiX.openDeleteWorkspaceModal();
    this.hideMenu();
  };

  bookmarkWorkspace = (name) => {
    Storage.addBookmark(name, this.props.compass.editCode, this.props.users.me);
    this.props.uiX.toastSuccess('Bookmarked this workspace');
    this.props.uiX.setBookmark(true);
  }

  deleteWorkspace = () => {
    Storage.removeBookmarkByCenter(this.props.compass.topic);
    this.socket.emitDeleteCompass(this.props.compass._id);
  };

  showSubmenu = (submenu) => () => {
    this.setState({ submenus: {
      exports: false,
      notes: false,
      modes: false,
      users: false,
      resize: false,
      editables: false,
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
      editables: false,
    }});
  };

  renderUsersSubmenu = () => {
    const users = _.map(this.props.users.usernames, (name) => {
      return (
        <div className={'ic-menu-item ic-user'} key={`user-${name}`}>
          <span className={'user-color'}/>
          {name === this.props.users.me ? `${name} (You)` : name}
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
    const { exports, notes, users, resize, editables } = this.state.submenus;

    return (
      <div className={'ic-menu ic-workspace-menu'}>
        <section className={'border-bottom'} onMouseEnter={this.hideSubmenus}>
          <div data-cy={workspaceMenu.darkTheme} className={'ic-menu-item'}>
            <i className={'material-icons'}>brightness_2</i>
            Dark Theme
            <label className={'switch'}>
              <input className={sliderClass} type={'checkbox'} onChange={this.toggleDarkTheme} checked={this.state.darkTheme}/>
              <span className={'slider ' + sliderClass} />
            </label>
          </div>
        </section>
        <section className={'border-bottom'} onMouseEnter={this.hideSubmenus}>
          <div data-cy={workspaceMenu.newWorkspace} className={'ic-menu-item'} onClick={this.openNewWorkspace}>
            <i className={'material-icons'}>create_new_folder</i>
            New Workspace
          </div>
          <div data-cy={workspaceMenu.copyWorkspace} className={'ic-menu-item'} onClick={this.openCopyWorkspaceModal}>
            <i className={'material-icons'}>content_copy</i>
            Copy Workspace
          </div>
          <div data-cy={workspaceMenu.share} className={'ic-menu-item'} onClick={this.openShareModal}>
            <i className={'material-icons'}>share</i>
            Share Workspace
          </div>
        </section>
        <section className={'border-bottom'} onMouseEnter={this.hideSubmenus}>
          <div data-cy={workspaceMenu.email} className={'ic-menu-item'} onClick={this.openEmailPrompt}>
            <i className={'material-icons'}>email</i>
            Save via Email
          </div>
          <div data-cy={workspaceMenu.bookmark} className={'ic-menu-item'} onClick={this.openBookmarkModal}>
            <i className={'material-icons'}>bookmark</i>
            Save as Bookmark
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
          <MaybeTappable onTapOrClick={this.changeMode('bulk')}>
            <div data-cy={workspaceMenu.modesSubactions.bulk} id={'ic-bulk'} className={'ic-menu-item'} onMouseOver={this.hideSubmenus}>
              Multi-Edit Mode
            </div>
          </MaybeTappable>
          <MaybeTappable onTapOrClick={this.showSubmenu('editables')}>
            <div data-cy={workspaceMenu.editables} className={'ic-menu-item has-more'} onMouseOver={this.showSubmenu('editables')}>
              Edit
              {editables && <EditablesSubmenu uiX={this.props.uiX} hideMenu={this.hideMenu}/>}
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
      this.hideMenu();
      return;
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

  handleChangeAlwaysSend = (e) => {
    if (e.target.checked === false) {
      Storage.setAlwaysSendEmail(false, null);
    }
    this.setState({ alwaysSendEmail: e.target.checked });
  }

  sendReminderEmail = async (validEmail) => {
    if (this.state.alwaysSendEmail) {
      Storage.setAlwaysSendEmail(true, validEmail);
    }
    await getAPIClient().sendReminderEmail({
      topic: this.props.compass.topic,
      editCode: this.props.compass.editCode,
      username: this.props.users.me,
      recipientEmail: validEmail,
      isAutomatic: false,
    });
  }

  render() {
    if (this.state.darkTheme) {
      $('#container').addClass('dark-theme');
      $('#ic-modal-container').addClass('dark-theme');
    } else {
      $('#container').removeClass('dark-theme');
      $('#ic-modal-container').removeClass('dark-theme');
    }

    const alwaysSend = Storage.getAlwaysSendEmail();

    return (
      <div id={'ic-workspace-menu'}>
        <button className={'ic-workspace-button floating-button'}
                style={{background: this.state.active ? CSS.COLORS.BLUE : ''}}
                onClick={this.toggleMenu}>
          <i className={'material-icons ' + menuButtonClass}>menu</i>
        </button>
        {this.state.active && this.renderMenu()}
        <ShortcutManager handle={this._handleShortcuts} />
        <ShareModal />
        <GDocModal />
        <ScreenshotModal />
        <CopyWorkspaceModal />
        <ExplainViewModesModal />
        <DeleteWorkspaceModal onConfirm={this.deleteWorkspace} />
        <BookmarkWorkspacePrompt onSubmit={this.bookmarkWorkspace}
                                 defaultValue={this.props.compass.topic}
        />
        <EmailWorkspacePrompt onSubmit={this.sendReminderEmail}
                              validateFn={modalCheckEmail}
        >
          <div className="ic-always">
            <input type="checkbox"
                   id="ic-always-email-value"
                   defaultChecked={this.state.alwaysSendEmail}
                   onClick={this.handleChangeAlwaysSend}
            />
            <span>Automatically send me an email whenever I create a workspace</span>
          </div>
          {alwaysSend.enabled && (
            <div className={'ic-modal-warning'}>
              Your remembered email is <b>{alwaysSend.email}</b>. To forget, uncheck the box above.
            </div>
          )}
        </EmailWorkspacePrompt>
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
      normal: state.ui.editingMode === EDITING_MODES.NORMAL || false,
      compact: state.ui.editingMode === EDITING_MODES.COMPACT || false,
      bulk: state.ui.editingMode === EDITING_MODES.VISUAL || false,
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
