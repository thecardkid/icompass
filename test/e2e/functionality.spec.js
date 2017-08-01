'use strict';

var MODALS = require('../../lib/constants.js').MODALS;
var top, left, newTop, newLeft;

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
            .assert.containsText('#ideas h2', 'What could happen?')
        .assert.elementPresent('#experiments')
            .assert.containsText('#experiments h1', 'EXPERIMENTS')
            .assert.containsText('#experiments h2', 'What\'s a way to try?');
    },

    'key bindings': function(browser) {
        browser
        .keys(['s', 'c', 'p'])
        .pause(500)
        .assert.cssProperty('#ic-sidebar', 'left', '-240px')
        .assert.cssProperty('#ic-chat', 'bottom', '-270px')
        .assert.elementPresent('#ic-about')
        .keys(['p', 's'])
        .keys(['n'])
        .assert.elementPresent('#ic-note-form')
        .click('button[name=ship]')
        .assert.elementPresent('#ic-note-form')
        .click('button[name=nvm]')
        .assert.elementNotPresent('#ic-note-form')
        .keys(['d'])
        .assert.elementPresent('#ic-doodle-form')
        .click('button[name=nvm]')
        .assert.elementNotPresent('#ic-doodle-form');
    },

    'create sticky': function(browser) {
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
        .assert.containsText('.ic-sticky-note', 'An observation');
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
        .assert.containsText('.ic-sticky-note', 'A principle');
    },

    'images': function(browser) {
        browser
        .keys('n')
        .assert.elementNotPresent('a.ic-img')
        .setValue('#ic-form-text', 'https://s-media-cache-ak0.pinimg.com/736x/47/b9/7e/47b97e62ef6f28ea4ae2861e01def86c.jpg')
        .click('button[name=ship]')
        .waitForElementVisible('#ic-modal', 1000)
        .assert.containsText('#ic-modal-body', MODALS.IMPORT_IMAGE.text)
        .click('#ic-modal-confirm')
        .pause(1000)
        .assert.elementPresent('a.ic-img')
        // render as text not image
        .moveToElement('a.ic-img', 50, 50, function() {
            browser.doubleClick();
        })
        .pause(500)
        .assert.elementPresent('#ic-form-text')
        .click('button[name=ship]')
        .waitForElementVisible('#ic-modal', 1000)
        .assert.containsText('#ic-modal-body', MODALS.IMPORT_IMAGE.text)
        .click('#ic-modal-cancel')
        .pause(1000)
        .assert.elementNotPresent('a.ic-img');
    },

    'dragging': function(browser) {
        browser
        .getCssProperty('#note1', 'top', function(result) {
            top = Number(result.value.substring(0,result.value.length-2));
        })
        .getCssProperty('#note1', 'left', function(result) {
            left = Number(result.value.substring(0,result.value.length-2));
        })
        .moveToElement('#note1', 10, 10, function() {
            browser
            .mouseButtonDown(0, function() {
                browser.moveTo(null,-300,-300);
            })
            .mouseButtonUp(0, function() {
                browser.getCssProperty('#note1', 'top', function(result) {
                    newTop = Number(result.value.substring(0,result.value.length-2));
                    browser.getCssProperty('#note1', 'left', function(result) {
                        newLeft = Number(result.value.substring(0,result.value.length-2));
                        this.assert.equal(top - newTop, 300);
                        this.assert.equal(left - newLeft, 300);
                    });
                });
            });
        });
    },

    'delete note': function(browser) {
        browser
        .moveToElement('#note1', 158, 3, function() {
            browser
            .mouseButtonClick(0)
            .waitForElementVisible('#ic-modal', 1000)
            .assert.containsText('#ic-modal-body', MODALS.DELETE_NOTE.text)
            .click('#ic-modal-cancel')
            .assert.elementPresent('#note1')
        })
        .moveToElement('#note1', 158, 3, function() {
            browser
            .mouseButtonClick(0)
            .waitForElementVisible('#ic-modal', 1000)
            .click('#ic-modal-confirm')
            .waitForElementNotPresent('#note1', 5000);
        });
    },

    'compact mode': function(browser) {
        browser
        .getCssProperty('#note0 a', 'letter-spacing', function(result) {
            this.assert.notEqual(result.value, '-1px');
        })
        .getCssProperty('#note0 a', 'overflow', function(result) {
            this.assert.notEqual(result.value, 'auto');
        })
        .getCssProperty('#note0 a', 'height', function(result) {
            this.assert.notEqual(result.value, '70px');
        })
        .pause(100)
        .click('#ic-mode-compact')
        .pause(100)
        .getCssProperty('#note0 a', 'letter-spacing', function(result) {
            this.assert.equal(result.value, '-1px');
        })
        .getCssProperty('#note0 a', 'overflow', function(result) {
            this.assert.equal(result.value, 'auto');
        })
        .getCssProperty('#note0 a', 'max-height', function(result) {
            this.assert.equal(result.value, '70px');
        })
        .pause(100)
        .click('#ic-mode-normal')
        .pause(100);
    },

    'doodle events': function(browser) {
        browser
        .keys('d')
        .pause(500)
        .assert.elementPresent('#ic-doodle-form')
        .click('button[name=ship]')
        .assert.elementPresent('#ic-doodle-form')
        .moveToElement('#ic-doodle', 155, 75, function() {
            browser
            .mouseButtonDown(0, function() {
                browser.moveTo(null ,100, 100);
            })
            .mouseButtonUp(0);
        })
        .pause(1000)
        .click('button[name=ship]')
        .waitForElementVisible('#note1', 1000)
        .getAttribute('#note1 .ic-img img', 'src', function(result) {
            this.assert.equal(result.value.includes('data:image/png;base64'), true);
        });
    },

    'styling': function(browser) {
        browser
        .keys('n')
        .waitForElementVisible('#ic-note-form', 100)
        .setValue('#ic-form-text', 'Text styling example')
        .assert.cssClassNotPresent('#ic-form-text', 'bold')
        .click('button[name=bold]')
        .pause(100)
        .assert.cssClassPresent('#ic-form-text', 'bold')
        .click('button[name=bold]')
        .pause(100)
        .assert.cssClassNotPresent('#ic-form-text', 'bold')
        .click('button[name=italic]')
        .click('button[name=underline]')
        .pause(100)
        .click('button[name=ship]')
        .pause(500)
        .assert.elementPresent('#note2')
        .assert.cssClassNotPresent('#note2', 'bold')
        .assert.cssClassPresent('#note2 a p', 'italic')
        .assert.cssClassPresent('#note2 a p', 'underline');
    },

    'double click create': function(browser) {
        browser
        .moveToElement('body', 300, 200)
        .doubleClick()
        .waitForElementVisible('#ic-note-form', 100)
        .setValue('#ic-form-text', 'Double click to create')
        .click('button[name=ship]')
        .pause(500)
        .assert.elementPresent('#note3')
        .getCssProperty('#note3', 'left', function(result) {
            this.assert.equal(result.value, '300px');
        })
        .getCssProperty('#note3', 'top', function(result) {
            this.assert.equal(result.value, '200px');
        })
        .pause(500);
    },

    'chat events': function(browser) {
        browser
        .keys('c').pause(500)
        .assert.cssProperty('#ic-chat', 'bottom', '0px')
        .setValue('#message-text', 'Hello world!')
        .keys(browser.Keys.ENTER)
        .waitForElementVisible('.bubble', 500)
        .assert.containsText('.bubble', 'Hello world!')
        .assert.cssClassPresent('.bubble', 'mine');
    },

    'cleanup': require('./utils').cleanup
};
