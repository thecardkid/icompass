import React, { Component } from 'react';
import ReactGA from 'react-ga';
import Tappable from 'react-tappable/lib/Tappable';

import SocketSingleton from '@utils/Socket';
import { workspaceMenu } from '@cypress/data_cy';

export default class ExportSubmenu extends Component {
  constructor(props) {
    super(props);
    this.socket = SocketSingleton.getInstance();
  }

  showExportGDocModal = () => {
    ReactGA.modalview('modals/export-gdoc');
    this.props.uiX.openExportAsTextModal();
    this.props.hideMenu();
  };

  showExportScreenshot = () => {
    ReactGA.modalview('modals/export-png');
    this.props.uiX.openExportAsScreenshotModal();
    this.props.hideMenu();
  };

  render() {
    return (
      <div className={'ic-menu ic-exports-submenu'}>
        <section>
          <Tappable onTap={this.showExportGDocModal}>
            <div data-cy={workspaceMenu.exportAsSubactions.googleDocs} className={'ic-menu-item'} onClick={this.showExportGDocModal}>
              Text
            </div>
          </Tappable>
          <Tappable onTap={this.showExportScreenshot}>
            <div data-cy={workspaceMenu.exportAsSubactions.screenshot} className={'ic-menu-item'} onClick={this.showExportScreenshot}>
              Screenshot (.png)
            </div>
          </Tappable>
        </section>
      </div>
    );
  }
}
