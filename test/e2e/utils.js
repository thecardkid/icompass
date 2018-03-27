const setup = () => {
  browser.setViewportSize({ width: 2000, height: 2000 });
  browser.url('http://localhost:8080');
  browser.waitForVisible('body', 1000);
  browser.setValue('#compass-center', 'webdriverio');
  browser.setValue('#username', 'sandbox');
  browser.click('input[type=submit]');
  browser.waitForVisible('#ic-modal', 1000);
  browser.click('#ic-modal-confirm');
  browser.waitForVisible('#compass', 1000);
  browser.click('#center');
  browser.waitForVisible('#ic-modal');
  browser.setValue('#ic-modal-input', 'topic');
  browser.click('#ic-modal-confirm');
  browser.waitForVisible('#ic-sidebar', 4000);
};

const cleanup = () => {
  browser.click('#ic-sidebar button[name=destroyer]');
  browser.waitForVisible('#ic-modal', 1000);
  browser.click('#ic-modal-confirm');
  browser.waitForVisible('#ic-modal', 5000);
  browser.click('#ic-modal-confirm');
};

module.exports = { setup, cleanup };
