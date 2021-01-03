export const contextMenu = {
  editAction: 'context-edit',
  upvoteAction: 'context-upvote',
  textToSpeechAction: 'context-tts',
  zoomAction: 'context-zoom',
  bringToFrontAction: 'context-bring-to-front',
  selectAction: 'context-select',
  discardAction: 'context-discard',
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
};

export function getColorAttr(c) {
  return `color-${c}`;
}
