export const contextMenu = {
  editAction: 'context-edit',
  upvoteAction: 'context-upvote',
  textToSpeechAction: 'context-tts',
  zoomAction: 'context-zoom',
  bringToFrontAction: 'context-bring-to-front',
  selectAction: 'context-select',
  discardAction: 'context-discard',

  addNoteHere: 'context-add-here',
};

export const workspaceMenu = {
  newWorkspace: 'action-new-workspace',
  copyWorkspace: 'action-copy-workspace',
  darkTheme: 'action-dark-theme',
  email: 'action-email-modal',
  bookmark: 'action-boomark',
  share: 'action-share-modal',
  users: 'action-users',
  logout: 'action-logout',
  deleteWorkspace: 'action-delete-workspace',

  exportAs: 'action-exports',
  exportAsSubactions: {
    googleDocs: 'export-text',
    screenshot: 'export-png',
  },

  // AKA Things-that-can-be-edited-that-makes-sense-to-put-here.
  // "Edit actions" would be more accurate, but creates confusing
  // variable names.
  editables: 'actions-edit-actions',
  editablesSubactions: {
    peopleGroup: 'people-group',
    topic: 'topic',
  },

  moveCenter: 'action-move-center',
  moveCenterSubactions: {
    customPosition: 'custom-position',
    reset: 'reset',
  },

  notes: 'action-notes',
  notesSubactions: {
    text: 'text',
    image: 'image',
    doodle: 'doodle',
  },

  modes: 'action-modes',
  modesSubactions: {
    standard: 'standard',
    compact: 'compact',
    bulk: 'bulk',
    explain: 'explain',
  },
};

export const helpMenu = {
  getStarted: 'help-get-started',
  guide: 'help-guide',
  aboutUs: 'help-about-us',
  privacyStatement: 'help-privacy-statement',
  whatsNew: 'help-whats-new',
  leaveFeedback: 'help-leave-feedback',
  github: 'help-github',
};

export const modal = {
  heading: 'modal-heading',
  confirmButton: 'modal-confirm',
  closeButton: 'modal-close',

  // For things that trigger a modal.
  whatsThis: 'whats-this',
  emailReminderGo: 'email-reminder-go',
  emailReminderDisable: 'email-reminder-disable',
};

export const helpers = {
  triggerEmailReminderToast: 'email',
};

export function getColorAttr(c) {
  if (c.indexOf('#') === 0) {
    return `color${c.substr(1)}`;
  }
  return `color${c}`;
}
