'use strict';

var PROMPTS = require('../../lib/constants').PROMPTS;
var users = {};
var windows;

module.exports = {
    'creates successfully': require('./utils').setup,

    'second user login': function(browser) {
        var editLink;

        browser
        // get assigned color
        .getCssProperty('.ic-user', 'background-color', function(result) {
            browser.assert.equal(result.value !== '', true);
            users['nightwatchjs'] = result.value;
        })
        // grab editing link
        .click('button[name=share-edit]')
        .waitForElementVisible('#ic-modal', 100)
        .getText('#ic-modal-body p', function(result) {
            editLink = result.value;
            browser
            .click('button#ic-modal-confirm')
            // open a new window by going to the tutorial
            .click('button[name=tutorial]')
            .windowHandles(function (result) {
                browser.assert.equal(result.value.length, 2, 'There should be two windows open.');
                windows = result.value;
                browser.switchWindow(windows[1]);
            })
            .waitForElementVisible('#ic-tutorial', 2000)
            .url(editLink)
            .waitForElementVisible('#ic-modal', 1000000)
            .setValue('#ic-modal-input', 'friendo')
            .click('button#ic-modal-confirm')
            .waitForElementVisible('#compass', 5000)
            // grab friendo's color
            .elements('css selector', '.ic-user', function(result) {
                this.assert.equal(2, result.value.length);
            })
            .getCssProperty('.ic-user:nth-of-type(2)', 'background-color', function(result) {
                browser.assert.equal(result.value !== '', true);
                users['friendo'] = result.value;
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
        .getCssProperty('#note0 span a', 'background-color', function(result) {
            this.assert.equal(users['friendo'], result.value);
        })
        .moveToElement('#note0', 10, 10, function() {
            browser.doubleClick();
        })
        .waitForElementVisible('#ic-note-form')

        .switchWindow(windows[0])
        .assert.elementPresent('#note0')
        .assert.containsText('#note0', 'Friendo\'s note')
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

        .switchWindow(windows[0])
        .assert.containsText('#note0', 'first edit')
        .clearValue('#ic-form-text')
        .setValue('#ic-form-text', 'second edit')
        .click('button[name=ship]')
        .assert.containsText('#note0', 'second edit');
    },

    'logouts': function(browser) {
        browser
        .click('button[name=save]')
        .waitForElementVisible('#ic-toast')
        .click('button[name=logout]')
        .assert.urlEquals('http://localhost:8080/')

        .switchWindow(windows[1])
        .elements('css selector', '.ic-user', function(result) {
            this.assert.equal(1, result.value.length);
        })
        .getCssProperty('.ic-user', 'background-color', function(result) {
            this.assert.equal(users['friendo'], result.value);
        })

        .switchWindow(windows[0])
        .click('div.ic-saved')
        .waitForElementVisible('#compass')
        .elements('css selector', '.ic-user', function(result) {
            this.assert.equal(2, result.value.length);
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
        .assert.containsText('#ic-toast', 'A timebox for 3m0s has been created')
        .pause(1000)
        .assert.containsText('button[name=timer] p.ic-time', '02:')
        .click('button[name=timer] div div p') // cancel timer
        .waitForElementVisible('#ic-toast')

        .switchWindow(windows[0])
        .assert.containsText('#ic-toast', 'Timebox has been canceled')
        .assert.elementNotPresent('button[name=timer] p.ic-time');
    },

    'chat': function(browser) {
        browser
        .assert.elementPresent('#ic-chat')
        .click('#ic-chat button.ic-close-window')
        .pause(1000)
        .assert.cssProperty('#ic-chat', 'bottom', '-270px')

        .switchWindow(windows[1])
        .setValue('#message-text', ['first message', browser.Keys.ENTER])
        .waitForElementVisible('div.mine')
        .assert.containsText('div.mine', 'first message')
        .assert.cssProperty('div.mine', 'background-color', users['friendo'])

        .switchWindow(windows[0])
        .assert.cssProperty('button#ic-show-chat', 'background-color', 'rgba(194, 26, 3, 1)')
        .click('button#ic-show-chat')
        .pause(1000)
        .assert.cssProperty('#ic-chat', 'bottom', '0px')
        .assert.elementPresent('div.theirs')
        .assert.containsText('div.theirs', 'first message')
        .assert.cssProperty('div.theirs', 'background-color', users['friendo'])
        .setValue('#message-text', ['second message', browser.Keys.ENTER])
        .waitForElementVisible('div.mine')
        .assert.containsText('div.mine', 'second message')
        .assert.cssProperty('div.mine', 'background-color', users['nightwatchjs'])

        .switchWindow(windows[1])
        .assert.elementPresent('div.theirs')
        .assert.containsText('div.theirs', 'second message')
        .assert.cssProperty('div.theirs', 'background-color', users['nightwatchjs']);
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