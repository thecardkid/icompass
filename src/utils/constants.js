export const STICKY_COLORS = [
  '#FFAE27', // orange
  '#CCFFCC', // green
  '#FFCCFF', // pink
  '#CCCCFF', // purple
  '#CCFFFF', // blue
  '#FFFFCC', // yellow
];

export const EDITING_MODES = {
  VISUAL: 'VISUAL',
  COMPACT: 'COMPACT',
  NORMAL: 'NORMAL',
};

export function makeTwitterURL(workspaceViewCode) {
  return 'https://twitter.com/intent/tweet?text=Check%20out%20my%20%23innovatorscompass%3A%20https%3A//icompass.me/compass/view/' + workspaceViewCode;
}

export const CSS = {
  COLORS: {
    BLUE: '#288AFF',
  },
};

// String value doesn't matter as long as it's unique.
export const MODAL_NAME = {
  // Simple modals
  ABOUT_US: 'about_us',
  EXPLAIN_VIEW_MODES: 'explain_view_modes',
  PRIVACY_STATEMENT: 'privacy_statement',
  WHATS_NEW: 'whats_new',
  AUTO_EMAIL_FEATURE: 'auto_email_feature',

  // Confirm with redirect
  DISABLE_AUTO_EMAIL: 'disable_auto_email',
  DUPLICATE_USERNAME: 'duplicate_username',
  INVALID_USERNAME: 'invalid_username',
  REFRESH_REQUIRED: 'refresh_required',
  WORKSPACE_DELETED: 'workspace_deleted',
  WORKSPACE_NOT_FOUND: 'workspace_not_found',
  // Confirm deletes
  DELETE_BOOKMARK: 'delete_bookmark',
  DELETE_NOTE: 'delete_note',
  DELETE_NOTES: 'delete_notes',
  DELETE_DRAFT: 'delete_draft',
  DELETE_WORKSPACE: 'delete_workspace',
  // Confirm
  DISCONNECTED: 'disconnected',
  DISABLE_EMAIL_REMINDER: 'disable_email_reminder',

  // Prompts
  BOOKMARK_WORKSPACE: 'bookmark_workspace',
  EDIT_BOOKMARK: 'edit_bookmark',
  EMAIL_BOOKMARKS: 'email_bookmarks',
  EMAIL_WORKSPACE: 'email_workspace',
  PEOPLE_GROUPS: 'people_groups',
  PEOPLE_GROUPS_DISMISSABLE: 'people_groups_2',
  TOPIC: 'topic',
  USERNAME: 'username',

  // Custom
  COPY_WORKSPACE: 'copy_workspace',
  FEEDBACK: 'feedback',
  GET_STARTED_PROMPT: 'get_started_prompt',
  IMAGE: 'image',
  EXPORT_AS_TEXT: 'export_text',
  EXPORT_AS_SCREENSHOT: 'export_screenshot',
  SHARE_WORKSPACE: 'share_workspace',
};
