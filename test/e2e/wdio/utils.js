'use strict';

module.exports.setup = (browser) => {
    browser.setViewportSize({ width: 1500, height: 1500 });
    browser.url('http://localhost:8080');
    browser.waitForVisible('body', 1000);
    browser.click('button[name=make]');
    browser.setValue('#compass-center', 'nightwatchjs');
    browser.setValue('#username', 'sandbox');
    browser.click('button[name=next]');
    browser.waitForVisible('.third', 1000);
    browser.click('button[name=to-workspace]');
    browser.waitForVisible('#ic-sidebar', 1000);
};

module.exports.cleanup = function(browser) {
    browser.click('#ic-sidebar button[name=destroyer]');
    browser.waitForVisible('#ic-modal', 1000);
    browser.click('#ic-modal-confirm');
    browser.waitForVisible('#ic-modal', 5000);
    browser.click('#ic-modal-confirm');
};
