import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import NotesSubmenu from './NotesSubmenu';
import ShareSubmenu from './ShareSubmenu';

import ModalSingleton from '../utils/Modal';
import SocketSingleton from '../utils/Socket';
import ToastSingleton from '../utils/Toast';

import * as uiX from '../actions/ui';
import * as workspaceX from '../actions/workspace';

class WorkspaceMenu extends Component {
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
    this.modal = ModalSingleton.getInstance();
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
            {
              this.state.submenus.share &&
              <ShareSubmenu compass={this.props.compass}/>
            }
            Share
          </div>
          <div className={'ic-menu-item has-more'}
               onMouseOver={this.showSubmenu('notes')}>
            Notes
            {
              this.state.submenus.notes &&
              <NotesSubmenu uiX={this.props.uiX}/>
            }
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
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    compass: state.compass,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
    workspaceX: bindActionCreators(workspaceX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkspaceMenu);
