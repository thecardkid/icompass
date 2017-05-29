
var editURL;
const PROMPTS = require('../../lib/constants').PROMPTS;

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
        .url(function(result) {
            editURL = result.value;
        })
        .windowMaximize();
    },

    'share list': function(browser) {
        browser
        .assert.elementPresent('div.ic-sidebar-list[name=share]')
        .click('button[name=share-edit]')
        .pause(200)
        .getAlertText(function(result) {
            this.assert.equal(result.value.indexOf('Share this link below'), 0);
        })
        .dismissAlert()
        .pause(200)
        .click('button[name=share-view]')
        .pause(200)
        .getAlertText(function(result) {
            this.assert.equal(result.value.indexOf('Share this link below'), 0);
        })
        .dismissAlert()
        .pause(200)
        .click('button[name=export]')
        .pause(200)
        .getAlertText(function(result) {
            this.assert.equal(result.value, PROMPTS.EXPORT);
        })
        .dismissAlert()
        .assert.elementPresent('button[name=tweet]');
    },

    'control list': function(browser) {
        browser
        .assert.elementPresent('div.ic-sidebar-list[name=controls]');
    },

    'user list': function(browser) {
        browser
        .assert.elementPresent('div.ic-sidebar-list[name=users]')
        .getText('div.ic-sidebar-list[name=users] p', function(result) {
            this.assert.equal(result.value.indexOf('You') > -1, true);
        });
    },

    'status display': function(browser) {
        browser
        .assert.elementPresent('div.ic-sidebar-list[name=status]')
        .getText('div.ic-sidebar-list[name=status] h2', function(result) {
            this.assert.equal(result.value, 'Status - connected');
        })
    },

    'credits': function(browser) {
        browser
        .assert.elementPresent('div.ic-sidebar-list[name=credits]')
        .getAttribute('div.ic-sidebar-list[name=credits] p[name=ela] a', 'href', function(result) {
            this.assert.equal(result.value, 'http://innovatorscompass.org/');
        })
        .getAttribute('div.ic-sidebar-list[name=credits] p[name=hieu] a', 'href', function(result) {
            this.assert.equal(result.value, 'http://hieuqn.com/');
        });
    },

    'version': function(browser) {
        browser
        .assert.elementPresent('div.ic-sidebar-list[name=version]')
        .getAttribute('div.ic-sidebar-list[name=version] p a', 'href', function(result) {
            this.assert.equal(result.value, 'https://github.com/thecardkid/innovators-compass/releases');
        });
    },

    'actions': function(browser) {
        browser
        .assert.elementPresent('div.ic-sidebar-list[name=actions]')
        .assert.visible('button[name=sucks]')
        .click('button[name=sucks]')
        .pause(500)
        .assert.elementPresent('#ic-feedback')
        .click('#ic-feedback button.ic-close-window')
        .pause(200)
        .assert.elementNotPresent('#ic-feedback')
        .getAttribute('button[name=tutorial] a', 'href', function(result) {
            this.assert.equal(result.value, 'http://localhost:8080/tutorial');
        })
        .click('button[name=save]')
        .pause(200)
        .getAlertText(function(result) {
            this.assert.equal(result.value, PROMPTS.SAVE_SUCCESS);
        })
        .acceptAlert()
        .pause(200)
        .click('button[name=logout]')
        .waitForElementVisible('div.ic-saved', 1000)
        .url(function(result) {
            this.assert.equal(result.value, 'http://localhost:8080/');
        })
        .click('div.ic-saved a')
        .waitForElementVisible('#ic-sidebar', 500)
        .url(function(result) {
            this.assert.equal(result.value, editURL);
        })
        .click('button[name=logout]')
        .waitForElementVisible('div.ic-saved', 1000)
        .moveToElement('div.ic-saved', 100, 10, function() {
            browser.mouseButtonClick();
        })
        .pause(600)
        .getText('div.ic-saved a', function(result) {
            this.assert.equal(result.value, 'nightwatchjs');
        })
        .getText('div.ic-saved div.ic-saved-info p', function(result) {
            this.assert.equal(result.value, 'as "sandbox"');
        })
        .click('button.remove')
        .pause(200)
        .acceptAlert()
        .pause(200)
        .assert.elementNotPresent('div.ic-saved');
    },

    'delete': function(browser) {
        browser
        .url(editURL)
        .waitForElementVisible('#ic-sidebar', 500)
        .click('#ic-sidebar button[name=destroyer]')
        .acceptAlert()
        .pause(200)
        .acceptAlert()
        .pause(200)
        .url(function(result) {
            this.assert.equal(result.value, 'http://localhost:8080/');
        })
        .assert.elementNotPresent('div.ic-saved')
        .end();
    }
};
