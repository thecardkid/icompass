module.exports.VERSION = 'v1.4.0';

module.exports.STICKY_COLORS = [
  '#FFAE27', // orange
  '#CCFFCC', // green
  '#FFCCFF', // pink
  '#CCCCFF', // purple
  '#CCFFFF', // blue
  '#FFFFCC', // yellow
];

const PROMPTS = {
  NOT_CONNECTED: 'You are not connected to the server',
  POST_IT_TOO_LONG: 'You can only fit 300 characters on a sticky note',
  EMAIL_SENT: 'An email has been sent to you. Expect it in 5-10 minutes',
  EMAIL_NOT_SENT: 'I ran into an issue sending you the email. Please note down your codes manually somewhere. Thanks',
  CONFIRM_IMAGE_LINK: 'Is this an image you want to import?',
  CONFIRM_DELETE_COMPASS: 'Are you sure you want to delete this workspace?',
  CONFIRM_DELETE_NOTE: 'Delete this note?',
  CONFIRM_BULK_DELETE_NOTES: 'Delete all selected notes?',
  COMPASS_NOT_FOUND: 'I couldn\'t find your compass. Please check the code you provided. The permissions (edit/view) and the code might not match.\n\nYou will now be directed to the login page',
  COMPASS_DELETED: 'This compass has been deleted. You will be redirected to the sign in page. Thanks for keeping the database clean!',
  SAVE_SUCCESS: 'Saved this workspace!',
  SAVE_FAIL: 'Something went wrong. Try again later?',
  CONFIRM_DELETE_BOOKMARK: 'Delete this bookmark?',
  VISUAL_MODE_NO_CHANGE: 'You can\'t make changes to individual notes while in SELECT mode',
  VISUAL_MODE_NO_CREATE: 'You can\'t create new notes while in SELECT mode',
  DRAFT_MODE_NO_CHANGE: 'You can only edit drafts while in DRAFT mode',
  EXIT_DRAFT_WARNING: 'Changing modes now will discard all your drafts',
  CONFIRM_DISCARD_DRAFT: 'Discard this draft?',
  CANNOT_EDIT_DOODLE: 'Doodles cannot be changed once submitted',
  PROMPT_NAME: 'Usernames must be letters-only, and no longer than 15 letters:',
};

module.exports.PROMPTS = PROMPTS;

const getModal = function(text, confirm, cancel, danger) {
  return { text: text, confirm: confirm, cancel: cancel, danger: danger };
};

module.exports.MODALS = {
  IMPORT_IMAGE: getModal(PROMPTS.CONFIRM_IMAGE_LINK, 'Import', 'No', false),
  SAVE_BOOKMARK: `<h3>Bookmark</h3><p>Bookmarks give you quick access to workspaces from the app's
                    home page - but can be lost if your browser cache is erased.<p>To never lose access
                    to your compass, email yourself a link, or copy and paste it somewhere secure.</p>`,
  EDIT_BOOKMARK: 'Enter a new name for your bookmark',

  DISCARD_DRAFT: getModal(PROMPTS.CONFIRM_DISCARD_DRAFT, 'OK', 'Cancel', true),
  EXIT_DRAFT_MODE: getModal(PROMPTS.EXIT_DRAFT_WARNING, 'Discard', 'Cancel', true),
  DELETE_NOTE: getModal(PROMPTS.CONFIRM_DELETE_NOTE, 'Delete', 'Cancel', true),
  BULK_DELETE_NOTES: getModal(PROMPTS.CONFIRM_BULK_DELETE_NOTES, 'Delete All', 'Cancel', true),
  DELETE_BOOKMARK: getModal(PROMPTS.CONFIRM_DELETE_BOOKMARK, 'Delete', 'Cancel', true),
  DELETE_COMPASS: getModal(PROMPTS.CONFIRM_DELETE_COMPASS, 'Delete', 'Cancel', true),
};

module.exports.KEYCODES = {
  ESC: 27,
  ENTER: 13,
};

module.exports.EDITING_MODE = {
  VISUAL: 'VISUAL',
  COMPACT: 'COMPACT',
  NORMAL: 'NORMAL',
  DRAFT: 'DRAFT',
};

module.exports.COLORS = {
  RED: '#C21A03',
  GREEN: 'lightgreen',
  DARK: '#343434',
  LIGHT: '#EDEDED',
  BLUE: '#288AFF',
};

module.exports.ERROR_MSG = {
  INVALID: function(prop) {
    return prop + ' is not valid';
  },
  UNAME_HAS_NON_CHAR: 'Username can only contain letters',
  CANT_FIND: 'Compass does not exist',
};

module.exports.REGEX = {
  HAS_WHITESPACE: /\s/g,
  CHAR_ONLY: /^[a-zA-Z]+$/,
  URL: /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i,
  EMAIL: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
};

module.exports.DRAGGABLE_RESTRICTIONS = {
  restriction: 'parent',
  endOnly: true,
  elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
};

module.exports.TWEET = 'https://twitter.com/home?status=Check%20out%20my%20%23innovatorscompass%3A%20http%3A//icompass.hieuqn.com/compass/view/';


module.exports.HOST = (process.env.NODE_ENV === 'production') ? 'https://icompass.hieuqn.com/' : 'http://localhost:8080/';


