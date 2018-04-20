const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const { setup, cleanup } = require('./utils');
const PROMPTS = require('../../lib/constants').PROMPTS;
const MODALS = require('../../lib/constants').MODALS;

describe('sidebar', () => {
  beforeAll(setup);

  afterAll(() => {
    b.back();
    b.waitForVisible('#ic-sidebar');
    cleanup();
  });

  describe('share section', () => {
    it('share edit mode', () => {
      expect('div.ic-sidebar-list[name="share"]').to.be.visible();
      b.click('button[name="share-edit"]');
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(/Share this link below/);
      expect('#ic-modal-body p').to.have.text(/\/compass\/edit/);
      b.click('#ic-modal-confirm');
    });

    it('share view mode', () => {
      b.click('button[name="share-view"]');
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(/Share this link below/);
      expect('#ic-modal-body p').to.have.text(/\/compass\/view/);
      b.click('#ic-modal-confirm');
    });

    describe('email reminder', () => {
      it('wrong email format displays error message', () => {
        b.click('button[name=email]');
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(/Email reminder/);
        b.setValue('#ic-modal-input', 'fakeemail');
        b.click('#ic-modal-confirm');
        b.waitForVisible('#ic-toast');
        expect('#ic-toast').to.have.text(/not a valid email/);
      });

      it('valid email shows toast', () => {
        b.setValue('#ic-modal-input', 'fakeemail@valid.com');
        b.click('#ic-modal-confirm');
        b.waitForVisible('#ic-toast span');
        expect('#ic-toast span').to.have.text(/email/);
      });
    });

    it('export button', () => {
      b.click('button[name="export"]');
      b.waitForVisible('#ic-modal');
      expect(b.getText('#ic-modal-body')).to.contain('I see you want to save this compass as a PDF');
      b.click('#ic-modal-cancel');
    });

    it('tweet button is there', () => {
      expect('button[name=tweet]').to.be.visible();
    });
  });

  describe('controls section', () => {
    let buttons;

    beforeAll(() => {
      buttons = b.elements('div.ic-sidebar-list[name=controls] .ic-action').value;
    });

    it('is visible', () => {
      expect('div.ic-sidebar-list[name=controls]').to.be.visible();
    });

    it('new note button', () => {
      buttons[0].click();
      expect('#ic-note-form').to.be.visible();
      b.click('button[name="nvm"]');
    });

    it('new doodle button', () => {
      buttons[1].click();
      expect('#ic-doodle-form').to.be.visible();
      b.click('button[name="nvm"]');
    });

    it('toggle sidebar button', () => {
      buttons[2].click().pause(2000);
      expect(b.getCssProperty('#ic-sidebar', 'left').value).to.equal('0px');
    });

    it('toggle chat button', () => {
      buttons[3].click();
      b.pause(500);
      expect(b.getCssProperty('#ic-chat', 'bottom').value).to.equal('0px');
      buttons[3].click();
      b.pause(500);
      expect(b.getCssProperty('#ic-chat', 'bottom').value).to.equal('-270px');
    });

    it('toggle prompt button', () => {
      buttons[4].click();
      expect('#ic-about').to.be.visible();
      b.click('#ic-about button.ic-close-window');
    });
  });

  it('user section', () => {
    expect('div.ic-sidebar-list[name=users]').to.be.visible();
    expect('div.ic-sidebar-list[name=users] p').to.have.text(/You/);
  });

  it('status section', () => {
    expect('div.ic-sidebar-list[name=status]').to.be.visible();
    expect('div.ic-sidebar-list[name=status] h2').to.have.text(/Status - connected/);
  });

  it('credits section', () => {
    expect('div.ic-sidebar-list[name=credits]').to.be.visible();
    expect(b.getAttribute('div.ic-sidebar-list[name=credits] p[name=ela] a', 'href')).to.equal('http://innovatorscompass.org/');
    expect(b.getAttribute('div.ic-sidebar-list[name=credits] p[name=hieu] a', 'href')).to.equal('http://hieuqn.com/');
  });

  it('version section', () => {
    expect('div.ic-sidebar-list[name=version]').to.be.visible();
    expect(b.getAttribute('div.ic-sidebar-list[name=version] p a', 'href')).to.equal('https://github.com/thecardkid/innovators-compass/releases');
  });

  describe('other actions section', () => {
    it('privacy statement', () => {
      expect('button[name=privacy]').to.be.visible();
      b.click('button[name=privacy]');
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(/Privacy Statement/);
      b.click('#ic-modal-confirm');
    });

    it('feedback form', () => {
      expect('button[name=sucks]').to.be.visible();
      b.click('button[name=sucks]');
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(/We'd love to hear from you/);
      b.click('#ic-modal-confirm');
    });

    it('tutorial button has link', () => {
      expect('button[name=tutorial] a').to.be.there();
    });

    describe('bookmarking', () => {
      it('toast displays success status', () => {
        b.click('button[name=save]');
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(/Bookmarks give you quick access/);
        b.setValue('#ic-modal-input', 'My bookmark');
        b.click('#ic-modal-confirm');
        b.waitForVisible('#ic-toast span');
        expect(b.getAttribute('#ic-toast span', 'class')).to.equal('success');
        expect('#ic-toast span').to.have.text(new RegExp(PROMPTS.SAVE_SUCCESS, 'i'));
        b.click('#ic-toast span');
      });

      it('bookmark has correct info', () => {
        b.click('button[name=logout]');
        b.waitForVisible('div.ic-saved');
        expect(b.getUrl()).to.equal('http://localhost:8080/');
        b.click('div.ic-saved a');
        b.waitForVisible('#compass');
        expect(b.getUrl()).to.contain('http://localhost:8080/compass/edit');
        b.back();
        b.waitForVisible('#ic-landing');
        b.click('div.ic-saved #arrow');
        b.pause(100);
        expect('div.ic-saved a').to.have.text('My bookmark');
        expect('div.ic-saved div.ic-saved-info p').to.have.text('as "sandbox"');
      });

      it('can edit bookmark', () => {
        b.click('button.edit');
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.contain.text(new RegExp(MODALS.EDIT_BOOKMARK, 'i'));
        b.setValue('#ic-modal-input', 'Changed name');
        b.click('#ic-modal-confirm');
        expect('div.ic-saved a').to.have.text('Changed name');
      });

      it('can remove bookmark', () => {
        b.click('button.remove');
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(new RegExp(MODALS.DELETE_BOOKMARK.text, 'i'));
        b.click('#ic-modal-confirm');
        expect('div.ic-saved').to.not.be.there();
      });
    });
  });
});
