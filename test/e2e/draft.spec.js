'use strict';

var PROMPTS = require('../../lib/constants').PROMPTS;
var MODALS = require('../../lib/constants').MODALS;
var DOG_PHOTO_LINK = 'https://www.cesarsway.com/sites/newcesarsway/files/styles/large_article_preview/public/Common-dog-behaviors-explained.jpg?itok=FSzwbBoi';
var TEXT = 'this is a note',
    POSITIONS = [ {x: 400, y: 200}, {x: 500, y: 200} ];

module.exports = {
    'creates successfully': function(browser) {
        browser
        .url('http://localhost:8080')
        .waitForElementVisible('body', 1000)
        .click('button[name=make]')
        .setValue('#compass-center', 'nightwatchjs')
        .setValue('#username', 'sandbox')
        .click('button[name=next]')
        .waitForElementVisible('.third', 1000)
        .click('button[name=to-workspace]')
        .waitForElementVisible('#ic-sidebar', 1000)
        .windowMaximize();
    },

    'create normal notes': function(browser) {
        var p;
        for (var i=0; i<POSITIONS.length; i++) {
            p = POSITIONS[i];
            browser
            .moveToElement('body', p.x, p.y)
            .doubleClick()
            .waitForElementVisible('#ic-note-form', 100)
            .setValue('#ic-form-text', TEXT)
            .click('button[name=ship]')
            .pause(500);
        }
    },

    'edits to normal notes are disabled': function(browser) {
        browser
        .click('#ic-mode-draft')
        .moveToElement('#note0', 10, 10)
        .mouseButtonDown(0, function() {
            browser.moveTo(null, -100, 0);
        })
        .mouseButtonUp(0, function() {
            browser
            .waitForElementVisible('#ic-toast span', 100)
            .assert.cssClassPresent('#ic-toast span', 'warning')
            .assert.containsText('#ic-toast span', PROMPTS.DRAFT_MODE_NO_CHANGE);
        })
        .moveToElement('#note0', 10, 10)
        .doubleClick()
        .waitForElementVisible('#ic-toast span', 100)
        .assert.cssClassPresent('#ic-toast span', 'warning')
        .assert.containsText('#ic-toast span', PROMPTS.DRAFT_MODE_NO_CHANGE)
        .click('#ic-toast span');
    },

    'create text draft': function(browser) {
        var NOTE_TEXT = 'A draft text note';
        browser
        .keys(['s', 'c'])
        .click('#ic-mode-draft')
        // create text note
        .moveToElement('body', 200, 500)
        .doubleClick()
        .waitForElementVisible('#ic-note-form', 5000)
        .getCssProperty('#ic-form-text', 'background', function (result) {
            this.assert.equal(result.value.includes('rgb(128, 128, 128)'), true);
        })
        .assert.containsText('h1.ic-modal-title', 'Create a draft')
        .setValue('#ic-form-text', NOTE_TEXT)
        .click('button[name=ship]')
        .waitForElementVisible('#note2', 5000) // drafts come first
        .assert.containsText('#note0', NOTE_TEXT)
        .assert.elementPresent('#note0 span a p.submit');
    },

    'create image drafts': function(browser) {
        browser
        .moveToElement('body', 400, 500)
        .doubleClick()
        .waitForElementVisible('#ic-note-form', 5000)
        .setValue('#ic-form-text', DOG_PHOTO_LINK)
        .click('button[name=ship]')
        .waitForElementVisible('#ic-modal', 1000)
        .assert.containsText('#ic-modal-body', MODALS.IMPORT_IMAGE.text)
        .click('#ic-modal-confirm')
        .pause(200)
        .assert.elementPresent('#note1 span a img')
        .assert.elementPresent('#note1 span a p.submit');
    },

    'create doodle drafts': function(browser) {
        browser
        .keys(['d'])
        .waitForElementVisible('#ic-doodle-form', 5000)
        .moveToElement('#ic-doodle', 155, 75, function() {
            browser
            .mouseButtonDown(0, function() {
                browser.moveTo(null ,100, 100);
            })
            .mouseButtonUp(0);
        })
        .pause(1000)
        .click('button[name=ship]')
        .waitForElementVisible('#note2', 500)
        .getAttribute('#note2 span a img', 'src', function(result) {
            this.assert.equal(result.value.indexOf('data:image/png;base64'), 0);
        })
    },

    'edit drafts': function(browser) {
        var EDITED_TEXT = 'Edited text';
        browser
        .moveToElement('#note0', 10, 10)
        .doubleClick()
        .waitForElementVisible('#ic-note-form', 5000)
        .assert.containsText('h1.ic-modal-title', 'Edit this draft')
        .clearValue('#ic-form-text')
        .setValue('#ic-form-text', EDITED_TEXT)
        .click('button[name=bold]').click('button[name=underline]')
        .click('button[name=ship]')
        .pause(200)
        .assert.containsText('#note0', EDITED_TEXT)
        .assert.cssClassPresent('#note0 span a p', 'bold')
        .assert.cssClassPresent('#note0 span a p', 'underline')
        // try to edit doodle
        .moveToElement('#note2', 10, 10)
        .doubleClick()
        .waitForElementVisible('#ic-toast span', 100)
        .assert.cssClassPresent('#ic-toast span', 'warning')
        .assert.containsText('#ic-toast span', PROMPTS.CANNOT_EDIT_DOODLE);
    },

    'delete a draft': function(browser) {
        browser
        .moveToElement('body', 600, 600)
        .doubleClick()
        .setValue('#ic-form-text', 'To be deleted')
        .click('button[name=ship]')
        .moveToElement('#note3', 20, 20)
        .click('#note3 button.ic-close-window')
        .click('#ic-modal-confirm')
        .pause(100)
        .getCssProperty('#note3 span a', 'background', function(result) {
            this.assert.equal(result.value.includes('rgb(128, 128, 128)'), false);
        });
    },

    'submit drafts': function(browser) {
        // submit starting with most recently-created so we can check backgrounds
        browser
        .click('#note2 span a p.submit')
        .pause(100)
        .getCssProperty('#note2 span a', 'background', function(result) {
            this.assert.equal(result.value.includes('rgb(128, 128, 128)'), false);
        })
        .click('#note1 span a p.submit')
        .pause(100)
        .getCssProperty('#note1 span a', 'background', function(result) {
            this.assert.equal(result.value.includes('rgb(128, 128, 128)'), false);
        })
        // changing mode should trigger warning
        .click('#ic-mode-normal')
        .waitForElementVisible('#ic-modal', 1000)
        .assert.containsText('#ic-modal-body', MODALS.EXIT_DRAFT_MODE.text)
        .click('#ic-modal-confirm') // accepting alert should discard remaining drafts
        .getCssProperty('#note0 span a', 'background', function(result) {
            this.assert.equal(result.value.includes('rgb(128, 128, 128)'), false);
        });
    },

    'cleanup': function(browser) {
        browser
        .keys('s') // show sidebar
        .waitForElementVisible('#ic-sidebar button[name=destroyer]', 1000)
        .click('#ic-sidebar button[name=destroyer]')
        .waitForElementVisible('#ic-modal', 1000)
        .click('#ic-modal-confirm')
        .pause(200)
        .click('#ic-modal-confirm')
        .pause(500)
        .url(function(result) {
            this.assert.equal(result.value, 'http://localhost:8080/');
        })
        .end();
    }
};

