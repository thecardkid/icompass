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
    .windowMaximize();
};

module.exports.cleanup = function(browser) {
    browser
    .waitForElementVisible('#ic-sidebar button[name=destroyer]', 1000)
    .click('#ic-sidebar button[name=destroyer]')
    .waitForElementVisible('#ic-modal', 1000)
    .click('#ic-modal-confirm')
    .pause(200)
    .click('#ic-modal-confirm')
    .pause(500)
    .url(function(result) {
        this.assert.equal(result.value, 'http://localhost:8080/');
    })
    .end();
};
