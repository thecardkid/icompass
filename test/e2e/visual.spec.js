'use strict';

const PROMPTS = require('../../lib/constants').PROMPTS;
const STICKY_COLORS = require('../../lib/constants').STICKY_COLORS;
const TEXT = 'this is a note',
    POSITIONS = [ {x: 300, y: 200}, {x: 400, y: 200}, {x: 500, y: 200}, {x: 600, y: 200} ];

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

    'create all notes': function(browser) {
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

    'toolbar drag': function(browser) {
        browser
        .assert.elementNotPresent('#ic-visual-toolbar')
        .click('#ic-mode-visual')
        .pause(100)
        .assert.elementPresent('#ic-visual-toolbar')
        .assert.cssProperty('#ic-visual-toolbar', 'transform', 'matrix(1, 0, 0, 1, 0, 0)')
        .moveToElement('#ic-visual-toolbar', 3, 3)
        .mouseButtonDown(0, function() {
            browser.moveTo(null, -150, 0);
        })
        .mouseButtonUp(0, function() {
            browser.assert.cssProperty('#ic-visual-toolbar', 'transform', 'matrix(1, 0, 0, 1, -150, 0)');
        })
        .pause(100);
    },

    'all edits are disabled': function(browser) {
        browser
        .moveToElement('body', 200, 500)
        .doubleClick()
        .waitForElementVisible('#ic-note-form', 100)
        .setValue('#ic-form-text', TEXT)
        .click('button[name=ship]')
        .pause(100)
        .getAlertText(function(result) {
            this.assert.equal(result.value, PROMPTS.VISUAL_MODE_NO_CREATE);
        })
        .acceptAlert()
        .pause(200)
        // try dragging
        .assert.elementPresent('#note0')
        .moveToElement('#note0', 10, 10)
        .mouseButtonDown(0, function() {
            browser.moveTo(null, -100, 0);
        })
        .mouseButtonUp(0, function() {
            browser.getAlertText(function(result) {
                this.assert.equal(result.value, PROMPTS.VISUAL_MODE_NO_CHANGE);
            })
            .acceptAlert();
        })
        .moveToElement('#note0', 10, 10)
        .doubleClick()
        .pause(100)
        .getAlertText(function(result) {
            this.assert.equal(result.value, PROMPTS.VISUAL_MODE_NO_CHANGE);
        })
        .acceptAlert()
        .click('#note0'); // de-select the note
    },

    'visual toolbar displays correctly': function(browser) {
        browser
        .click('button.bold')
        .assert.cssProperty('button.bold', 'border', '2px solid rgb(255, 255, 255)')
        .click('button.bold')
        .click('button.italic')
        .assert.cssProperty('button.italic', 'border', '2px solid rgb(255, 255, 255)')
        .click('button.italic')
        .click('button.underline')
        .assert.cssProperty('button.underline', 'border', '2px solid rgb(255, 255, 255)')
        .click('button.underline')
        .click('button.ic-visual-color')
        .assert.cssProperty('button.ic-visual-color', 'border', '2px solid rgb(255, 69, 0)')
        .click('button.ic-visual-color')
        .click('button#ic-bulk-delete')
        .getAlertText(function(result) {
            this.assert.equal(result.value, PROMPTS.CONFIRM_BULK_DELETE_NOTES);
        })
        .acceptAlert()
        .pause(100)
        .assert.elementNotPresent('#ic-visual-toolbar')
        .click('#ic-mode-visual')
        .click('button#ic-bulk-cancel')
        .assert.elementNotPresent('#ic-visual-toolbar');
    },

    'bulk font styling': function(browser) {
        browser
        .click('#ic-mode-visual')
        .pause(100)
        .click('#note0')
        .assert.cssProperty('#note0', 'border', '3px solid rgb(40, 138, 255)')
        .click('button.bold')
        .click('button.italic')
        .click('button.underline')
        .assert.cssClassPresent('#note0 span a p', 'bold')
        .assert.cssClassPresent('#note0 span a p', 'italic')
        .assert.cssClassPresent('#note0 span a p', 'underline')
        .assert.cssClassNotPresent('#note1 span a p', 'bold')
        .assert.cssClassNotPresent('#note1 span a p', 'italic')
        .assert.cssClassNotPresent('#note1 span a p', 'underline')
        .click('#note1')
        .assert.cssClassPresent('#note1 span a p', 'bold')
        .assert.cssClassPresent('#note1 span a p', 'italic')
        .assert.cssClassPresent('#note1 span a p', 'underline')
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
        .getCssProperty('#note0 span a', 'background', function(result) {
            defaultBackground = result.value;
        })
        .click('#note0')
        .click('#note1')
        .click('button' + STICKY_COLORS[2])
        .getCssProperty('#note0 span a', 'background', function(result) {
            this.assert.equal(result.value.includes('rgb(255, 204, 255)'), true);
        })
        .getCssProperty('#note1 span a', 'background', function(result) {
            this.assert.equal(result.value.includes('rgb(255, 204, 255)'), true);
        })
        .click('button' + STICKY_COLORS[4])
        .getCssProperty('#note0 span a', 'background', function(result) {
            this.assert.equal(result.value.includes('rgb(204, 255, 255)'), true);
        })
        .getCssProperty('#note1 span a', 'background', function(result) {
            this.assert.equal(result.value.includes('rgb(204, 255, 255)'), true);
        })
        .click('button' + STICKY_COLORS[4])
        .pause(500)
        .getCssProperty('#note0 span a', 'background', function(result) {
            this.assert.equal(result.value, defaultBackground);
        })
        .getCssProperty('#note1 span a', 'background', function(result) {
            this.assert.equal(result.value, defaultBackground);
        })
        .click('#note0')
        .click('#note1');
    },

    'submitting with no edits should cause no change': function(browser) {
        browser
        .click('#note1')
        .click('button.bold').click('button.italic')
        .click('button#ic-bulk-submit')
        .pause(200)
        .assert.cssClassPresent('#note1 span a p', 'bold')
        .assert.cssClassPresent('#note1 span a p', 'italic')
        .click('#ic-mode-visual')
        .click('#note1')
        .click('button#ic-bulk-submit')
        .pause(200)
        .assert.cssClassPresent('#note1 span a p', 'bold')
        .assert.cssClassPresent('#note1 span a p', 'italic')
        .click('#ic-mode-visual')
        .click('#note1')
        .click('button.bold').click('button.italic')
        .click('button.bold').click('button.italic') // click twice to turn to false
        .click('button#ic-bulk-submit')
        .pause(200)
        .assert.cssClassNotPresent('#note1 span a p', 'bold')
        .assert.cssClassNotPresent('#note1 span a p', 'italic')
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
        .pause(500)
        .assert.cssClassPresent('#note1 span a p', 'bold')
        .assert.cssClassPresent('#note1 span a p', 'underline')
        .assert.cssClassPresent('#note2 span a p', 'bold')
        .assert.cssClassPresent('#note2 span a p', 'underline')
        .getCssProperty('#note1 span a', 'background', function(result) {
            this.assert.equal(result.value.includes('rgb(204, 204, 255)'), true);
        })
        .getCssProperty('#note2 span a', 'background', function(result) {
            this.assert.equal(result.value.includes('rgb(204, 204, 255)'), true);
        });
    },

    'canceling': function(browser) {
        browser
        .click('#ic-mode-visual')
        .assert.cssClassNotPresent('#note0 span a p', 'italic')
        .assert.cssClassNotPresent('#note3 span a p', 'italic')
        .click('#note0').click('#note3').click('button.italic')
        .assert.cssClassPresent('#note0 span a p', 'italic')
        .assert.cssClassPresent('#note3 span a p', 'italic')
        .click('button#ic-bulk-cancel')
        .assert.cssClassNotPresent('#note0 span a p', 'italic')
        .assert.cssClassNotPresent('#note3 span a p', 'italic')
        .click('#ic-mode-visual')
        .click('#note0').click('#note3').click('button.bold')
        .assert.cssClassPresent('#note0 span a p', 'bold')
        .assert.cssClassPresent('#note3 span a p', 'bold')
        .click('#ic-mode-normal')
        .assert.cssClassNotPresent('#note0 span a p', 'italic')
        .assert.cssClassNotPresent('#note3 span a p', 'italic')
        .click('#ic-mode-visual')
        .click('#note0').click('#note3').click('button.bold')
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
        .getAlertText(function(result) {
            this.assert.equal(result.value, PROMPTS.CONFIRM_BULK_DELETE_NOTES);
        })
        .acceptAlert()
        .assert.elementNotPresent('#ic-visual-toolbar')
        .pause(500)
        .assert.elementNotPresent('#note0')
        .assert.elementNotPresent('#note1')
        .assert.elementNotPresent('#note2')
        .assert.elementNotPresent('#note3');
    },

    'cleanup': function(browser) {
        browser
        .click('#ic-sidebar button[name=destroyer]')
        .acceptAlert()
        .pause(500)
        .acceptAlert()
        .pause(500)
        .url(function(result) {
            this.assert.equal(result.value, 'http://localhost:8080/');
        })
        .end();
    }
};

