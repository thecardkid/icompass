const setup = () => {
  browser.setViewportSize({ width: 2000, height: 2000 });
  browser.url('http://localhost:8080');
  browser.waitForVisible('body', 1000);
  browser.setValue('#compass-center', 'webdriverio');
  browser.setValue('#username', 'sandbox');
  browser.click('input[type=submit]');
  browser.waitForVisible('#ic-modal', 1000);
  browser.click('#ic-modal-confirm');
  browser.waitForVisible('#ic-sidebar', 1000);
};

const cleanup = () => {
  browser.click('#ic-sidebar button[name=destroyer]');
  browser.waitForVisible('#ic-modal', 1000);
  browser.click('#ic-modal-confirm');
  browser.waitForVisible('#ic-modal', 5000);
  browser.click('#ic-modal-confirm');
};

module.exports = { setup, cleanup };
