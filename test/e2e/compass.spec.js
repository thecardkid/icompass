
var CONSTANTS = require('../../utils/constants.js');
var ERROR_MSG = CONSTANTS.ERROR_MSG;
var PROMPTS = CONSTANTS.PROMPTS;
var editCode, viewCode;
var wrongCode = '11223344';

module.exports = {
    'creating compass' : function(browser) {
        browser
        .url('http://localhost:8080')
        .waitForElementVisible('body', 1000)
        .assert.title('The Innovators\' Compass')
        .setValue('#username', 'Hieu')
        .setValue('#compass-center', 'DSA')
        .click('button[name=cMake]')
        .pause(500)
        .assert.cssProperty('#ic-sidebar', 'left', '0px')
        .getText('span[name=edit-code]', function(result) {
            this.assert.equal(typeof result, "object");
            this.assert.equal(result.status, 0);
            this.assert.equal(result.value.length, 8);
            editCode = result.value;
        })
        .getText('span[name=view-code]', function(result) {
            this.assert.equal(typeof result, "object");
            this.assert.equal(result.status, 0);
            this.assert.equal(result.value.length, 8);
            viewCode = result.value;
        })
        .assert.cssProperty('#ic-chat', 'bottom', '0px')
        .assert.containsText('#center', 'DSA')
        .assert.elementPresent('#vline')
        .assert.elementPresent('#hline')
    },

    'keystrokes': function(browser) {
        browser
        .keys('s').pause(500)
        .assert.cssProperty('#ic-sidebar', 'left', '-240px')
        .keys('c').pause(500)
        .assert.cssProperty('#ic-chat', 'bottom', '-265px')
        .keys('h').pause(500)
        .assert.elementPresent('#help-screen')
        .keys('w').pause(500)
        .assert.elementPresent('#explanation')
    },

    'note events': function(browser) {
        browser
        // open and close form
        .keys(['w','h','n'])
        .waitForElementVisible('#ic-note-form', 500)
        .click('button[name=nvm]')
        .assert.elementNotPresent('ic-note-form')
        // reopen form and submit sticky
        .keys('n')
        .assert.elementNotPresent('ic-sticky-note')
        .setValue('textarea[id=ic-form-text]', 'An observation')
        .click('button[name=ship]')
        .waitForElementVisible('.ic-sticky-note', 500)
        .assert.containsText('.ic-sticky-note', 'An observation')
        // edit sticky
        .click('.ic-sticky-note')
        .pause(500)
        .clearValue('#ic-form-text')
        .setValue('#ic-form-text', 'A principle')
        .click('button[name=ship]')
        .pause(500)
        .assert.containsText('.ic-sticky-note', 'A principle')
    },

    'chat events': function(browser) {
        browser
        .keys('c').pause(500)
        .assert.cssProperty('#ic-chat', 'bottom', '0px')
        .setValue('#message-text', 'Hello world!')
        .keys(browser.Keys.ENTER)
        .waitForElementVisible('.bubble', 500)
        .assert.containsText('.bubble', 'Hello world!')
    },

    'error messages': function(browser) {
        browser
        .url('http://localhost:8080')
        .waitForElementVisible('body', 1000)

        // find: empty args
        .click('button[name=cFind]')
        .pause(500)
        .assert.containsText('#validate-code', ERROR_MSG.REQUIRED)
        .assert.containsText('#validate-username', ERROR_MSG.REQUIRED)

        // make: empty args
        .click('button[name=cMake]')
        .pause(500)
        .assert.containsText('#validate-code', '')
        .assert.containsText('#validate-username', ERROR_MSG.REQUIRED)
        .assert.containsText('#validate-center', ERROR_MSG.REQUIRED)

        // make: invalid email
        .setValue('#email', 'hieumaster')
        .click('button[name=cMake]')
        .assert.containsText('#validate-email', ERROR_MSG.INVALID_EMAIL)
        .clearValue('#email')

        // make: center too long
        .setValue('#username', 'Hieu')
        .setValue('#compass-center', 'This is a string that hopefully will be longer than 30 characters')
        .click('button[name=cMake]')
        .pause(500)
        .assert.containsText('#validate-center', ERROR_MSG.TEXT_TOO_LONG(30))
        .clearValue('#username')
        .clearValue('#compass-center')

        // find: number in username, code too long
        .setValue('#compass-code', editCode+'8')
        .setValue('#username', 'Hieu3')
        .click('button[name=cFind]')
        .pause(500)
        .assert.containsText('#validate-code', ERROR_MSG.INVALID_CODE)
        .assert.containsText('#validate-username', ERROR_MSG.HAS_NUMBER)
        .clearValue('#compass-code')
        .clearValue('#username')

        // find: server can't find compass
        .setValue('#compass-code', wrongCode)
        .setValue('#username', 'Hieu')
        .click('button[name=cFind]')
        .pause(1000)
        .assert.containsText('#validate-code', ERROR_MSG.CANT_FIND)
        .clearValue('#compass-code')
        .clearValue('#username')

        // find: username too long
        .setValue('#compass-code', editCode)
        .setValue('#username', 'HieuHieuHieuHieuHieu')
        .click('button[name=cFind]')
        .pause(500)
        .assert.containsText('#validate-username', ERROR_MSG.TEXT_TOO_LONG(15))
        .clearValue('#compass-code')
        .clearValue('#username')
    },

    'compass edit mode': function(browser) {
        browser
        .setValue('#compass-code', editCode)
        .setValue('#username', 'Hieu')
        .click('button[name=cFind]')
        .pause(500)
        .waitForElementVisible('.ic-sticky-note', 500)
        .assert.containsText('.ic-sticky-note', 'A principle')
        .assert.cssProperty('#ic-sidebar', 'left', '0px')
        .assert.cssProperty('#ic-chat', 'bottom', '0px')
    },

    'compass view-only mode': function(browser) {
        browser
        .url('http://localhost:8080')
        .waitForElementVisible('body', 1000)
        .setValue('#compass-code', viewCode)
        .setValue('#username', 'Professor')
        .click('button[name=cFind]')
        .pause(500)
        .getAlertText(function(result) {
            this.assert.equal(typeof result, "object");
            this.assert.equal(result.status, 0);
            this.assert.equal(result.value, PROMPTS.VIEW_ONLY);
        })
        .acceptAlert()
        .pause(500)
        .assert.elementNotPresent('#ic-chat')
        .assert.elementNotPresent('#ic-sidebar')
        .assert.containsText('.ic-sticky-note', 'A principle')
        .end();
    }
}
