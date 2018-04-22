import React, { Component } from 'react';
import { connect } from 'react-redux';
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
import { EDITING_MODE, MODALS } from '../../lib/constants';

class WorkspaceMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      submenus: {
        share: false,
        notes: false,
        modes: false,
      },
    };
    this.shortcuts = {
      68: props.uiX.showDoodle,
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
        return this.props.uiX.normalMode();

      case 'compact':
        return this.props.uiX.compactMode();

      case 'bulk':
        return this.props.uiX.visualMode(this.props.notes.length);

      case 'draft':
        return this.props.uiX.draftMode();

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
    }});
  };

  renderMenu = () => {
    const { share, notes, modes } = this.state.submenus;

    return (
      <div className={'ic-menu ic-workspace-menu'}>
        <section className={'border-bottom'} onMouseEnter={this.hideSubmenus}>
          <div className={'ic-menu-item'} onClick={this.openNewWorkspace}>
            New Workspace
          </div>
          <div className={'ic-menu-item'}>
            Email Reminder
          </div>
          <div className={'ic-menu-item'}>
            Bookmark
          </div>
        </section>
        <section className={'border-bottom'}>
          <div className={'ic-menu-item has-more'}
               onMouseOver={this.showSubmenu('share')}>
            {share && <ShareSubmenu compass={this.props.compass}/>}
            Share
          </div>
          <div className={'ic-menu-item has-more'}
               onMouseOver={this.showSubmenu('notes')}>
            Notes
            {notes && <NotesSubmenu uiX={this.props.uiX}/>}
          </div>
          <div className={'ic-menu-item has-more'}
               onMouseOver={this.showSubmenu('modes')}>
            Editing Modes
            {modes && <ModesSubmenu modes={this.props.modes} changeMode={this.buttonChangeMode}/>}
          </div>
        </section>
        <section onMouseEnter={this.hideSubmenus}>
          <div className={'ic-menu-item'}>
            Log Out
          </div>
          <div className={'ic-menu-item'}>
            Delete Workspace
          </div>
        </section>
      </div>
    );
  };

  toggleMenu = () => {
    this.setState({ active: !this.state.active });
  };

  hideMenu = () => {
    this.setState({
      active: false,
      submenus: {
        share: false,
        notes: false,
        modes: false,
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
