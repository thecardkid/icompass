
module.exports.exportPrompt = 'I see you want to save this compass as a PDF. You can:\n\n1. Click \'OK\' and I can try to create a pdf for you, but the image quality may not be to your liking. Or\n\n2. Click \'Cancel\' and take a screenshot (recommended)';

module.exports.quadrantsInfo = [
    {id: 'observations', prompt: 'What\'s happening? Why?'},
    {id: 'principles', prompt: 'What matters most?'},
    {id: 'ideas', prompt: 'What could happen?'},
    {id: 'experiments', prompt: 'What\'s a way to try?'}
];

module.exports.helpTips = [
    'Share your code to collaborate',
    'Each user has a different sticky note color',
    'Familiarize yourself with the CONTROLS in the menu',
    'Click a sticky note to edit it',
    'If keys stop working, hit Esc a few times'
];

module.exports.controls = {
    'n': 'new post-it',
    's': 'toggle sidebar',
    'c': 'toggle chat',
    'w': 'what is this?',
    'h': 'toggle help',
};

module.exports.modes = {
    edit: 0,
    view: 1,
};

module.exports.keys = {
    N: 78,
    C: 67,
    H: 72,
    W: 87,
    S: 83,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    CMD: 91,
    ENTER: 13,
};

