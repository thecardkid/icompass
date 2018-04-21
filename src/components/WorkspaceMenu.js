import React, { Component } from 'react';
import SocketSingleton from '../utils/Socket';
import ToastSingleton from '../utils/Toast';

export default class WorkspaceMenu extends Component {
  constructor() {
    super();

    this.state = {
      active: false,
      submenus: {
        share: false,
        notes: false,
        modes: false,
      },
    };
    this.socket = SocketSingleton.getInstance();
    this.toast = ToastSingleton.getInstance();
  }

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

  renderShareSubmenu = () => {
    return (
      <div className={'ic-menu ic-submenu ic-share-submenu'}>
        <section>
          <div className={'ic-menu-item default'}>
            Edit Link
          </div>
          <div className={'ic-menu-item'}>
            View-Only Link
          </div>
          <div className={'ic-menu-item'}>
            Export to PDF
          </div>
          <div className={'ic-menu-item'}>
            Twitter
          </div>
        </section>
      </div>
    );
  };

  renderNotesSubmenu = () => {
    return (
      <div className={'ic-menu ic-notes-submenu'}>
        <section>
          <div className={'ic-menu-item'}>
            Text Note
          </div>
          <div className={'ic-menu-item'}>
            Doodle Note
          </div>
        </section>
      </div>
    );
  };

  renderModesSubmenu = () => {
    return (
      <div className={'ic-menu ic-modes-submenu'}>
        <section>
          <div className={'ic-menu-item'}>
            Standard
          </div>
          <div className={'ic-menu-item'}>
            Compact
          </div>
          <div className={'ic-menu-item'}>
            Draft
          </div>
          <div className={'ic-menu-item'}>
            Bulk Edit
          </div>
        </section>
      </div>
    );
  };

  renderMenu = () => {
    return (
      <div className={'ic-menu ic-workspace-menu'}>
        <section className={'border-bottom'} onMouseEnter={this.hideSubmenus}>
          <div className={'ic-menu-item'}>
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
            {this.state.submenus.share && this.renderShareSubmenu()}
            Share
          </div>
          <div className={'ic-menu-item has-more'}
               onMouseOver={this.showSubmenu('notes')}>
            Notes
            {this.state.submenus.notes && this.renderNotesSubmenu()}
          </div>
          <div className={'ic-menu-item has-more'}
               onMouseOver={this.showSubmenu('modes')}>
            Editing Modes
            {this.state.submenus.modes && this.renderModesSubmenu()}
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
    this.setState({ active: false });
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
      </div>
    );
  }
}
