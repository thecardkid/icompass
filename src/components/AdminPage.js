import '@css/admin_page.less';

import _ from 'underscore';
import React from 'react';
import request from 'superagent';

export default class AdminPage extends React.Component {
  state = {
    clientsByRoomID: {},
  };

  componentDidMount() {
    this.apiGetRooms();
  }

  apiGetRooms = () => {
    request.get('/admin/api/get_rooms')
      .end((err, res) => {
        if (err !== null) {
          alert(err);
        }
        this.setState({ clientsByRoomID: res.body.clientsByRoomID });
      });
  };

  render() {
    return (
      <div id={'admin_page'}>
        <div id={'workspaces_list'}>
          <h1 className={'section_header'}>List of Workspaces</h1>
          <p className={'action_link'} onClick={this.apiGetRooms}>refresh</p>
          {_.map(this.state.clientsByRoomID, (clients, roomID) => {
            return (
              <div className={'room'}>
                <p className={'header'}>Room ID: {roomID}. {clients.length} connection(s).</p>
                {_.map(clients, c => (
                  <div className={'client'}>
                    <p className={'username'}>{c.username}</p>
                    <p className={'user_agent'}>{c.userAgent}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
