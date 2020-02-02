import React, { Component } from 'react';
import ReactGA from 'react-ga';
import Tappable from 'react-tappable/lib/Tappable';

import SocketSingleton from '../../utils/Socket';

export default class ResizeSubmenu extends Component {
  socket = SocketSingleton.getInstance();

  beginCustomResize = () => {
    this.socket.emitMetric('menu custom set center');
    this.props.uiX.enableDragCenter();
    this.props.hideMenu();
  };

  recenter = () => {
    this.socket.emitMetric('menu reset center');
    this.socket.emitResetCenterPosition();
  };

  render() {
    return (
      <div className={'ic-menu ic-resize-submenu'}>
        <section>
          <Tappable onTap={this.beginCustomResize}>
            <div className={'ic-menu-item'} onClick={this.beginCustomResize}>
              Choose your own position
            </div>
          </Tappable>
          <Tappable onTap={this.recenter}>
            <div className={'ic-menu-item'} onClick={this.recenter}>
              Reset to center
            </div>
          </Tappable>
        </section>
      </div>
    );
  }
}
