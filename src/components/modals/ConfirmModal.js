/* eslint-disable quotes */

import * as React from 'react';

import { MODAL_NAME } from '@utils/constants';
import DynamicModal from './DynamicModal';
import { ModalFooter } from './shared';

function ConfirmModal(dynamicModalProps, paragraphs, confirmText = 'OK') {
  return class X extends React.Component {
    render() {
      return (
        <DynamicModal {...dynamicModalProps}>
          {paragraphs.map((text, i) => <p dangerouslySetInnerHTML={{__html: text}} key={i} />)}
          <ModalFooter confirmButton={{
            text: confirmText,
            onConfirm: this.props.onConfirm,
          }}/>
        </DynamicModal>
      );
    }
  };
}

export const AlertDisconnectedModal = ConfirmModal({
  modalName: MODAL_NAME.DISCONNECTED,
  heading: 'Are you still there?',
  disableDismiss: true,
}, ["You've left the workspace due to inactivity."], 'I\'m back');
