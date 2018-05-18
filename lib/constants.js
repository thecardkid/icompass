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
  COMPASS_DELETED: 'This compass has been deleted. You will be redirected to the sign in page. Thanks for keeping the database clean!',
  SAVE_SUCCESS: 'Saved this workspace!',
  SAVE_FAIL: 'Something went wrong. Try again later?',
  VISUAL_MODE_NO_CHANGE: 'You can\'t make changes to individual notes while in BULK EDIT mode',
  VISUAL_MODE_NO_CREATE: 'You can\'t create new notes while in BULK EDIT mode',
  CANNOT_EDIT_DOODLE: 'Sketches cannot be edited',
  PROMPT_NAME: 'Usernames must be letters-only, and no longer than 15 letters:',
};

module.exports.PROMPTS = PROMPTS;

module.exports.KEYCODES = {
  ESC: 27,
  ENTER: 13,
};

module.exports.EDITING_MODE = {
  VISUAL: 'VISUAL',
  COMPACT: 'COMPACT',
  NORMAL: 'NORMAL',
};

module.exports.COLORS = {
  RED: '#C21A03',
  GREEN: 'lightgreen',
  DARK: '#343434',
  LIGHT: '#EDEDED',
  BLUE: '#288AFF',
};

module.exports.ERROR_MSG = {
  UNAME_HAS_NON_CHAR: 'Username cannot contain spaces or numbers. Only letters.',
  CANT_FIND: 'Compass does not exist',
};

module.exports.REGEX = {
  HAS_WHITESPACE: /\s/g,
  CHAR_ONLY: /^[a-zA-Z]+$/,
  URL: /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i,
  EMAIL: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
};

module.exports.TWEET = 'https://twitter.com/home?status=Check%20out%20my%20%23innovatorscompass%3A%20https%3A//icompass.me/compass/view/';

module.exports.HOST = process.env.HOST;

module.exports.S3_URL = process.env.S3_URL;
