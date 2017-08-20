'use strict';

module.exports.setup = function(browser) {
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
    .windowHandle(function(result) {
        browser.windowSize(result.value, 2000, 1500);
    });
};

module.exports.cleanup = function(browser) {
    browser
    .click('#ic-sidebar button[name=destroyer]')
    .waitForElementVisible('#ic-modal', 1000)
    .click('#ic-modal-confirm')
    .pause(100)
    .waitForElementVisible('#ic-modal', 5000)
    .click('#ic-modal-confirm')
    .pause(500)
    .assert.urlEquals('http://localhost:8080/')
    .end();
};
