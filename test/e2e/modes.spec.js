'use strict';

var editURL = 'http://localhost:8080/compass/edit/',
    viewURL = 'http://localhost:8080/compass/view/',
    editCode, viewCode;
var ERROR_MSG = require('../../lib/constants').ERROR_MSG;

module.exports = {
    'creates successfully': function(browser) {
        browser
        .url('http://localhost:8080')
        .waitForElementVisible('body', 500)
        .click('button[name=make]')
        .setValue('#compass-center', 'nightwatchjs')
        .setValue('#username', 'sandbox')
        .click('button[name=next]')
        .waitForElementVisible('.third', 1000)
        .click('button[name=to-workspace]')
        .waitForElementVisible('#ic-sidebar', 500)
        .windowMaximize();
    },

    'retrieve codes': function(browser) {
        browser
        .getAttribute('button[name=share-edit]', 'id', function(result) {
            editCode = result.value;
            editURL += result.value;
        })
        .getAttribute('button[name=share-view]', 'id', function(result) {
            viewCode = result.value;
            viewURL += result.value;
        })
        .pause(500)
        .url(function(result) {
            this.assert.equal(result.value, editURL+'/sandbox');
        });
    },

    'view-only access from url': function(browser) {
        browser
        .url(viewURL)
        .pause(500)
        .assert.elementPresent('#center')
        .assert.elementPresent('#vline')
        .assert.elementPresent('#hline')
        .assert.elementNotPresent('#ic-modes')
        .assert.elementNotPresent('#ic-sidebar')
        .assert.elementNotPresent('#ic-chat')
        .assert.elementNotPresent('#ic-show-chat')
        .assert.elementNotPresent('#ic-show-sidebar');
    },

    'view-only from login page': function(browser) {
        browser
        .url('http://localhost:8080')
        .waitForElementVisible('body', 500)
        .click('button[name=find]')
        .setValue('#compass-code', viewCode)
        .setValue('#username', 'sandbox')
        .click('button[name=next]')
        .waitForElementVisible('.third', 500)
        .assert.containsText('.third h1', 'View-only access')
        .assert.containsText('.third h2', 'You will be logged in as sandbox')
        .click('button[name=to-workspace]')
        .pause(500)
        .assert.elementPresent('#center')
        .assert.elementPresent('#vline')
        .assert.elementPresent('#hline')
        .assert.elementNotPresent('#ic-modes')
        .assert.elementNotPresent('#ic-sidebar')
        .assert.elementNotPresent('#ic-chat')
        .assert.elementNotPresent('#ic-show-chat')
        .assert.elementNotPresent('#ic-show-sidebar');
    },

    'url with bad params is rejected': function(browser) {
        browser
        .url('http://localhost:8080/compass/edit/' + editCode.substring(1,5) + '/,,,')
        .waitForElementVisible('#ic-modal')
        .getText('#ic-modal-body', function(result) {
            this.assert.equal(result.value.indexOf('There was a problem with your login info') > -1, true);
            this.assert.equal(result.value.indexOf('Your code is not valid') > -1, true);
            this.assert.equal(result.value.indexOf('Username can only contain a-zA-Z') > -1, true);
        })
        .click('#ic-modal-confirm')
        .waitForElementVisible('#ic-landing', 1000)
        .url(function(result) {
            this.assert.equal(result.value, 'http://localhost:8080/');
        });
    },

    'view url with wrong editCode is rejected': function(browser) {
        browser
        .url('http://localhost:8080/compass/view/'+editCode+'/sandbox')
        .waitForElementVisible('#ic-modal', 1000)
        .getText('#ic-modal-body', function(result) {
            this.assert.equal(result.value.indexOf('I couldn\'t find your compass'), 0);
        })
        .click('#ic-modal-confirm')
        .waitForElementVisible('#ic-landing')
        .url(function(result) {
            this.assert.equal(result.value, 'http://localhost:8080/');
        });
    },

    'edit access from url with username': function(browser) {
        browser
        .url(editURL+'/sandbox')
        .pause(500)
        .assert.elementPresent('#center')
        .assert.elementPresent('#vline')
        .assert.elementPresent('#hline')
        .assert.elementPresent('#ic-sidebar')
        .assert.elementPresent('#ic-chat')
        .assert.elementPresent('#ic-show-chat')
        .assert.elementPresent('#ic-show-sidebar')
        .assert.elementPresent('#ic-modes');
    },

    'edit access from url without username': function(browser) {
        browser
        .url(editURL)
        .waitForElementVisible('#ic-modal')
        .assert.containsText('#ic-modal-body h3', 'Enter your name:')
        .setValue('#ic-modal-input', 'sandbox2')
        .click('#ic-modal-confirm')
        .pause(100)
        .getText('#ic-modal-body', function(result) {
            this.assert.equal(result.value.indexOf(ERROR_MSG.UNAME_HAS_NON_CHAR), 0);
        })

        .url(editURL)
        .waitForElementVisible('#ic-modal')
        .click('#ic-modal-confirm')
        .pause(100)
        .getText('#ic-modal-body', function(result) {
            this.assert.equal(result.value.indexOf(ERROR_MSG.REQUIRED('Username')), 0);
        })

        .url(editURL)
        .setValue('#ic-modal-input', 'sandbox')
        .click('#ic-modal-confirm')
        .waitForElementVisible('#center', 1000)
        .assert.elementPresent('#vline')
        .assert.elementPresent('#hline')
        .assert.elementPresent('#ic-sidebar')
        .assert.elementPresent('#ic-chat')
        .assert.elementPresent('#ic-show-chat')
        .assert.elementPresent('#ic-show-sidebar')
        .assert.elementPresent('#ic-modes');
    },

    'clean up': require('./utils').cleanup
};

