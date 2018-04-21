import React, { Component } from 'react';
import SocketSingleton from '../utils/Socket';
import ToastSingleton from '../utils/Toast';

export default class WorkspaceMenu extends Component {
  constructor() {
    super();

    this.state = {
      active: false,
    };
    this.socket = SocketSingleton.getInstance();
    this.toast = ToastSingleton.getInstance();
  }

  renderMenu = () => {
    return (
      <div className={'ic-menu ic-workspace-menu'}>
        <section className={'border-bottom'}>
          <div className={'ic-menu-item'}>
            Email Reminder
          </div>
          <div className={'ic-menu-item'}>
            Bookmark
          </div>
        </section>
        <section className={'border-bottom'}>
          <div className={'ic-menu-item'}>
            New Workspace
          </div>
          <div className={'ic-menu-item'}>
            Share
          </div>
          <div className={'ic-menu-item'}>
            Notes
          </div>
          <div className={'ic-menu-item'}>
            Editing Modes
          </div>
        </section>
        <section>
          <div className={'ic-menu-item'}>
            Log out
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
