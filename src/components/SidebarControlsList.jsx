import React, { Component } from 'react';

import Socket from '../utils/Socket.js';

export default class SidebarControlsList extends Component {
  constructor(props, context) {
    super(props, context);
    this.socket = Socket.getInstance();
  }


  toggleSidebar = () => {
    this.socket.emitMetric('sidebar toggle sidebar');
    this.props.uiX.toggleSidebar();
  };

  toggleChat = () => {
    this.socket.emitMetric('sidebar toggle chat');
    this.props.uiX.toggleChat();
  };

  toggleAbout = () => {
    this.socket.emitMetric('sidebar toggle prompt');
    this.props.uiX.toggleAbout();
  };

  render() {
    return (
      <div className="ic-sidebar-list" name="controls">
        <h2>Controls</h2>
        <button className="ic-action" onClick={this.showNewNote}>
          <span className='ic-ctrl-key'>n</span>
          <p>new note</p>
        </button>
        <button className="ic-action" onClick={this.showDoodle}>
          <span className='ic-ctrl-key'>d</span>
          <p>new doodle</p>
        </button>
        <button className="ic-action" onClick={this.toggleSidebar}>
          <span className='ic-ctrl-key'>s</span>
          <p>toggle sidebar</p>
        </button>
        <button className="ic-action" onClick={this.toggleChat}>
          <span className='ic-ctrl-key'>c</span>
          <p>toggle chat</p>
        </button>
        <button className="ic-action" onClick={this.toggleAbout}>
          <span className='ic-ctrl-key'>p</span>
          <p>toggle prompt</p>
        </button>
      </div>
    );
  }
}
