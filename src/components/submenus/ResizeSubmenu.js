import React, { Component } from 'react';
import Tappable from 'react-tappable/lib/Tappable';

import { trackFeatureEvent } from '../../utils/Analytics';
import SocketSingleton from '../../utils/Socket';

export default class ResizeSubmenu extends Component {
  socket = SocketSingleton.getInstance();

  beginCustomResize = () => {
    trackFeatureEvent('Menu: Set center custom position');
    this.props.uiX.enableDragCenter();
    this.props.hideMenu();
  };

  recenter = () => {
    trackFeatureEvent('Menu: Reset center position');
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
