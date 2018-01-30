'use strict';

var MODALS = require('../../lib/constants.js').MODALS;
var top, left;

module.exports = {
    'creates successfully': require('./utils').setup,

    'renders correctly': function(browser) {
        browser
        .assert.elementPresent('#vline')
        .assert.elementPresent('#hline')
        .assert.elementPresent('#ic-sidebar')
        .assert.elementPresent('#ic-chat')
        .assert.elementPresent('#ic-show-chat')
        .assert.elementPresent('#ic-show-sidebar')
        .assert.elementPresent('#ic-modes')
        .assert.containsText('#center', 'nightwatchjs')
        .assert.elementPresent('#observations')
            .assert.containsText('#observations h1', 'OBSERVATIONS')
            .assert.containsText('#observations h2', 'What\'s happening? Why?')
        .assert.elementPresent('#principles')
            .assert.containsText('#principles h1', 'PRINCIPLES')
            .assert.containsText('#principles h2', 'What matters most?')
        .assert.elementPresent('#ideas')
            .assert.containsText('#ideas h1', 'IDEAS')
            .assert.containsText('#ideas h2', 'What ways are there?')
        .assert.elementPresent('#experiments')
            .assert.containsText('#experiments h1', 'EXPERIMENTS')
            .assert.containsText('#experiments h2', 'What\'s a step to try?');
    },

    'key bindings': function(browser) {
        browser
        .keys(['s', 'c', 'p'])
        .pause(500)
        .assert.cssProperty('#ic-sidebar', 'left', '-240px', 'Sidebar should be hidden')
        .assert.cssProperty('#ic-chat', 'bottom', '-270px', 'Chat should be hidden')
        .assert.elementPresent('#ic-about', 'Prompt should be visible')
        .keys(['p', 's'])
        .keys(['n'])
        .assert.elementPresent('#ic-note-form', 'Pressing "n" should show the note create form')
        .click('button[name=ship]')
        .assert.elementPresent('#ic-note-form', 'Submitting empty form should not dismiss the form')
        .click('button[name=nvm]')
        .assert.elementNotPresent('#ic-note-form', 'Clicking "never mind" should dismiss the form')
        .keys(['d'])
        .assert.elementPresent('#ic-doodle-form', 'Pressing "d" should show the doodle create form')
        .click('button[name=nvm]')
        .assert.elementNotPresent('#ic-doodle-form', 'Clicking "never mind" should dismiss the form');
    },

    'create sticky': function(browser) {
        browser
        .keys(['n'])
        .assert.elementNotPresent('ic-sticky-note')
        .setValue('#ic-form-text', 'An observation')
        .click('button[name=ship]')
        .waitForElementVisible('.ic-sticky-note')
        .assert.containsText('.ic-sticky-note', 'An observation', 'Created note should contain correct text');
    },

    'edit sticky': function(browser) {
        browser
        .moveToElement('.ic-sticky-note', 5, 5, function() {
            browser.doubleClick();
        })
        .pause(500)
        .clearValue('#ic-form-text')
        .setValue('#ic-form-text', 'A principle')
        .click('button[name=ship]')
        .pause(1000)
        .assert.containsText('.ic-sticky-note', 'A principle', 'Edited note should contain correct text');
    },

    'images': function(browser) {
        browser
        .keys('n')
        .assert.elementNotPresent('a.ic-img', 'Image tag should not exist yet')
        .setValue('#ic-form-text', 'https://s-media-cache-ak0.pinimg.com/736x/47/b9/7e/47b97e62ef6f28ea4ae2861e01def86c.jpg')
        .click('button[name=ship]')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body', MODALS.IMPORT_IMAGE.text, 'Modal should confirm that user wants to import an image')
        .click('#ic-modal-confirm')
        .pause(1000)
        .assert.elementPresent('a.ic-img', 'Accepting the prompt should import and render the image')

        .moveToElement('a.ic-img', 50, 50, function() {
            browser.doubleClick();
        })
        .pause(500)
        .assert.elementPresent('#ic-form-text')
        .click('button[name=ship]')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body', MODALS.IMPORT_IMAGE.text)
        .click('#ic-modal-cancel')
        .pause(1000)
        .assert.elementNotPresent('a.ic-img', 'Rejecting the prompt should just import regular text');
    },

    'dragging': function(browser) {
        browser
        .getLocation('#note1', function(result) {
            top = result.value.y;
            left = result.value.x;
        })
        .moveToElement('#note1', 10, 10, function() {
            browser
            .mouseButtonDown(0, function() {
                browser.moveTo(null, -300, -300);
            })
            .mouseButtonUp(0, function() {
                browser.getLocation('#note1', function(result) {
                    this.assert.equal(top - result.value.y, 300);
                    this.assert.equal(left - result.value.x, 300);
                });
            });
        });
    },

    'delete note': function(browser) {
        browser
        .moveToElement('#note1', 158, 3, function() {
            browser
            .mouseButtonClick(0)
            .waitForElementVisible('#ic-modal')
            .assert.containsText('#ic-modal-body', MODALS.DELETE_NOTE.text)
            .click('#ic-modal-cancel')
            .assert.elementPresent('#note1', 'Rejecting the delete modal should preserve the note');
        })
        .moveToElement('#note1', 158, 3, function() {
            browser
            .mouseButtonClick(0)
            .waitForElementVisible('#ic-modal')
            .click('#ic-modal-confirm')
            .waitForElementNotPresent('#note1', 5000);
        });
    },

    'compact mode': function(browser) {
        browser
        .getCssProperty('#note0 a', 'letter-spacing', function(result) {
            this.assert.notEqual('1px', result.value, 'Compact mode CSS should not apply');
        })
        .getCssProperty('#note0 a', 'overflow', function(result) {
            this.assert.notEqual('auto', result.value, 'Compact mode CSS should not apply');
        })
        .getCssProperty('#note0 a', 'height', function(result) {
            this.assert.notEqual('70px', result.value, 'Compact mode CSS should not apply');
        })
        .pause(100)
        .click('#ic-mode-compact')
        .pause(100)
        .assert.cssProperty('#note0 a', 'letter-spacing', '-1px')
        .assert.cssProperty('#note0 a', 'overflow', 'auto')
        .assert.cssProperty('#note0 a', 'max-height', '70px')
        .pause(100)
        .click('#ic-mode-normal')
        .pause(100);
    },

    'doodle events': function(browser) {
        browser
        .keys('d')
        .pause(500)
        .waitForElementVisible('#ic-doodle-form')
        .click('button[name=ship]')
        .assert.elementPresent('#ic-doodle-form', 'Shipping an empty doodle should not dismiss the form')
        .moveToElement('#ic-doodle', 155, 75, function() {
            browser
            .mouseButtonDown(0, function() {
                browser.moveTo(null ,100, 100);
            })
            .mouseButtonUp(0);
        })
        .pause(1000)
        .click('button[name=ship]')
        .waitForElementVisible('#note1')
        .getAttribute('#note1 .ic-img img', 'src', function(result) {
            this.assert.equal(result.value.includes('data:image/png;base64'), true, 'Image tag should contain base64 encoded doodle');
        });
    },

    'styling': function(browser) {
        browser
        .keys('n')
        .waitForElementVisible('#ic-note-form')
        .setValue('#ic-form-text', 'Text styling example')
        .assert.cssClassNotPresent('#ic-form-text', 'bold', 'Text should not be bold')
        .click('button[name=bold]')
        .pause(100)
        .assert.cssClassPresent('#ic-form-text', 'bold', 'Text should be bold')
        .click('button[name=bold]')
        .pause(100)
        .assert.cssClassNotPresent('#ic-form-text', 'bold', 'Text should not be bold')
        .click('button[name=italic]')
        .click('button[name=underline]')
        .pause(100)
        .click('button[name=ship]')
        .pause(500)
        .assert.elementPresent('#note2', 'New note should have been created')
        .assert.cssClassNotPresent('#note2', 'bold', 'Note should be bold')
        .assert.cssClassPresent('#note2 a p', 'italic', 'Note should be italic')
        .assert.cssClassPresent('#note2 a p', 'underline', 'Note should be underlined');
    },

    'double click create': function(browser) {
        browser
        .moveToElement('body', 300, 200)
        .doubleClick()
        .waitForElementVisible('#ic-note-form')
        .setValue('#ic-form-text', 'Double click to create')
        .click('button[name=ship]')
        .waitForElementVisible('#note3')
        .assert.cssProperty('#note3', 'left', '300px', 'Note 3 should have been created at the click location')
        .assert.cssProperty('#note3', 'top', '200px', 'Note 3 should have been created at the click location');
    },

    'chat events': function(browser) {
        browser
        .keys('c').pause(500)
        .assert.cssProperty('#ic-chat', 'bottom', '0px', 'Sidebar should be visible')
        .setValue('#message-text', 'Hello world!')
        .keys(browser.Keys.ENTER)
        .waitForElementVisible('.bubble')
        .assert.containsText('.bubble', 'Hello world!', 'Message should contain correct texet')
        .assert.cssClassPresent('.bubble', 'mine', 'Message should have correct class');
    },

    'cleanup': require('./utils').cleanup
};
