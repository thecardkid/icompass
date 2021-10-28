import React, { Component } from 'react';

import ToastSingleton from '../../utils/Toast';
import SocketSingleton from '../../utils/Socket';
import DynamicModal from './DynamicModal';
import events from 'socket-events';

export default class CopyWorkspaceModal extends Component {
  toast = ToastSingleton.getInstance();
  socket = SocketSingleton.getInstance();

  constructor(props) {
    super(props);

    this.socket.subscribe({
      [events.frontend.CREATED_COPY_OF_WORKSPACE]: (data) => {
        if (!data.success) {
          this.toast.error('There was a problem creating a copy of your workspace. Please report this error.');
        }
        window.open(`/compass/edit/${data.editCode}`, '_blank');
      },
    });
  }

  makeACopyOfWorkspace = () => {
    this.socket.emitCreateCopyOfWorkspace(this.props.compass.editCode);
  };

  render() {
    return (
      <DynamicModal
        className={'ic-modal-make-copy'}
        heading={'Make a Copy of this Workspace'}
        close={this.props.close}>
        <p className={'make-a-copy-explanation'}>Opens a new tab with a workspace that is a copy of your current workspace. The copy can be edited and shared independently of the original.</p>
        <div className={'actions'}>
          <button name={'make-copy'} onClick={this.makeACopyOfWorkspace}>Create "{this.props.compass.topic} (copy)" Workspace</button>
        </div>
      </DynamicModal>
    );
  }
}
