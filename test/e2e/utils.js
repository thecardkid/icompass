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
  browser.waitForVisible('#ic-modal');
  browser.setValue('#ic-modal-input', 'topic');
  browser.click('#ic-modal-confirm');
  browser.pause(2000);
};

const cleanup = () => {
  browser.click('button.ic-workspace-button');
  browser.waitForVisible('div.ic-workspace-menu');
  browser.elements('div.ic-menu-item').value[9].click();
  browser.waitForVisible('#ic-modal', 1000);
  browser.click('#ic-modal-confirm');
  browser.waitForVisible('#ic-modal', 5000);
  browser.click('#ic-modal-confirm');
};

const switchMode = (modeId) => {
  browser.click('button.ic-workspace-button');
  browser.waitForVisible('div.ic-workspace-menu');
  browser.moveTo(browser.elements('div.has-more').value[1].ELEMENT, 10, 10);
  browser.waitForVisible('div.ic-modes-submenu');
  browser.click(modeId);
};

module.exports = { setup, cleanup, switchMode };
