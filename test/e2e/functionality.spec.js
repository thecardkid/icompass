
var PROMPTS = require('../../utils/constants.js').PROMPTS;
var top, left, newTop, newLeft;

module.exports = {
    'creates successfully': function(browser) {
        browser
        .url('http://localhost:8080')
        .waitForElementVisible('body', 1000)
        .click('button[name=make]')
        .setValue('#compass-center', 'nightwatchjs')
        .setValue('#username', 'sandbox')
        .click('button[name=go]')
        .waitForElementVisible('.third', 1000)
        .click('button[name=to-workspace]')
        .waitForElementVisible('#ic-sidebar', 1000)
    },

    'renders correctly': function(browser) {
        browser
        .assert.elementPresent('#vline')
        .assert.elementPresent('#hline')
        .assert.elementPresent('#ic-sidebar')
        .assert.elementPresent('#ic-chat')
        .assert.elementPresent('#show-chat')
        .assert.elementPresent('#show-sidebar')
        .assert.containsText('#center', 'nightwatchjs')
        .assert.elementPresent('#observations')
            .assert.containsText('#observations h1', 'OBSERVATIONS')
            .assert.containsText('#observations h2', 'What\'s happening? Why?')
        .assert.elementPresent('#principles')
            .assert.containsText('#principles h1', 'PRINCIPLES')
            .assert.containsText('#principles h2', 'What matters most?')
        .assert.elementPresent('#ideas')
            .assert.containsText('#ideas h1', 'IDEAS')
            .assert.containsText('#ideas h2', 'What could happen?')
        .assert.elementPresent('#experiments')
            .assert.containsText('#experiments h1', 'EXPERIMENTS')
            .assert.containsText('#experiments h2', 'What\'s a way to try?')
    },

    'key bindings': function(browser) {
        browser
        .keys(['s', 'c', 'w'])
        .pause(500)
        .assert.cssProperty('#ic-sidebar', 'left', '-240px')
        .assert.cssProperty('#ic-chat', 'bottom', '-265px')
        .assert.elementPresent('#explanation')
        .keys(['w', 's'])
        .keys(['n'])
        .assert.elementPresent('#ic-note-form')
        .click('button[name=ship]')
        .assert.elementPresent('#ic-note-form')
        .click('button[name=nvm]')
        .assert.elementNotPresent('#ic-note-form')
        .keys(['d'])
        .assert.elementPresent('#ic-doodle-form')
        .click('button[name=nvm]')
        .assert.elementNotPresent('#ic-doodle-form')
    },

    'note events': function(browser) {
        browser
        // open and close form
        .keys(['n'])
        .waitForElementVisible('#ic-note-form', 500)
        .click('button[name=nvm]')
        .assert.elementNotPresent('ic-note-form')
        // reopen form and submit sticky
        .keys('n')
        .assert.elementNotPresent('ic-sticky-note')
        .setValue('#ic-form-text', 'An observation')
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
        // create image sticky
        .keys('n')
        .assert.elementNotPresent('a.ic-img')
        .setValue('#ic-form-text', 'https://s-media-cache-ak0.pinimg.com/736x/47/b9/7e/47b97e62ef6f28ea4ae2861e01def86c.jpg')
        .click('button[name=ship]')
        .getAlertText(function(result) {
            this.assert.equal(result.value, PROMPTS.CONFIRM_IMAGE_LINK);
        })
        .acceptAlert()
        .pause(500)
        .assert.elementPresent('a.ic-img')
        // edit image
        .click('a.ic-img')
        .pause(500)
        .assert.elementPresent('#ic-form-text')
        .click('button[name=ship]')
        .getAlertText(function(result) {
            this.assert.equal(result.value, PROMPTS.CONFIRM_IMAGE_LINK);
        })
        .dismissAlert()
        .pause(500)
        .assert.elementNotPresent('a.ic-img')
        // drag note
        .getCssProperty('#note1', 'top', function(result) {
            top = Number(result.value.substring(0,result.value.length-2));
        })
        .getCssProperty('#note1', 'left', function(result) {
            console.log('left', result);
            left = Number(result.value.substring(0,result.value.length-2));
        })
        .moveToElement('#note1', 10, 10, function() {
            browser
            .mouseButtonDown(0, function() {
                browser.moveTo(null,-300,-300)
            })
            .mouseButtonUp(0, function() {
                browser.getCssProperty('#note1', 'top', function(result) {
                    newTop = Number(result.value.substring(0,result.value.length-2));
                    browser.getCssProperty('#note1', 'left', function(result) {
                        newLeft = Number(result.value.substring(0,result.value.length-2));
                        this.assert.equal(top - newTop, 300);
                        this.assert.equal(left - newLeft, 300);
                    })
                })
            })
        })
        // delete note
        .moveToElement('#note1', 184, 10, function() {
            browser
            .mouseButtonClick(0)
            .pause(500)
            .getAlertText(function(result) {
                this.assert.equal(result.value, PROMPTS.CONFIRM_DELETE_NOTE);
            })
            .dismissAlert()
            .assert.elementPresent('#note1')
            .mouseButtonClick(0)
            .pause(500)
            .acceptAlert()
            .pause(1000)
            .assert.elementNotPresent('#note1')
        })
    },

    'chat events': function(browser) {
        browser
        .keys('c').pause(500)
        .assert.cssProperty('#ic-chat', 'bottom', '0px')
        .setValue('#message-text', 'Hello world!')
        .keys(browser.Keys.ENTER)
        .waitForElementVisible('.bubble', 500)
        .assert.containsText('.bubble', 'Hello world!')
        .assert.cssClassPresent('.bubble', 'mine')
    },

    'cleanup': function(browser) {
        browser
        .click('#ic-sidebar button[name=destroyer]')
        .acceptAlert()
        .pause(500)
        .acceptAlert()
        .pause(500)
        .url(function(result) {
            this.assert.equal(result.value, 'http://localhost:8080/')
        })
        .end();
    }
}
