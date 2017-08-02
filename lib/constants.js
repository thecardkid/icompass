'use strict';

module.exports.VERSION = 'v1.2';

module.exports.STICKY_COLORS = [
    '#FFAE27', // orange
    '#CCFFCC', // green
    '#FFCCFF', // pink
    '#CCCCFF', // purple
    '#CCFFFF', // blue
    '#FFFFCC', // yellow
];

const PROMPTS = {
    EXPORT: '<h3>I see you want to save this compass as a PDF. You can:</h3><p>1. Click \'Export\' and I can try to create a pdf for you, but the image quality may not be to your liking. Or</p><p>2. Take a screenshot (recommended)</p>',
    NOT_CONNECTED: 'You are not connected to the server',
    POST_IT_TOO_LONG: 'You can\'t fit that much on a post-it!',
    EMAIL_SENT: 'An email has been sent to you. Expect it in 5-10 minutes',
    EMAIL_NOT_SENT: 'I ran into an issue sending you the email. Please note down your codes manually somewhere. Thanks',
    CONFIRM_IMAGE_LINK: 'Is this an image you want to import?',
    CONFIRM_DELETE_COMPASS: 'Are you sure you want to delete this compass?',
    CONFIRM_DELETE_NOTE: 'Delete this note?',
    CONFIRM_BULK_DELETE_NOTES: 'Delete all selected notes?',
    COMPASS_NOT_FOUND: 'I couldn\'t find your compass. Please check the code you provided. The permissions (edit/view) and the code might not match.\n\nYou will now be directed to the login page',
    COMPASS_DELETED: 'This compass has been deleted. You will be redirected to the sign in page. Thanks for keeping the database clean!',
    SAVE_SUCCESS: 'Saved this workspace!',
    SAVE_FAIL: 'Something went wrong. Try again later?',
    CONFIRM_DELETE_BOOKMARK: 'Remove this workspace?',
    VISUAL_MODE_NO_CHANGE: 'You can\'t make changes to individual notes while in SELECT mode',
    VISUAL_MODE_NO_CREATE: 'You can\'t create new notes while in SELECT mode',
    DRAFT_MODE_NO_CHANGE: 'You can only edit drafts while in DRAFT mode',
    EXIT_DRAFT_WARNING: 'Changing modes now will discard all your drafts',
    CONFIRM_DISCARD_DRAFT: 'Discard this draft?',
    CANNOT_EDIT_DOODLE: 'Doodles cannot be changed once submitted',
    TIMEBOX: function(m, s) {
        return 'A timebox for ' + m + 'm' + s + 's has been created';
    },
    TIMEBOX_TOO_LONG: 'Timeboxes should not last longer than 30 minutes',
    TIMEBOX_NEGATIVE_VALUES: 'Negative values are not acceptable',
    TIMEBOX_TOO_MANY_SECONDS: 'Only 60 seconds in a minute',
    TIMEBOX_CANCELED: 'Timebox has been canceled',
    TIMEBOX_OVER: 'Timebox has expired',
};

module.exports.PROMPTS = PROMPTS;

const getModal = function(text, confirm, cancel, danger) {
    return { text, confirm, cancel, danger };
};

module.exports.MODALS = {
    IMPORT_IMAGE: getModal(PROMPTS.CONFIRM_IMAGE_LINK, 'Import', 'Cancel', false),
    EXPORT_PDF: getModal(PROMPTS.EXPORT, 'Export', 'Cancel', false),
    SHARE_LINK: function(url) {
        return '<h3>Share this link below:</h3><p>' + url + '</p>';
    },

    DISCARD_DRAFT: getModal(PROMPTS.CONFIRM_DISCARD_DRAFT, 'OK', 'Cancel', true),
    EXIT_DRAFT_MODE: getModal(PROMPTS.EXIT_DRAFT_WARNING, 'Discard', 'Cancel', true),
    DELETE_NOTE: getModal(PROMPTS.CONFIRM_DELETE_NOTE, 'Delete', 'Cancel', true),
    BULK_DELETE_NOTES: getModal(PROMPTS.CONFIRM_BULK_DELETE_NOTES, 'Delete All', 'Cancel', true),
    DELETE_BOOKMARK: getModal(PROMPTS.CONFIRM_DELETE_BOOKMARK, 'Delete', 'Cancel', true),
    DELETE_COMPASS: getModal(PROMPTS.CONFIRM_DELETE_COMPASS, 'Delete', 'Cancel', true),
};

module.exports.QUADRANTS_INFO = [
    {id: 'observations', prompt: 'What\'s happening? Why?'},
    {id: 'principles', prompt: 'What matters most?'},
    {id: 'ideas', prompt: 'What could happen?'},
    {id: 'experiments', prompt: 'What\'s a way to try?'}
];

module.exports.KEYCODES = {
    ESC: 27,
    ENTER: 13,
};

// The keys' order dictate how they are rendered
module.exports.EDITING_MODE = {
    VISUAL: 'VISUAL',
    COMPACT: 'COMPACT',
    NORMAL: 'NORMAL',
    DRAFT: 'DRAFT'
};

module.exports.COLORS = {
    RED: '#C21A03',
    GREEN: 'lightgreen',
    DARK: '#343434',
    LIGHT: '#EDEDED',
    BLUE: '#288AFF'
};

module.exports.ERROR_MSG = {
    REQUIRED: function(prop) {
        return prop + ' is required';
    },
    INVALID: function(prop) {
        return prop + ' is not valid';
    },
    TEXT_TOO_LONG: function(prop, len) {
        return prop + ' cannot be longer than ' + len + ' chars';
    },
    UNAME_HAS_NON_CHAR: 'Username can only contain a-zA-Z',
    CANT_FIND: 'Compass does not exist',
};

module.exports.CONTROLS = {
    'n': 'new note',
    'd': 'new doodle',
    's': 'toggle sidebar',
    'c': 'toggle chat',
    'a': 'about this app',
};

module.exports.PIXELS = {
    SHOW: '0px',
    HIDE_SIDEBAR: '-240px',
    HIDE_CHAT: '-270px',
};

module.exports.REGEX = {
    HAS_WHITESPACE: /\s/g,
    CHAR_ONLY: /[^a-zA-Z]+/,
    URL: /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i,
    EMAIL: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
};

module.exports.DRAGGABLE_RESTRICTIONS = {
    restriction: 'parent',
    endOnly: true,
    elementRect: {top:0, left:0, bottom:1, right:1}
};

module.exports.TWEET = 'https://twitter.com/home?status=Check%20out%20my%20%23innovatorscompass%3A%20http%3A//icompass.hieuqn.com/compass/view/';


module.exports.HOST = (process.env.NODE_ENV === 'production') ? 'https://icompass.hieuqn.com/' : 'http://localhost:8080/';


