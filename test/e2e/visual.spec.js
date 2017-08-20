'use strict';

const PROMPTS = require('../../lib/constants').PROMPTS;
const MODALS = require('../../lib/constants').MODALS;
const STICKY_COLORS = require('../../lib/constants').STICKY_COLORS;
const TEXT = 'this is a note',
    POSITIONS = [ {x: 250, y: 200}, {x: 350, y: 200}, {x: 450, y: 200}, {x: 550, y: 200} ];

module.exports = {
    'creates successfully': require('./utils').setup,

    'create all notes': function(browser) {
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

    'toolbar drag': function(browser) {
        browser
        .assert.elementNotPresent('#ic-visual-toolbar')
        .click('#ic-mode-visual')
        .waitForElementVisible('#ic-visual-toolbar')
        .assert.cssProperty('#ic-visual-toolbar', 'transform', 'matrix(1, 0, 0, 1, 0, 0)')
        .moveToElement('#ic-visual-toolbar', 3, 3)
        .mouseButtonDown(0, function() {
            browser.moveTo(null, -150, 0);
        })
        .mouseButtonUp(0, function() {
            browser.assert.cssProperty('#ic-visual-toolbar', 'transform', 'matrix(1, 0, 0, 1, -150, 0)'), 'Visual toolbar should be draggable';
        })
        .pause(100);
    },

    'all edits are disabled': function(browser) {
        browser
        .moveToElement('body', 200, 500)
        .doubleClick()
        .waitForElementVisible('#ic-note-form')
        .setValue('#ic-form-text', TEXT)
        .click('button[name=ship]')
        .waitForElementVisible('#ic-toast span')
        .assert.cssClassPresent('#ic-toast span', 'warning')
        .assert.containsText('#ic-toast span', PROMPTS.VISUAL_MODE_NO_CREATE)

        .assert.elementPresent('#note0')
        .moveToElement('#note0', 10, 10)
        .mouseButtonDown(0, function() {
            browser.moveTo(null, -100, 0);
        })
        .mouseButtonUp(0, function() {
            browser
            .waitForElementVisible('#ic-toast span')
            .assert.cssClassPresent('#ic-toast span', 'warning')
            .assert.containsText('#ic-toast span', PROMPTS.VISUAL_MODE_NO_CHANGE, 'Notes should not be draggable in select mode');
        })
        .moveToElement('#note0', 10, 10)
        .doubleClick()
        .waitForElementVisible('#ic-toast span')
        .assert.cssClassPresent('#ic-toast span', 'warning')
        .assert.containsText('#ic-toast span', PROMPTS.VISUAL_MODE_NO_CHANGE, 'Notes should not be editable in select mode')
        .pause(50).click('#note0').pause(50);
    },

    'visual toolbar displays correctly': function(browser) {
        browser
        .click('button.bold')
        .assert.cssProperty('button.bold', 'border', '2px solid rgb(255, 255, 255)', 'Clicking on a style should make it stand out')
        .click('button.bold')
        .click('button.italic')
        .assert.cssProperty('button.italic', 'border', '2px solid rgb(255, 255, 255)', 'Clicking on a style should make it stand out')
        .click('button.italic')
        .click('button.underline')
        .assert.cssProperty('button.underline', 'border', '2px solid rgb(255, 255, 255)', 'Clicking on a style should make it stand out')
        .click('button.underline')
        .click('button.ic-visual-color')
        .assert.cssProperty('button.ic-visual-color', 'border', '2px solid rgb(255, 69, 0)', 'Clicking on a color should highlight it')
        .click('button.ic-visual-color')
        .click('button#ic-bulk-delete')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body', MODALS.BULK_DELETE_NOTES.text, 'Trying to delete note should prompt for confirmation')
        .click('#ic-modal-confirm')
        .assert.elementNotPresent('#ic-visual-toolbar')
        .click('#ic-mode-visual')
        .click('button#ic-bulk-cancel')
        .assert.elementNotPresent('#ic-visual-toolbar');
    },

    'bulk font styling': function(browser) {
        browser
        .click('#ic-mode-visual')
        .click('#note0')
        .assert.cssProperty('#note0', 'border', '3px solid rgb(40, 138, 255)', 'Selecting a note should put a border on it')
        .click('button.bold')
        .click('button.italic')
        .click('button.underline')
        .assert.cssClassPresent('#note0 span a p', 'bold')
        .assert.cssClassPresent('#note0 span a p', 'italic')
        .assert.cssClassPresent('#note0 span a p', 'underline')
        .assert.cssClassNotPresent('#note1 span a p', 'bold')
        .assert.cssClassNotPresent('#note1 span a p', 'italic')
        .assert.cssClassNotPresent('#note1 span a p', 'underline')
        .pause(50)
        .click('#note1')
        .assert.cssClassPresent('#note1 span a p', 'bold')
        .assert.cssClassPresent('#note1 span a p', 'italic')
        .assert.cssClassPresent('#note1 span a p', 'underline')
        .pause(50)
        .click('#note1')
        .assert.cssClassNotPresent('#note1 span a p', 'bold')
        .assert.cssClassNotPresent('#note1 span a p', 'italic')
        .assert.cssClassNotPresent('#note1 span a p', 'underline')
        .click('#note0')
        .click('button.bold')
        .click('button.italic')
        .click('button.underline');
    },

    'bulk font coloring': function(browser) {
        var defaultBackground = '';
        browser
        .getCssProperty('#note0 span a', 'background-color', function(result) {
            defaultBackground = result.value;
        })
        .click('#note0')
        .click('#note1')
        .click('button' + STICKY_COLORS[2])
        .assert.cssProperty('#note0 span a', 'background-color', 'rgba(255, 204, 255, 1)', 'Note 0 background color should change')
        .assert.cssProperty('#note1 span a', 'background-color', 'rgba(255, 204, 255, 1)', 'Note 1 background color should change')
        .click('button' + STICKY_COLORS[4])
        .assert.cssProperty('#note0 span a', 'background-color', 'rgba(204, 255, 255, 1)', 'Note 0 background color should change')
        .assert.cssProperty('#note1 span a', 'background-color', 'rgba(204, 255, 255, 1)', 'Note 1 background color should change')
        .click('button' + STICKY_COLORS[4])
        .perform(function(client, done) {
            browser
            .assert.cssProperty('#note0 span a', 'background-color', defaultBackground, 'Note 0 background should be its default')
            .assert.cssProperty('#note1 span a', 'background-color', defaultBackground, 'Note 1 background should be its default')
            .click('#note0')
            .click('#note1');
            done();
        });
    },

    'submitting with no edits should cause no change': function(browser) {
        browser
        .pause(50)
        .click('#note1')
        .click('button.bold').click('button.italic')
        .click('button#ic-bulk-submit')
        .pause(1000)
        .assert.cssClassPresent('#note1 span a p', 'bold')
        .assert.cssClassPresent('#note1 span a p', 'italic')
        .click('#ic-mode-visual')
        .click('#note1')
        .click('button#ic-bulk-submit')
        .pause(1000)
        .assert.cssClassPresent('#note1 span a p', 'bold')
        .assert.cssClassPresent('#note1 span a p', 'italic')
        .click('#ic-mode-visual')
        .click('#note1')
        .click('button.bold').click('button.italic')
        .click('button.bold').click('button.italic') // click twice to turn to false
        .click('button#ic-bulk-submit')
        .pause(1000)
        .assert.cssClassNotPresent('#note1 span a p', 'bold')
        .assert.cssClassNotPresent('#note1 span a p', 'italic');
    },

    'submitting': function(browser) {
        browser
        .click('#ic-mode-visual')
        .click('#note1')
        .click('#note2')
        .click('button.bold')
        .click('button.underline')
        .click('button' + STICKY_COLORS[3])
        .click('button#ic-bulk-submit')
        .pause(1000)
        .assert.cssClassPresent('#note1 span a p', 'bold', 'Note 1 should have correct formatting')
        .assert.cssClassPresent('#note1 span a p', 'underline', 'Note 1 should have correct formatting')
        .assert.cssProperty('#note1 span a', 'background-color', 'rgba(204, 204, 255, 1)', 'Note 1 should have correct formatting')
        .assert.cssClassPresent('#note2 span a p', 'bold', 'Note 2 should have correct formatting')
        .assert.cssClassPresent('#note2 span a p', 'underline', 'Note 2 should have correct formatting')
        .assert.cssProperty('#note2 span a', 'background-color', 'rgba(204, 204, 255, 1)', 'Note 2 should have correct formatting');
    },

    'canceling': function(browser) {
        browser
        .click('#ic-mode-visual')
        .assert.cssClassNotPresent('#note0 span a p', 'italic')
        .assert.cssClassNotPresent('#note3 span a p', 'italic')
        .click('#note0').click('#note3').pause(200).click('button.italic').pause(200)
        .assert.cssClassPresent('#note0 span a p', 'italic')
        .assert.cssClassPresent('#note3 span a p', 'italic')
        .click('button#ic-bulk-cancel')
        .assert.cssClassNotPresent('#note0 span a p', 'italic')
        .assert.cssClassNotPresent('#note3 span a p', 'italic')
        .click('#ic-mode-visual')
        .click('#note0').click('#note3').pause(200).click('button.bold').pause(200)
        .assert.cssClassPresent('#note0 span a p', 'bold')
        .assert.cssClassPresent('#note3 span a p', 'bold')
        .click('#ic-mode-normal')
        .assert.cssClassNotPresent('#note0 span a p', 'italic')
        .assert.cssClassNotPresent('#note3 span a p', 'italic')
        .click('#ic-mode-visual')
        .click('#note0').click('#note3').pause(200).click('button.bold').pause(200)
        .assert.cssClassPresent('#note0 span a p', 'bold')
        .assert.cssClassPresent('#note3 span a p', 'bold')
        .click('#ic-mode-compact')
        .assert.cssClassNotPresent('#note0 span a p', 'italic')
        .assert.cssClassNotPresent('#note3 span a p', 'italic')
        .click('#ic-mode-normal');
    },

    'deleting': function(browser) {
        browser
        .click('#ic-mode-visual')
        .click('#note0')
        .click('#note1')
        .click('#note2')
        .click('#note3')
        .click('button#ic-bulk-delete')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body', MODALS.BULK_DELETE_NOTES.text)
        .click('#ic-modal-confirm')
        .waitForElementNotPresent('#note0')
        .assert.elementNotPresent('#ic-visual-toolbar')
        .assert.elementNotPresent('#note0')
        .assert.elementNotPresent('#note1')
        .assert.elementNotPresent('#note2')
        .assert.elementNotPresent('#note3');
    },

    'cleanup': require('./utils').cleanup
};

