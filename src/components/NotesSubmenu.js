import React, { Component } from 'react';

import ModalSingleton from '../utils/Modal';
import SocketSingleton from '../utils/Socket';

export default class NotesSubmenu extends Component {
  constructor(props) {
    super(props);
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
            Text
            <span className={'ic-shortcut'}>doubleclick</span>
          </div>
          <div className={'ic-menu-item'} onClick={this.props.uiX.showImage}>
            Photo
            <span className={'ic-shortcut'}>shift+doubleclick</span>
          </div>
          <div className={'ic-menu-item'} onClick={this.showDoodle}>
            Sketch
            <span className={'ic-shortcut'}>alt+doubleclick</span>
          </div>
        </section>
      </div>
    );
  }
}
