import verge from 'verge';
import { MODAL_NAME } from '@utils/constants';

export const enableDragCenter = () => {
  return { type: 'enableDragCenter' };
};

export const disableDragCenter = () => {
  return { type: 'disableDragCenter' };
};

export const showNewNote = (event) => {
  return {
    type: 'showNewNote',
    event,
  };
};

export const showEdit = (idx, note) => {
  return {
    type: 'showEdit',
    idx,
    note,
  };
};

export const showImage = (event) => {
  return {
    type: 'showImage',
    event,
  };
};

export const editImage = (idx, note) => {
  return {
    type: 'editImage',
    idx,
    note,
  };
};

export const showDoodle = (event) => {
  return {
    type: 'showDoodle',
    event,
  };
};

export const switchToImage = () => {
  return {
    type: 'switchToImage',
  };
};

export const switchToDoodle = () => {
  return {
    type: 'switchToDoodle',
  };
};

export const switchToText = () => {
  return {
    type: 'switchToText',
  };
};

export const changeFormColor = (color) => {
  return {
    type: 'changeFormColor',
    color,
  };
};

export const closeForm = () => {
  return {
    type: 'closeForm',
  };
};

export const focusOnNote = (idx) => {
  return {
    type: 'focusOnNote',
    idx,
  };
};

export const normalMode = () => {
  return {
    type: 'normalMode',
  };
};

export const compactMode = () => {
  return {
    type: 'compactMode',
  };
};

// There are two reducers for this action.
export const visualMode = (len) => {
  return {
    type: 'visualMode',
    len,
  };
};

export const resize = () => {
  return {
    type: 'resize',
    screenHeight: verge.viewportH(),
    screenWidth: verge.viewportW(),
  };
};

function openModalAction(modalName) {
  return () => ({
    type: 'openModal',
    name: modalName,
  });
}

export const closeCurrentModal = openModalAction(null);
export const openShareModal = openModalAction(MODAL_NAME.SHARE_WORKSPACE);
export const openExportAsTextModal = openModalAction(MODAL_NAME.EXPORT_AS_TEXT);
export const openExportAsScreenshotModal = openModalAction(MODAL_NAME.EXPORT_AS_SCREENSHOT);
export const openFeedbackModal = openModalAction(MODAL_NAME.FEEDBACK);
export const openCopyWorkspaceModal = openModalAction(MODAL_NAME.COPY_WORKSPACE);
export const openDisableAutoEmailModal = openModalAction(MODAL_NAME.DISABLE_AUTO_EMAIL);
export const openAboutUsModal = openModalAction(MODAL_NAME.ABOUT_US);
export const openExplainViewModesModal = openModalAction(MODAL_NAME.EXPLAIN_VIEW_MODES);
export const openPrivacyStatementModal = openModalAction(MODAL_NAME.PRIVACY_STATEMENT);
export const openWhatsNewModal = openModalAction(MODAL_NAME.WHATS_NEW);
export const openWorkspaceNotFoundModal = openModalAction(MODAL_NAME.WORKSPACE_NOT_FOUND);
export const openInvalidUsernameModal = openModalAction(MODAL_NAME.INVALID_USERNAME);
export const openDuplicateUsernameModal = openModalAction(MODAL_NAME.DUPLICATE_USERNAME);
export const openWorkspaceDeletedModal = openModalAction(MODAL_NAME.WORKSPACE_DELETED);
export const openRefreshRequiredModal = openModalAction(MODAL_NAME.REFRESH_REQUIRED);
export const openDeleteBookmarkModal = openModalAction(MODAL_NAME.DELETE_BOOKMARK);
export const openDeleteNoteModal = openModalAction(MODAL_NAME.DELETE_NOTE);
export const openDeleteNotesModal = openModalAction(MODAL_NAME.DELETE_NOTES);
export const openDeleteDraftModal = openModalAction(MODAL_NAME.DELETE_DRAFT);
export const openDeleteWorkspaceModal = openModalAction(MODAL_NAME.DELETE_WORKSPACE);
export const openEmailBookmarksModal = openModalAction(MODAL_NAME.EMAIL_BOOKMARKS);
export const openEmailWorkspaceModal = openModalAction(MODAL_NAME.EMAIL_WORKSPACE);
export const openPeopleGroupsModal = openModalAction(MODAL_NAME.PEOPLE_GROUPS);
export const openPeopleGroupsDismissableModal = openModalAction(MODAL_NAME.PEOPLE_GROUPS_DISMISSABLE);
export const openUsernamePromptModal = openModalAction(MODAL_NAME.USERNAME);
export const openDisconnectedModal = openModalAction(MODAL_NAME.DISCONNECTED);
export const openGetStartedModal = openModalAction(MODAL_NAME.GET_STARTED_PROMPT);
export const openImageModal = openModalAction(MODAL_NAME.IMAGE);
export const openAutoEmailFeatureModal = openModalAction(MODAL_NAME.AUTO_EMAIL_FEATURE);
export const openTopicPromptModal = openModalAction(MODAL_NAME.TOPIC);
export const openDisableEmailReminderModal = openModalAction(MODAL_NAME.DISABLE_EMAIL_REMINDER);
export const showBookmarkDeprecationModal = openModalAction(MODAL_NAME.BOOKMARK_DEPRECATION);

// Every open*Modal call will clear out modalExtras, so call this after.
export const setModalExtras = (modalExtras) => {
  return {
    type: 'setModalExtras',
    modalExtras,
  };
};

export const reset = () => {
  return {
    type: 'resetUI',
  };
};

export const setIsFiona = () => {
  return {
    type: 'setIsFiona',
  };
};

export const toastInfo = (message) => {
  return {
    type: 'setToast',
    toast: {
      type: 'info',
      message,
    },
  };
};

export const toastSuccess = (message) => {
  return {
    type: 'setToast',
    toast: {
      type: 'success',
      message,
    },
  };
};

export const toastError = (message) => {
  return {
    type: 'setToast',
    toast: {
      type: 'error',
      message,
    },
  };
};

export const specialToasts = {
  automaticEmail: 'auto_email',
  emailReminder: 'email_reminder',
};
export const toastAutomaticEmail = (isSuccess, recipientEmail) => {
  return {
    type: 'setToast',
    toast: {
      type: isSuccess ? 'success' : 'error',
      message: specialToasts.automaticEmail,
      recipientEmail,
    },
  };
};
export const toastEmailReminder = () => {
  return {
    type: 'setToast',
    toast: {
      type: 'info',
      message: specialToasts.emailReminder,
    },
  };
};

export const toastClear = () => {
  return {
    type: 'clearToast',
  };
};

export const autoEmailSent = () => {
  return {
    type: 'autoEmailSent',
  };
};

export const setIsMobileDevice = () => {
  return {
    type: 'setIsMobile',
  };
};
