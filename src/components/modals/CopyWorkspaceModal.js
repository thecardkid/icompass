import React, { Component } from 'react';
import { connect } from 'react-redux';

import getAPIClient from '@utils/api';
import { MODAL_NAME } from '@utils/constants';
import Storage from '@utils/Storage';
import DynamicModal from './DynamicModal';
import { ModalFooter } from './shared';

class CopyWorkspaceModal extends Component {
  makeACopyOfWorkspace = async () => {
    const out = await getAPIClient().createCopyOfWorkspace({ editCode: this.props.compass.editCode });
    if (!out) {
      return;
    }
    Storage.setWorkspace(out.newWorkspaceCode, {
      drafts: Storage.getDrafts(this.props.compass.editCode),
    });
    window.open(`/compass/edit/${out.newWorkspaceCode}`, '_blank');
  };

  render() {
    return (
      <DynamicModal
        modalName={MODAL_NAME.COPY_WORKSPACE}
        className={'ic-modal-make-copy'}
        heading={'Make a copy of this workspace'}
      >
        <p className={'make-a-copy-explanation'}>Opens a new tab with a workspace that is a copy of your current workspace. The copy can be edited and shared independently of the original.</p>
        <ModalFooter confirmButton={{
          text: 'Create Copy',
          onConfirm: this.makeACopyOfWorkspace,
        }} />
      </DynamicModal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    compass: state.compass,
  };
};

const mapDispatchToProps = () => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(CopyWorkspaceModal);
