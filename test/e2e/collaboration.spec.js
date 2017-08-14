'use strict';

// var MODALS = require('../../lib/constants').MODALS;
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
            .getCssProperty('.ic-user:nth-of-type(2)', 'background-color', function(result) {
                browser.assert.equal(result.value !== '', true);
                users['friendo'] = result.value;
            });
        });
    },

    'cleanup': require('./utils').cleanup
};