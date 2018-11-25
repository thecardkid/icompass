const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const _ = require('underscore');

const { expect } = chai;
const { STICKY_COLORS } = require('../../lib/constants');

const setup = () => {
  browser.setViewportSize({ width: 2000, height: 2000 });
  browser.url('http://localhost:8080');
  browser.waitForVisible('body', 1000);
  browser.setValue('#compass-center', 'webdriverio');
  browser.setValue('#username', 'sandbox');
  browser.click('button[type=submit]');
  browser.waitForVisible('#ic-modal', 1000);
  // do not bookmark
  browser.click('#ic-modal-cancel');
  browser.waitForVisible('#compass', 1000);
  browser.waitForVisible('#ic-modal');
  // set topic
  browser.setValue('#ic-modal-input', 'topic');
  browser.click('#ic-modal-confirm');
  browser.pause(2000);
};

const cleanup = () => {
  browser.click('button.ic-workspace-button');
  browser.waitForVisible('div.ic-workspace-menu');
  browser.elements('div.ic-menu-item').value[8].click();
  // confirm delete
  browser.waitForVisible('#ic-modal', 1000);
  browser.click('#ic-modal-confirm');
  // confirm thank-you-note
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

const expectCompassStructure = () => {
  expect('#observations').to.be.visible();
  expect('#observations h1').to.have.text(/OBSERVATIONS/);
  expect('#observations h2').to.have.text(/What's happening\? Why\?/);

  expect('#principles').to.be.visible();
  expect('#principles h1').to.have.text(/PRINCIPLES/);
  expect('#principles h2').to.have.text(/What matters most\?/);

  expect('#ideas').to.be.visible();
  expect('#ideas h1').to.have.text(/IDEAS/);
  expect('#ideas h2').to.have.text(/What ways are there\?/);

  expect('#experiments').to.be.visible();
  expect('#experiments h1').to.have.text(/EXPERIMENTS/);
  expect('#experiments h2').to.have.text(/What's a step to try\?/);
};

const selectColor = (color) => {
  browser.click('.ic-form-palette .icon');
  browser.elements('.ic-color').value[_.indexOf(STICKY_COLORS, color)].click();
};

module.exports = {
  setup,
  cleanup,
  switchMode,
  expectCompassStructure,
  selectColor,
};
