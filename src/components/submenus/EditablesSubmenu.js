import React, { Component } from 'react';
import Tappable from 'react-tappable/lib/Tappable';

import SocketSingleton from '@utils/Socket';
import { workspaceMenu } from '@cypress/data_cy';

export default class EditablesSubmenu extends Component {
  socket = SocketSingleton.getInstance();

  openPeopleGroupModal = () => {
    this.props.uiX.openPeopleGroupsDismissableModal();
    this.props.hideMenu();
  };

  openTopicModal = () => {
    this.props.uiX.openTopicPromptModal();
    this.props.hideMenu();
  };

  render() {
    return (
      <div className={'ic-menu ic-editables-submenu'}>
        <section>
          <Tappable onTap={this.beginCustomResize}>
            <div data-cy={workspaceMenu.editablesSubactions.peopleGroup} className={'ic-menu-item'} onClick={this.openPeopleGroupModal}>
              People Groups Involved
            </div>
          </Tappable>
          <Tappable onTap={this.recenter}>
            <div data-cy={workspaceMenu.editablesSubactions.topic} className={'ic-menu-item'} onClick={this.openTopicModal}>
              Topic
            </div>
          </Tappable>
        </section>
      </div>
    );
  }
}
