const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

describe('login', () => {
  let code;

  beforeAll(() => {
    b.setViewportSize({ width: 2000, height: 2000 });
    b.url('http://localhost:8080');
    b.waitForVisible('body');
    expect(b.getTitle()).to.equal('The Innovators\' Compass');
    expect('div[name=find]').to.be.visible();
    expect('div[name=make]').to.be.visible();
  });

  afterAll(() => {
    b.click('button[name=to-workspace]');
    b.waitForVisible('#ic-sidebar');
    require('./utils').cleanup();
  });

  describe('make flow', () => {
    it('make flow shows correct prompts', () => {
      b.click('div[name=make]');
      b.waitForVisible('input#compass-center');

      const namePrompt = b.getAttribute('input#username', 'placeholder');
      expect(namePrompt).to.equal('Your name (as you\'d like it to appear, no spaces)');

      const topicPrompt = b.getAttribute('input#compass-center', 'placeholder');
      expect(topicPrompt).to.equal('Topic');
    });

    describe('invalid input', () => {
      afterEach(() => {
        b.clearElement('#compass-center');
        b.clearElement('#username');
      });

      it('missing both', () => {
        b.click('input[type=submit]').pause(200);
        expect('#ic-modal').to.not.be.visible();
        expect('#compass').to.not.be.visible();
      });

      it('missing username', () => {
        b.setValue('#compass-center', 'acceptable');
        b.click('input[type=submit]').pause(200);
        expect('#ic-modal').to.not.be.visible();
        expect('#compass').to.not.be.visible();
      });

      it('missing topic', () => {
        b.setValue('#username', 'sandbox');
        b.click('input[type=submit]').pause(200);
        expect('#ic-modal').to.not.be.visible();
        expect('#compass').to.not.be.visible();
      });

      it('topic too long', () => {
        const text = 'This is a really long topic name that will hopefully exceed char limit';
        b.setValue('#compass-center', text);
        expect('#compass-center').to.have.value(text.substring(0, 30));
      });
    });

    describe('valid input', () => {
      beforeAll(() => {
        b.setValue('#compass-center', 'topic');
        b.setValue('#username', 'sandbox');
        b.click('input[type=submit]');
        b.waitForVisible('#ic-modal');

        expect('#ic-modal-body').to.have.text(/Email reminder/);
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
        code = b.getUrl().split('/')[5];
      });

      it('valid email shows toast', () => {
        b.back();
        b.waitForVisible('#ic-landing');
        b.click('div[name=make]');
        b.setValue('#compass-center', 'topic');
        b.setValue('#username', 'valid');
        b.click('input[type=submit]');
        b.waitForVisible('#ic-modal');
        b.setValue('#ic-modal-input', 'fakeemail@test.com');
        b.click('#ic-modal-confirm');
        b.waitForVisible('#ic-toast span');
        expect('#ic-toast span').to.have.text(/email/);
      });
    });

  });

  describe('find flow', () => {
    it('find flow shows correct prompts', () => {
      b.url('http://localhost:8080');
      b.click('div[name=find]');
      b.waitForVisible('input#compass-code');

      const codePrompt = b.getAttribute('input#compass-code', 'placeholder');
      expect(codePrompt).to.equal('The code of the compass you\'re looking for');

      const namePrompt = b.getAttribute('input#username', 'placeholder');
      expect(namePrompt).to.equal('Your name (as you\'d like it to appear, no spaces)');
    });

    describe('invalid input', () => {
      afterEach(() => {
        b.clearElement('#compass-code');
        b.clearElement('#username');
      });

      it('missing both', () => {
        b.click('input[type=submit]').pause(200);
        expect('#ic-modal').to.not.be.visible();
        expect('#compass').to.not.be.visible();
      });

      it('code too short', () => {
        b.setValue('#username', 'valid');
        b.setValue('#compass-code', '1234567');
        b.click('input[type=submit]');
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(/Your code is not valid/);
        b.click('#ic-modal-confirm');
      });

      it('missing username', () => {
        b.setValue('#compass-code', '12345678');
        b.click('input[type=submit]').pause(200);
        expect('#ic-modal').to.not.be.visible();
        expect('#compass').to.not.be.visible();
      });

      describe('invalid username', () => {
        beforeEach(() => {
          b.setValue('#compass-code', '12345678');
        });

        it('contains number', () => {
          b.setValue('#username', 'sandbox2');
          b.click('input[type=submit]').pause(200);
          b.waitForVisible('#ic-modal');
          expect('#ic-modal-body').to.have.text(/Username can only contain letters/);
          b.click('#ic-modal-confirm');
        });

        it('contains symbols', () => {
          b.setValue('#username', ',,,###');
          b.click('input[type=submit]').pause(200);
          b.waitForVisible('#ic-modal');
          expect('#ic-modal-body').to.have.text(/Username can only contain letters/);
          b.click('#ic-modal-confirm');
        });

        it('too long', () => {
          const text = 'sandboxsandboxsandboxsandboxsandboxsandbox';
          b.setValue('#username', text);
          expect('#username').to.have.value(text.substring(0, 15));
        });
      });
    });

    it('find flow successful', () => {
      b.setValue('#compass-code', code);
      b.setValue('#username', 'sandbox');
      b.click('input[type=submit]');
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(/You will be logged in as "sandbox" with edit access/);
    });
  });
});
