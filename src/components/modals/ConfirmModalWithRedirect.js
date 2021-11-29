/* eslint-disable quotes */

import * as React from 'react';

import { MODAL_NAME } from '@utils/constants';
import DynamicModal from './DynamicModal';
import { ModalFooter } from './shared';

function ConfirmModalWithRedirect(dynamicModalProps, paragraphs) {
  return class X extends React.Component {
    render() {
      const {
        redirectURL,
      } = this.props;
      return (
        <DynamicModal {...dynamicModalProps}>
          {paragraphs.map((text, i) => <p dangerouslySetInnerHTML={{__html: text}} key={i} />)}
          <ModalFooter confirmButton={{
            text: 'OK',
            onConfirm: () => {
              window.location.href = redirectURL;
            },
          }}/>
        </DynamicModal>
      );
    }
  };
}

export const DisableAutoEmailModal = ConfirmModalWithRedirect({
  modalName: MODAL_NAME.DISABLE_AUTO_EMAIL,
  heading: 'Auto-email has been disabled',
  disableDismiss: true,
}, [
  'At your request, you will no longer receive automatic emails when creating workspaces. Click below to go to the home page.',
]);

export const WorkspaceNotFoundModal = ConfirmModalWithRedirect({
  modalName: MODAL_NAME.WORKSPACE_NOT_FOUND,
  heading: 'Workspace not found',
  disableDismiss: true,
}, [
  'Please check the code you provided. The permissions (edit/view) and the code might not match.',
  'You will now be directed to the home page.',
]);

export const WorkspaceDeletedModal = ConfirmModalWithRedirect({
  modalName: MODAL_NAME.WORKSPACE_DELETED,
  heading: 'Workspace deleted',
  disableDismiss: true,
}, [
  'Click below to go to the home page.',
]);

export const RefreshRequiredModal = ConfirmModalWithRedirect({
  modalName: MODAL_NAME.REFRESH_REQUIRED,
  heading: 'App updated!',
  disableDismiss: true,
}, [
  'Click below to refresh the page.',
]);
