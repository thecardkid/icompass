'use strict';

const PROMPTS = require('../../lib/constants').PROMPTS;
const MODALS = require('../../lib/constants').MODALS;

module.exports = {
    'creates successfully': require('./utils').setup,

    'share list': function(browser) {
        browser
        .assert.elementPresent('div.ic-sidebar-list[name=share]')
        .click('button[name=share-edit]')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body h3', 'Share this link below')
        .click('#ic-modal-confirm')
        .pause(100)
        .click('button[name=share-view]')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body h3', 'Share this link below')
        .click('#ic-modal-confirm')
        .pause(100)
        .click('button[name=export]')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body h3', 'I see you want to save this compass as a PDF')
        .click('#ic-modal-cancel')
        .assert.elementPresent('button[name=tweet]');
    },

    'control list': function(browser) {
        browser
        .assert.elementPresent('div.ic-sidebar-list[name=controls]')
        .elements('css selector', 'div.ic-sidebar-list[name=controls] .ic-action', function(result) {
            var controls = result.value;

            browser
            .elementIdClick(controls[0].ELEMENT)
            .assert.elementPresent('#ic-note-form')
            .click('button[name=nvm]')
            .elementIdClick(controls[1].ELEMENT)
            .assert.elementPresent('#ic-doodle-form')
            .click('button[name=nvm]')
            .elementIdClick(controls[2].ELEMENT)
            .pause(500)
            .assert.cssProperty('#ic-sidebar', 'left', '-240px')
            .click('#ic-show-sidebar')
            .pause(500)
            .elementIdClick(controls[3].ELEMENT)
            .pause(500)
            .assert.cssProperty('#ic-chat', 'bottom', '-270px')
            .elementIdClick(controls[3].ELEMENT)
            .pause(500)
            .assert.cssProperty('#ic-chat', 'bottom', '0px')
            .elementIdClick(controls[4].ELEMENT)
            .assert.elementPresent('#ic-about')
            .click('#ic-about button.ic-close-window');
        });
    },

    'user list': function(browser) {
        browser
        .assert.elementPresent('div.ic-sidebar-list[name=users]')
        .assert.containsText('div.ic-sidebar-list[name=users] p', 'You');
    },

    'status display': function(browser) {
        browser
        .assert.elementPresent('div.ic-sidebar-list[name=status]')
        .assert.containsText('div.ic-sidebar-list[name=status] h2', 'Status - connected');
    },

    'credits': function(browser) {
        browser
        .assert.elementPresent('div.ic-sidebar-list[name=credits]')
        .assert.attributeEquals('div.ic-sidebar-list[name=credits] p[name=ela] a', 'href', 'http://innovatorscompass.org/')
        .assert.attributeEquals('div.ic-sidebar-list[name=credits] p[name=hieu] a', 'href', 'http://hieuqn.com/');
    },

    'version': function(browser) {
        browser
        .assert.elementPresent('div.ic-sidebar-list[name=version]')
        .assert.attributeEquals('div.ic-sidebar-list[name=version] p a', 'href', 'https://github.com/thecardkid/innovators-compass/releases');
    },

    'timer': function(browser) {
        browser
        .assert.visible('button[name=timer]')
        .click('button[name=timer]')
        .waitForElementVisible('#ic-timer-form')
        .assert.elementPresent('button[name=ic-30s]', 'Quick timer 30s should exist')
        .assert.elementPresent('button[name=ic-1m]', 'Quick timer 1m should exist')
        .assert.elementPresent('button[name=ic-3m]', 'Quick timer 3m should exist')
        .click('button[name=ic-3m]')
        .waitForElementVisible('#ic-toast span')
        .assert.cssClassPresent('#ic-toast span', 'info')
        .assert.containsText('#ic-toast span', PROMPTS.TIMEBOX(3,0))
        .assert.containsText('button[name=timer] div p', '03:00', 'Timer should appear')
        .assert.containsText('div.ic-timer-action p', 'stop', 'There should be a stop button')
        .click('div.ic-timer-action')
        .assert.containsText('button[name=timer]', 'timebox')
        .click('button[name=timer]')
        .waitForElementVisible('#ic-timer-form')

        .clearValue('input#ic-timer-min')
        .setValue('input#ic-timer-min', -2)
        .click('button[name=ship]')
        .waitForElementVisible('#ic-toast span')
        .assert.cssClassPresent('#ic-toast span', 'error', 'Error message should be displayed')
        .assert.containsText('#ic-toast span', PROMPTS.TIMEBOX_NEGATIVE_VALUES, 'Negative values should not be accepted')

        .clearValue('input#ic-timer-min')
        .setValue('input#ic-timer-min', 31)
        .click('button[name=ship]')
        .waitForElementVisible('#ic-toast span')
        .assert.cssClassPresent('#ic-toast span', 'error')
        .assert.containsText('#ic-toast span', PROMPTS.TIMEBOX_TOO_LONG, 'User should not be able to create a timer longer than 30m')

        .clearValue('input#ic-timer-min')
        .setValue('input#ic-timer-min', 0)
        .clearValue('input#ic-timer-sec')
        .setValue('input#ic-timer-sec', 61)
        .click('button[name=ship]')
        .waitForElementVisible('#ic-toast span')
        .assert.cssClassPresent('#ic-toast span', 'error')
        .assert.containsText('#ic-toast span', PROMPTS.TIMEBOX_TOO_MANY_SECONDS, 'User should not be able to enter invalid value for seconds (61)')

        .clearValue('input#ic-timer-sec')
        .setValue('input#ic-timer-sec', 2)
        .click('button[name=ship]')
        .waitForElementVisible('#ic-toast span')
        .assert.cssClassPresent('#ic-toast span', 'info')
        .assert.containsText('#ic-toast span', PROMPTS.TIMEBOX(0,2))
        .pause(2000)
        .assert.containsText('#ic-toast span', PROMPTS.TIMEBOX_OVER);
    },

    'other actions': function(browser) {
        browser
        .assert.elementPresent('div.ic-sidebar-list[name=actions]')
        .assert.visible('button[name=sucks]')
        .click('button[name=sucks]')
        .waitForElementVisible('#ic-feedback')
        .click('#ic-feedback button.ic-close-window')
        .assert.elementNotPresent('#ic-feedback')
        .assert.attributeEquals('button[name=tutorial] a', 'href', 'http://localhost:8080/tutorial')
        .click('#ic-toast span')

        .click('button[name=save]')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body', MODALS.SAVE_BOOKMARK)
        .setValue('#ic-modal-input', 'My bookmark')
        .click('#ic-modal-confirm')
        .waitForElementVisible('#ic-toast span')
        .assert.cssClassPresent('#ic-toast span', 'success')
        .assert.containsText('#ic-toast span', PROMPTS.SAVE_SUCCESS, 'User should be able to bookmark workspaces')
        .click('#ic-toast span')
        .click('button[name=logout]')
        .waitForElementVisible('div.ic-saved')
        .assert.urlEquals('http://localhost:8080/')
        .assert.attributeContains('div.ic-saved a', 'href', 'http://localhost:8080/compass/edit')
        .moveToElement('div.ic-saved', 100, 10, function() {
            browser.mouseButtonClick(0);
        })
        .pause(100)
        .assert.containsText('div.ic-saved a', 'My bookmark')
        .assert.containsText('div.ic-saved div.ic-saved-info p', 'as "sandbox"')
        .click('button.remove')
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body', MODALS.DELETE_BOOKMARK.text)
        .click('#ic-modal-confirm')
        .assert.elementNotPresent('div.ic-saved');
    },

    'delete': function(browser) {
        browser
        .back()
        .waitForElementVisible('#ic-sidebar');
        require('./utils').cleanup(browser);
    }
};
