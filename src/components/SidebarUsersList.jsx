import React, { Component } from 'react';
import _ from 'underscore';

import Socket from '../utils/Socket.js';

export default class SidebarUsersList extends Component {
  constructor(props, context) {
    super(props, context);
    this.socket = new Socket();
  }

  renderUserTab = (color, username) => {
    let label = username === this.props.me ? `You [ ${username} ]` : username;
    return (
      <p key={username} className="ic-user" style={{ background: color }}>
        {label}
      </p>
    );
  };

  render() {
    const userList = _.map(this.props.users, this.renderUserTab);

    return (
      <div className="ic-sidebar-list" name="users">
        <h2>Collaborators</h2>
        {userList}
      </div>
    );
  }
}
