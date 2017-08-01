'use strict';

var ERROR_MSG = require('../../lib/constants.js').ERROR_MSG;
var code;

module.exports = {
    'loads correctly': function(browser) {
        browser
        .url('http://localhost:8080')
        .waitForElementVisible('body', 1000)
        .assert.title('The Innovators\' Compass')
        .assert.elementPresent('button[name=find]')
        .assert.elementPresent('button[name=make]')
        .windowMaximize();
    },

    'make path': function(browser) {
        browser
        .click('button[name=make]')
        .pause(100)
        .assert.containsText('div.prompt', 'Who are the PEOPLE involved, at the center of your compass?')
        .assert.elementPresent('#compass-center')
        .assert.elementPresent('#username');
    },

    'make path errors': function(browser) {
        browser
        .setValue('#username', 'sandbox')
        .click('button[name=next]')
        .assert.containsText('#error-message', ERROR_MSG.REQUIRED('People group'))
        .setValue('#compass-center', 'This is a really long people group that will hopefully exceed char limit')
        .click('button[name=next]')
        .assert.containsText('#error-message', ERROR_MSG.TEXT_TOO_LONG('People group', 30))
        .clearValue('#compass-center');
    },

    'make successful': function(browser) {
        browser
        .clearValue('#compass-center')
        .setValue('#compass-center', 'nightwatchjs')
        .click('button[name=next]')
        .waitForElementVisible('.third', 1000)
        .assert.containsText('.third h1', 'success')
        .assert.elementPresent('#email')
        .assert.elementPresent('button[name=to-workspace]')
        .click('button[name=to-workspace]')
        .url(function(result) {
            var parts = result.value.split('/');
            code = parts[5];
        })
        .url('http://localhost:8080');
    },

    'find path': function(browser) {
        browser
        .click('button[name=find]')
        .pause(500)
        .assert.containsText('div.prompt', 'What is the code you were given?')
        .assert.elementPresent('#compass-code')
        .assert.elementPresent('#username');
    },

    'find path errors': function(browser) {
        browser
        .click('button[name=next]')
        .assert.containsText('#error-message', ERROR_MSG.REQUIRED('A code'))
        .setValue('#compass-code', '1234567')
        .click('button[name=next]')
        .assert.containsText('#error-message', ERROR_MSG.INVALID('Your code'))
        .setValue('#compass-code', '8') //append to current
        .click('button[name=next]')
        .assert.containsText('#error-message', ERROR_MSG.REQUIRED('Username'))
        .setValue('#username', 'sandbox5')
        .click('button[name=next]')
        .assert.containsText('#error-message', ERROR_MSG.UNAME_HAS_NON_CHAR)
        .clearValue('#username')
        .setValue('#username', ',,,###')
        .click('button[name=next]')
        .assert.containsText('#error-message', ERROR_MSG.UNAME_HAS_NON_CHAR)
        .clearValue('#username')
        .setValue('#username', 'sandboxsandboxsandboxsandboxsandboxsandbox')
        .click('button[name=next]')
        .assert.containsText('#error-message', ERROR_MSG.TEXT_TOO_LONG('Username', 15))
        .clearValue('#username')
        .clearValue('#compass-code');
    },

    'find successful': function(browser) {
        browser
        .setValue('#compass-code', code)
        .setValue('#username', 'sandbox')
        .click('button[name=next]')
        .waitForElementVisible('.third', 1000)
        .assert.containsText('.third h1', 'Edit access')
        .assert.containsText('.third h2', 'You will be logged in as sandbox')
        .assert.elementPresent('button[name=to-workspace]')
        .click('button[name=to-workspace]')
        .waitForElementVisible('#ic-sidebar', 1000);
    },

    'cleanup': require('./utils').cleanup
};
