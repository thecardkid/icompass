const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const { setup, cleanup } = require('./utils');

const actions = {
  prompt: 0,
  release: 1,
  privacy: 2,
  feedback: 3,
};

const selectHelpOption = (count) => {
  b.click('button.ic-help-button');
  b.waitForVisible('div.ic-help-menu');
  b.elements('div.ic-menu-item').value[count].click();
};

describe('help menu', () => {
  beforeAll(() => {
    setup();
    this.tabId = b.getTabIds()[0];
  });

  afterAll(cleanup);

  it('prompt', () => {
    selectHelpOption(actions.prompt);
    b.waitForVisible('#ic-modal');
    expect('#ic-modal-body').to.have.text(/Innovator's Compass/);
    b.click('#ic-modal-confirm');
  });

  it('release notes', () => {
    selectHelpOption(actions.release);
    b.pause(200);
    expect(b.getTabIds()).to.have.length(2);
    b.switchTab(this.tabId);
  });

  it('privacy statement', () => {
    selectHelpOption(actions.privacy);
    b.waitForVisible('#ic-modal');
    expect('#ic-modal-body').to.have.text(/Privacy Statement/);
    b.click('#ic-modal-confirm');
  });

  it('feedback', () => {
    selectHelpOption(actions.feedback);
    b.waitForVisible('#ic-modal');
    expect('#ic-modal-body').to.have.text(/We'd love to hear from you/);
    b.click('#ic-modal-confirm');
  });
});