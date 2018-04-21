import React, { Component } from 'react';

import ModalSingleton from '../utils/Modal';
import SocketSingleton from '../utils/Socket';

export default class NotesSubmenu extends Component {
  constructor() {
    super();
    this.modal = ModalSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
  }

  showNewNote = () => {
    this.socket.emitMetric('menu new note');
    this.props.uiX.showNewNote();
  };

  showDoodle = () => {
    this.socket.emitMetric('menu new doodle');
    this.props.uiX.showDoodle();
  };

  render() {
    return (
      <div className={'ic-menu ic-notes-submenu'}>
        <section>
          <div className={'ic-menu-item'} onClick={this.showNewNote}>
            Text Note
            <span className={'ic-shortcut'}>N</span>
          </div>
          <div className={'ic-menu-item'} onClick={this.showDoodle}>
            Doodle Note
            <span className={'ic-shortcut'}>D</span>
          </div>
        </section>
      </div>
    );
  }
}
