import React, { Component } from 'react';

import { createCopyOfWorkspace } from '../../utils/api';
import DynamicModal from './DynamicModal';

export default class CopyWorkspaceModal extends Component {
  makeACopyOfWorkspace = async () => {
    const out = await createCopyOfWorkspace({ editCode: this.props.compass.editCode });
    if (!out) {
      return;
    }
    window.open(`/compass/edit/${out.newWorkspaceCode}`, '_blank');
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
