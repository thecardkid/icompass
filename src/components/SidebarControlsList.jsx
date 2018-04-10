import React, { Component } from 'react';

import Socket from '../utils/Socket.js';

export default class SidebarControlsList extends Component {
  constructor(props, context) {
    super(props, context);
    this.socket = new Socket();
  }

  render() {
    return (
      <div className="ic-sidebar-list" name="controls">
        <h2>Controls</h2>
        <button className="ic-action" onClick={() => this.props.uiX.showNewNote()}>
          <span className='ic-ctrl-key'>n</span>
          <p>new note</p>
        </button>
        <button className="ic-action" onClick={this.props.uiX.showDoodle}>
          <span className='ic-ctrl-key'>d</span>
          <p>new doodle</p>
        </button>
        <button className="ic-action" onClick={this.props.uiX.toggleSidebar}>
          <span className='ic-ctrl-key'>s</span>
          <p>toggle sidebar</p>
        </button>
        <button className="ic-action" onClick={this.props.uiX.toggleChat}>
          <span className='ic-ctrl-key'>c</span>
          <p>toggle chat</p>
        </button>
        <button className="ic-action" onClick={this.props.uiX.toggleAbout}>
          <span className='ic-ctrl-key'>p</span>
          <p>toggle prompt</p>
        </button>
      </div>
    );
  }
}
