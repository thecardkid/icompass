'use strict';

var ERROR_MSG = require('../../lib/constants.js').ERROR_MSG;
var code;

module.exports = {
    'loads correctly': function(browser) {
        browser
        .url('http://localhost:8080')
        .waitForElementVisible('body')
        .assert.title('The Innovators\' Compass')
        .assert.elementPresent('button[name=find]')
        .assert.elementPresent('button[name=make]');
    },

    'make path': function(browser) {
        browser
        .click('button[name=make]')
        .waitForElementVisible('input#compass-center')
        .getAttribute('input#compass-center', 'placeholder', function(result) {
            this.assert.equal('Who/what is at the center of your compass?', result.value);
        })
        .getAttribute('input#username', 'placeholder', function(result) {
            this.assert.equal('Your name', result.value);
        });
    },

    'make path errors': function(browser) {
        browser
        .setValue('#username', 'sandbox')
        .click('button[name=next]')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body', ERROR_MSG.REQUIRED('People group'))
        .click('#ic-modal-confirm')
        .setValue('#compass-center', 'This is a really long people group that will hopefully exceed char limit')
        .click('button[name=next]')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body', ERROR_MSG.TEXT_TOO_LONG('People group', 30))
        .click('#ic-modal-confirm')
        .clearValue('#compass-center');
    },

    'make successful': function(browser) {
        browser
        .clearValue('#compass-center')
        .setValue('#compass-center', 'nightwatchjs')
        .click('button[name=next]')
        .waitForElementVisible('.third')
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
        .waitForElementVisible('input#compass-code')
        .getAttribute('input#compass-code', 'placeholder', function(result) {
            this.assert.equal('The code of your compass', result.value);
        })
        .getAttribute('input#username', 'placeholder', function(result) {
            this.assert.equal('Your name', result.value);
        });
    },

    'find path errors': function(browser) {
        browser
        .click('button[name=next]')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body', ERROR_MSG.REQUIRED('A code'))
        .click('#ic-modal-confirm')
        .setValue('#compass-code', '1234567')
        .click('button[name=next]')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body', ERROR_MSG.INVALID('Your code'))
        .click('#ic-modal-confirm')
        .setValue('#compass-code', '8') //append to current
        .click('button[name=next]')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body', ERROR_MSG.REQUIRED('Username'))
        .click('#ic-modal-confirm')
        .setValue('#username', 'sandbox5')
        .click('button[name=next]')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body', ERROR_MSG.UNAME_HAS_NON_CHAR)
        .click('#ic-modal-confirm')
        .clearValue('#username')
        .setValue('#username', ',,,###')
        .click('button[name=next]')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body', ERROR_MSG.UNAME_HAS_NON_CHAR)
        .click('#ic-modal-confirm')
        .clearValue('#username')
        .setValue('#username', 'sandboxsandboxsandboxsandboxsandboxsandbox')
        .click('button[name=next]')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body', ERROR_MSG.TEXT_TOO_LONG('Username', 15))
        .click('#ic-modal-confirm')
        .clearValue('#username')
        .clearValue('#compass-code');
    },

    'find successful': function(browser) {
        browser
        .setValue('#compass-code', code)
        .setValue('#username', 'sandbox')
        .click('button[name=next]')
        .waitForElementVisible('.third')
        .assert.containsText('.third h1', 'Edit access')
        .assert.containsText('.third h2', 'You will be logged in as sandbox')
        .assert.elementPresent('button[name=to-workspace]')
        .click('button[name=to-workspace]')
        .waitForElementVisible('#ic-sidebar');
    },

    'cleanup': require('./utils').cleanup
};
