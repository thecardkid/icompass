'use strict';

var PROMPTS = require('../../lib/constants').PROMPTS;
var users = {};
var windows;

module.exports = {
    'creates successfully': require('./utils').setup,

    'second user login': function(browser) {
        browser
        .getCssProperty('.ic-user', 'background-color', function(result) {
            this.assert.equal(true, result.value !== '', 'Background color is not null');
            users['nightwatchjs'] = result.value;
        })
        // grab editing link
        .click('button[name=share-edit]')
        .waitForElementVisible('#ic-modal', 100)
        .getText('#ic-modal-body p', function(result) {
            var editCode = result.value.substr(result.value.length - 8);
            var editLink = 'http://localhost:8080/compass/edit/' + editCode + '/friendo';
            browser
            .click('button#ic-modal-confirm')
            // open a new window
            .execute(function() {
                window.open('http://localhost:8080/tutorial', '_blank');
            }, [])
            .pause(2000)
            .windowHandles(function (result) {
                this.assert.equal(2, result.value.length, 'There should be two windows open');
                windows = result.value;
                browser.windowSize(windows[1], 2000, 1500);
                browser.switchWindow(windows[1], function() {
                    browser
                    .url(editLink)
                    .waitForElementVisible('#compass')
                    .elements('css selector', '.ic-user', function(result) {
                        this.assert.equal(2, result.value.length, 'There should be two users in the workspace');
                    })
                    .getCssProperty('.ic-user:nth-of-type(2)', 'background-color', function(result) {
                        this.assert.equal(true, result.value !== '', 'Second user tag should have background color');
                        users['friendo'] = result.value;
                    });
                });
            });
        });
    },

    'continuous edit operations': function(browser) {
        browser
        .keys(['n'])
        .waitForElementVisible('#ic-note-form')
        .setValue('#ic-form-text', 'Friendo\'s note')
        .click('button[name=ship]')
        .waitForElementVisible('#note0')
        .assert.cssProperty('#note0 span a', 'background-color', users['friendo'], 'Note should have friendo color')
        .moveToElement('#note0', 10, 10, function() {
            browser.doubleClick();
        })
        .waitForElementVisible('#ic-note-form')

        .switchWindow(windows[0])
        .assert.elementPresent('#note0', 'Note 0 should be present')
        .assert.containsText('#note0', 'Friendo\'s note', 'Note 0 should contain correct text')
        .moveToElement('#note0', 10, 10, function() {
            browser
            .mouseButtonDown(0, function() {
                browser.moveTo(null, -200, -200);
            })
            .mouseButtonUp(0)
            .doubleClick();
        })
        .waitForElementVisible('#ic-note-form')

        .switchWindow(windows[1])
        .clearValue('#ic-form-text')
        .setValue('#ic-form-text', 'first edit')
        .click('button[name=ship]')
        .pause(1000)

        .switchWindow(windows[0])
        .assert.containsText('#note0', 'first edit', 'Note 0 should contain edited text')
        .clearValue('#ic-form-text')
        .setValue('#ic-form-text', 'second edit')
        .click('button[name=ship]')
        .pause(1000)
        .assert.containsText('#note0', 'second edit', 'Note 0 should contain edited text');
    },

    'logouts': function(browser) {
        browser
        .click('button[name=save]')
        .waitForElementVisible('#ic-toast')
        .click('button[name=logout]')
        .assert.urlEquals('http://localhost:8080/', 'URL should be home page')

        .switchWindow(windows[1])
        .elements('css selector', '.ic-user', function(result) {
            this.assert.equal(1, result.value.length, 'There should be only one user');
        })
        .assert.cssProperty('.ic-user', 'background-color', users['friendo'], 'User tag should have correct color')

        .switchWindow(windows[0])
        .click('div.ic-saved')
        .waitForElementVisible('#compass')
        .elements('css selector', '.ic-user', function(result) {
            this.assert.equal(2, result.value.length, 'There should be two users');
        })
        .getCssProperty('.ic-user:nth-of-type(2)', 'background-color', function(result) {
            users['nightwatchjs'] = result.value;
        });
    },

    'timeboxes': function(browser) {
        browser
        .click('button[name=timer]')
        .waitForElementVisible('#ic-timer-config')
        .click('button[name=ic-3m]')
        .waitForElementVisible('#ic-toast')

        .switchWindow(windows[1])
        .assert.containsText('#ic-toast', 'A timebox for 3m0s has been created', 'There should be a toast notifying timebox creation')
        .pause(1000)
        .assert.containsText('button[name=timer] p.ic-time', '02:', 'Timer should be accurate')
        .click('button[name=timer] div div p') // cancel timer
        .waitForElementVisible('#ic-toast')

        .switchWindow(windows[0])
        .assert.containsText('#ic-toast', 'Timebox has been canceled', 'There should be a toast notifiying that timebox was canceled')
        .assert.elementNotPresent('button[name=timer] p.ic-time', 'Timer should not be present');
    },

    'chat': function(browser) {
        browser
        .assert.elementPresent('#ic-chat')
        .click('#ic-chat button.ic-close-window')
        .pause(1000)
        .assert.cssProperty('#ic-chat', 'bottom', '-270px', 'Chat area should be hidden')

        .switchWindow(windows[1])
        .setValue('#message-text', ['first message', browser.Keys.ENTER])
        .waitForElementVisible('div.mine')
        .assert.containsText('div.mine', 'first message', 'There should be a message')
        .assert.cssProperty('div.mine', 'background-color', users['friendo'], 'Message should have correct background color')

        .switchWindow(windows[0])
        .assert.cssProperty('button#ic-show-chat', 'background-color', 'rgba(194, 26, 3, 1)', 'Show chat button should notify there is an unread message')
        .click('button#ic-show-chat')
        .pause(1000)
        .assert.cssProperty('#ic-chat', 'bottom', '0px', 'Chat area should be visible')
        .assert.elementPresent('div.theirs', 'New message should be present')
        .assert.containsText('div.theirs', 'first message', 'New message should contain correct text')
        .assert.cssProperty('div.theirs', 'background-color', users['friendo'], 'New message should have correct background color')
        .setValue('#message-text', ['second message', browser.Keys.ENTER])
        .waitForElementVisible('div.mine')
        .assert.containsText('div.mine', 'second message', 'New message should contain correct text')
        .assert.cssProperty('div.mine', 'background-color', users['nightwatchjs'], 'New message should have correct background color')

        .switchWindow(windows[1])
        .assert.elementPresent('div.theirs', 'New message should appear')
        .assert.containsText('div.theirs', 'second message', 'New message should contain correct text')
        .assert.cssProperty('div.theirs', 'background-color', users['nightwatchjs'], 'New message should have correct background color');
    },

    'select and draft mode simultaneously': function(browser) {
        var draftText = 'friendo draft';

        browser
            // put friendo in draft mode
            .click('#ic-mode-draft')
            .moveToElement('body', 300, 200)
            .doubleClick()
            .waitForElementVisible('#ic-note-form')
            .setValue('#ic-form-text', draftText)
            .click('button[name=ship]')
            .waitForElementVisible('#note1')
            .assert.cssProperty('#note0 span a', 'background-color', 'rgba(128, 128, 128, 1)', 'Draft has grey background')
            .assert.containsText('#note0', draftText, 'Draft contains correct text')

            .switchWindow(windows[0])
            .elements('css selector', '.ic-sticky-note', function(result) {
                this.assert.equal(1, result.value.length, 'Drafts by other users do not show up');
            })
            .moveToElement('body', 300, 600)
            .doubleClick()
            .waitForElementVisible('#ic-note-form')
            .setValue('#ic-form-text', 'note while in draft')
            .click('button[name=ship]')
            .waitForElementVisible('#note1')
            .click('#ic-mode-visual')
            .waitForElementVisible('#ic-visual-toolbar')

            .switchWindow(windows[1])
            .elements('css selector', '.ic-sticky-note', function(result) {
                this.assert.equal(3, result.value.length, 'New notes by other users still show up in draft mode');
            })
            .click('#note0 span a p.submit')
            .pause(500)
            .assert.containsText('#note2', draftText, 'A new note has been created from the draft')

            .switchWindow(windows[0])
            .elements('css selector', '.ic-sticky-note', function(result) {
                this.assert.equal(3, result.value.length, 'New notes by other users still show up in visual mode');
            })
            .click('button.bold')
            .click('#note0')
            .click('#note2')
            .assert.cssClassPresent('#note0 span a p', 'bold', 'Note 0 should be bulk formatted')
            .assert.cssClassPresent('#note2 span a p', 'bold', 'Note 2 should be bulk formatted')

            .switchWindow(windows[1])
            .assert.cssClassNotPresent('#note0 span a p', 'bold', 'Visual edit should not affect other users')
            .assert.cssClassNotPresent('#note2 span a p', 'bold', 'Visual edit should not affect other users')
            .click('#ic-mode-visual')
            .waitForElementVisible('#ic-visual-toolbar')
            .click('#note2')
            .click('#ic-bulk-delete')
            .waitForElementVisible('#ic-modal')
            .click('#ic-modal-confirm')
            .pause(500)
            .elements('css selector', '.ic-sticky-note', function(result) {
                this.assert.equal(2, result.value.length, 'One note should have been deleted');
            })

            .switchWindow(windows[0])
            .elements('css selector', '.ic-sticky-note', function(result) {
                this.assert.equal(2, result.value.length, 'Notes can be deleted by other users in visual mode');
            })
            .assert.cssProperty('#note0', 'border-color', 'rgb(40, 138, 255)', 'Note 0 should still be selected')
            .assert.cssProperty('#note1', 'border-color', 'rgb(0, 0, 0)', 'Note 1 should still be unselected');
    },

    'redirected to home page on compass delete': function(browser) {
        browser
        .switchWindow(windows[0])
        .click('#ic-sidebar button[name=destroyer]')
        .waitForElementVisible('#ic-modal')
        .click('#ic-modal-confirm')
        .pause(100)
        .waitForElementVisible('#ic-modal')
        .click('#ic-modal-confirm')
        .pause(500)
        .assert.urlEquals('http://localhost:8080/')

        .switchWindow(windows[1])
        .assert.elementPresent('#ic-modal')
        .assert.containsText('#ic-modal', PROMPTS.COMPASS_DELETED)
        .click('#ic-modal-confirm')
        .pause(500)
        .assert.urlEquals('http://localhost:8080/')
        .end();
    }
};