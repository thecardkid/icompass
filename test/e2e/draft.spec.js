'use strict';

var PROMPTS = require('../../lib/constants').PROMPTS;
var MODALS = require('../../lib/constants').MODALS;
var DOG_PHOTO_LINK = 'https://www.cesarsway.com/sites/newcesarsway/files/styles/large_article_preview/public/Common-dog-behaviors-explained.jpg?itok=FSzwbBoi';
var TEXT = 'this is a note',
    POSITIONS = [ {x: 400, y: 200}, {x: 500, y: 200} ];

module.exports = {
    'creates successfully': require('./utils').setup,

    'create normal notes': function(browser) {
        var p;
        for (var i=0; i<POSITIONS.length; i++) {
            p = POSITIONS[i];
            browser
            .moveToElement('body', p.x, p.y)
            .doubleClick()
            .waitForElementVisible('#ic-note-form')
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
            .waitForElementVisible('#ic-toast span')
            .assert.cssClassPresent('#ic-toast span', 'warning', 'Toast should be a warning')
            .assert.containsText('#ic-toast span', PROMPTS.DRAFT_MODE_NO_CHANGE, 'Toast should contain correct warning message');
        })
        .moveToElement('#note0', 10, 10)
        .doubleClick()
        .waitForElementVisible('#ic-toast span')
        .assert.cssClassPresent('#ic-toast span', 'warning', 'Toast should be a warning')
        .assert.containsText('#ic-toast span', PROMPTS.DRAFT_MODE_NO_CHANGE, 'Toast should contain correct warning message')
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
        .waitForElementVisible('#ic-note-form')
        .assert.cssProperty('#ic-form-text', 'background-color', 'rgba(128, 128, 128, 1)', 'Background of draft should be grey')
        .assert.containsText('h1.ic-modal-title', 'Create a draft', '#ic-note-form should have correct header')
        .setValue('#ic-form-text', NOTE_TEXT)
        .click('button[name=ship]')
        .waitForElementVisible('#note2') // drafts come first
        .assert.containsText('#note0', NOTE_TEXT, 'Created draft should contain correct text')
        .assert.elementPresent('#note0 span a p.submit', 'There should be a submit button on the draft');
    },

    'create image drafts': function(browser) {
        browser
        .moveToElement('body', 400, 500)
        .doubleClick()
        .waitForElementVisible('#ic-note-form')
        .setValue('#ic-form-text', DOG_PHOTO_LINK)
        .click('button[name=ship]')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body', MODALS.IMPORT_IMAGE.text, 'Modal should contain correct text')
        .click('#ic-modal-confirm')
        .pause(200)
        .assert.elementPresent('#note1 span a img', 'There should be an image tag')
        .assert.elementPresent('#note1 span a p.submit', 'There should be a submit button on the draft');
    },

    'create doodle drafts': function(browser) {
        browser
        .keys(['d'])
        .waitForElementVisible('#ic-doodle-form')
        .moveToElement('#ic-doodle', 155, 75, function() {
            browser
            .mouseButtonDown(0, function() {
                browser.moveTo(null ,100, 100);
            })
            .mouseButtonUp(0);
        })
        .pause(1000)
        .click('button[name=ship]')
        .waitForElementVisible('#note2')
        .getAttribute('#note2 span a img', 'src', function(result) {
            this.assert.equal(0, result.value.indexOf('data:image/png;base64'), 'Image should be base64 encoded doodle');
        });
    },

    'edit drafts': function(browser) {
        var EDITED_TEXT = 'Edited text';
        browser
        .moveToElement('#note0', 10, 10)
        .doubleClick()
        .waitForElementVisible('#ic-note-form')
        .assert.containsText('h1.ic-modal-title', 'Edit this draft', '#ic-note-form should have correct header')
        .clearValue('#ic-form-text')
        .setValue('#ic-form-text', EDITED_TEXT)
        .click('button[name=bold]').click('button[name=underline]')
        .click('button[name=ship]')
        .pause(200)
        .assert.containsText('#note0', EDITED_TEXT, 'Created draft should contain correct text')
        .assert.cssClassPresent('#note0 span a p', 'bold', 'Created draft should be bold')
        .assert.cssClassPresent('#note0 span a p', 'underline', 'Created draft should be underlined')
        // try to edit doodle
        .moveToElement('#note2', 10, 10)
        .doubleClick()
        .waitForElementVisible('#ic-toast span')
        .assert.cssClassPresent('#ic-toast span', 'warning', 'Toast should be a warning')
        .assert.containsText('#ic-toast span', PROMPTS.CANNOT_EDIT_DOODLE, 'Toast should contain correct text');
    },

    'delete a draft': function(browser) {
        browser
        .moveToElement('body', 100, 100)
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
        .assert.cssProperty('#note2 span a', 'background-color', 'rgba(128, 128, 128, 1)', 'Note 2 should no longer be a draft')
        .click('#note1 span a p.submit')
        .pause(100)
        .assert.cssProperty('#note1 span a', 'background-color', 'rgba(128, 128, 128, 1)', 'Note 1 should no longer be a draft')
        .click('#ic-mode-normal')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body', MODALS.EXIT_DRAFT_MODE.text, 'Changing mode from draft mode should trigger warning')
        .click('#ic-modal-confirm')
        .assert.cssProperty('#note0 span a', 'background-color', 'rgba(128, 128, 128, 1)', 'Accepting alert should discard remaining drafts');
    },

    'cleanup': function(browser) {
        browser.keys('s').waitForElementVisible('#ic-sidebar button[name=destroyer]'); // show sidebar
        require('./utils').cleanup(browser);
    }
};
