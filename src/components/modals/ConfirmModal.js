/* eslint-disable quotes */

import * as React from 'react';

import { MODAL_NAME } from '@utils/constants';
import DynamicModal from './DynamicModal';
import { ModalFooter } from './shared';

function ConfirmModal(dynamicModalProps, paragraphs, confirmText = 'OK') {
  return class X extends React.Component {
    render() {
      const {
        onConfirm,
        cancelButton,
      } = this.props;
      const hasCancelButton = this.props.hasCancelButton || false;
      return (
        <DynamicModal {...dynamicModalProps}>
          {paragraphs.map((text, i) => <p dangerouslySetInnerHTML={{__html: text}} key={i} />)}
          <ModalFooter confirmButton={{
            text: confirmText,
            onConfirm,
          }} hasCancelButton={hasCancelButton} cancelButton={cancelButton} />
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

export const ConfirmDisableEmailReminders = ConfirmModal({
  modalName: MODAL_NAME.DISABLE_EMAIL_REMINDER,
  heading: 'Confirm your decision',
}, ['Disable reminders to email yourself a link when creating new workspaces?'], 'Disable');

const browserSpecificURL = (function() {
  const agent = window.navigator.userAgent.toLowerCase();
  switch (true) {
    case agent.indexOf("edg") > -1:
      // Edge
      return "https://support.microsoft.com/en-us/microsoft-edge/add-a-site-to-my-favorites-in-microsoft-edge-eb40d818-fd1f-cb19-d943-6fcfd1d9a935";
    case agent.indexOf("chrome") > -1 && !!window.chrome:
      // Chrome
      return "https://support.google.com/chrome/answer/188842";
    case agent.indexOf("firefox") > -1:
      // Mozilla Firefox
      return "https://support.mozilla.org/en-US/kb/bookmarks-firefox#w_how-do-i-bookmark-a-page";
    case agent.indexOf("safari") > -1:
      // Safari
      return "https://support.apple.com/guide/safari/bookmark-webpages-to-revisit-ibrw1039/mac";
    default:
      // other
      return "https://www.google.com/search?q=how+to+bookmark+a+website";
  }
})();
export const BookmarkDeprecationModal = ConfirmModal({
  modalName: MODAL_NAME.BOOKMARK_DEPRECATION,
  heading: 'In-app bookmarks sunsetting',
  width: 470,
}, [
  'Your existing in-app bookmarks on the home page will remain available until deleted by you. However, you will not be able to create new bookmarks.',
  `It is recommended that you use <a href="${browserSpecificURL}" target="_blank">browser bookmarks</a> to keep track of website links to your workspaces. Browser bookmarks can by synced across devices and stored securely, whereas in-app bookmarks will be lost permanently if site data is cleared, or if you lose your device.`,
  'This reminder will be shown when you use an in-app bookmark.',
]);
