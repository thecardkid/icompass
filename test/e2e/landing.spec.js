const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const { cleanup } = require('./utils');
const expect = chai.expect;
const b = browser;

describe('landing page', () => {
  afterAll(cleanup);

  it('renders correctly', () => {
    b.setViewportSize({ width: 2000, height: 2000 });
    b.url('http://localhost:8080');
    b.waitForVisible('body');
    expect(b.getTitle()).to.equal('The Innovators\' Compass');
    expect('div#message').to.be.visible();
    expect('div#get-started-form').to.be.visible();
    expect('div#get-started-form input').to.have.count(2);
    expect('a.ic-guide').to.be.visible();
  });

  it('has link to guide', () => {
    expect(b.getAttribute('a.ic-guide', 'href')).to.equal('https://youtu.be/3IbxFHQ5Dxo');
  });

  it('make flow shows correct prompts', () => {
    const prompts = b.elements('div#get-started-form p').value;
    expect(prompts[0].getText()).to.equal('What topic are you working on?');
    expect(prompts[1].getText()).to.equal('Your first name');
  });

  describe('invalid input', () => {
    afterEach(() => {
      b.clearElement('#compass-center');
      b.clearElement('#username');
    });

    it('missing both', () => {
      b.click('button[type=submit]').pause(200);
      expect('#ic-modal').to.not.be.visible();
      expect('#compass').to.not.be.visible();
    });

    it('missing username', () => {
      b.setValue('#compass-center', 'acceptable');
      b.click('button[type=submit]').pause(200);
      expect('#ic-modal').to.not.be.visible();
      expect('#compass').to.not.be.visible();
    });

    it('missing topic', () => {
      b.setValue('#username', 'sandbox');
      b.click('button[type=submit]').pause(200);
      expect('#ic-modal').to.not.be.visible();
      expect('#compass').to.not.be.visible();
    });
  });

  describe('valid input', () => {
    it('can create compass and is prompted for email', () => {
      b.setValue('#compass-center', 'topic');
      b.setValue('#username', 'sandbox');
      b.click('button[type=submit]');
      b.waitForVisible('#ic-modal');

      expect('#ic-modal-body').to.have.text(/Receive a link/);
      expect(b.getAttribute('#ic-modal-input', 'placeholder')).to.equal('enter email or leave blank');
      expect('#ic-modal-cancel').to.not.be.visible();
      expect('#ic-modal-input').to.be.visible();
    });

    it('wrong email format reprompts for email', () => {
      b.setValue('#ic-modal-input', 'fakeemail');
      b.click('#ic-modal-confirm');
      b.waitForVisible('#ic-toast');
      expect('#ic-toast').to.have.text(/not a valid email address/);
    });

    it('empty email skips sending reminder', () => {
      b.clearElement('#ic-modal-input');
      b.click('#ic-modal-confirm');
      b.waitForVisible('#compass');
    });

    it('valid email shows toast', () => {
      b.back();
      b.waitForVisible('#ic-landing-container');
      b.setValue('#compass-center', 'topic');
      b.setValue('#username', 'valid');
      b.click('button[type=submit]');
      b.waitForVisible('#ic-modal');
      b.setValue('#ic-modal-input', 'fakeemail@test.com');
      b.click('#ic-modal-confirm');
      b.waitForVisible('#ic-toast span');
      expect('#ic-toast span').to.have.text(/email/);
    });
  });
});
