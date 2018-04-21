import React, { Component } from 'react';

export default class WorkspaceMenu extends Component {
  render() {
    return (
      <div id={'ic-workspace-menu'}>
        <button className={'ic-workspace-button floating-button'}>
          <i className="material-icons">menu</i>
        </button>
      </div>
    );
  }
}
