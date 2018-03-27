const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const PROMPTS = require('../../lib/constants').PROMPTS;

describe('collaboration', () => {
  const colors = {};
  let tabs = {};

  beforeAll(() => {
    require('./utils').setup();
    colors.webdriverio = b.getCssProperty('.ic-user', 'background-color').value;
    tabs.webdriverio = b.getCurrentTabId();
    b.click('button[name=share-edit]');
    b.waitForVisible('#ic-modal');

    const text = b.getText('#ic-modal-body p');
    const code = text.substring(text.length - 8);
    const shareUrl = `http://localhost:8080/compass/edit/${code}/friendo`;
    b.click('#ic-modal-confirm');

    b.newWindow(shareUrl, 'friendo', 'width=2000,height=2000');
    b.setViewportSize({ width: 2000, height: 2000 });
    b.waitForVisible('#compass');
    b.click('#ic-show-sidebar');
    b.waitForVisible('#ic-sidebar');
    tabs.friendo = b.getCurrentTabId();
    colors.friendo = b.getCssProperty('.ic-user:nth-of-type(2)', 'background-color').value;
    expect('.ic-user').to.have.count(2);
  });

  describe('continuous edit operations', () => {
    it('friendo creates a note', () => {
      b.switchTab(tabs.friendo);
      b.keys(['n']);
      b.waitForVisible('#ic-note-form');
      b.setValue('#ic-form-text', 'Friendo\'s note');
      b.click('button[name=ship]');
      b.waitForVisible('#note0');

      expect(b.getCssProperty('#note0 span a', 'background-color').value).to.equal(colors.friendo);
    });

    it('webdriverio sees the note', () => {
      b.switchTab(tabs.webdriverio);
      expect('#note0').to.be.visible();
      expect('#note0').to.have.text(/Friendo's note/);
    });

    it('webdriverio drags the note and friendo sees the drag', () => {
      b.switchTab(tabs.friendo);
      const oldPos = b.getLocation('#note0');

      b.switchTab(tabs.webdriverio);
      b.moveToObject('#note0', 10, 10);
      b.buttonDown(0).pause(100);
      b.moveToObject('#note0', 210, 210);
      b.buttonUp(0).pause(100);

      b.switchTab(tabs.friendo);
      const newPos = b.getLocation('#note0');

      expect(newPos.x).to.not.equal(oldPos.x);
      expect(newPos.y).to.not.equal(oldPos.y);
    });

    it('friendo makes an edit and webdriverio sees edit', () => {
      b.switchTab(tabs.friendo);

      b.doubleClick('#note0').pause(100);
      b.waitForVisible('#ic-note-form');
      b.setValue('#ic-form-text', 'edit');
      b.click('button[name=ship]');
      b.pause(500);

      b.switchTab(tabs.webdriverio);
      expect('#note0').to.have.text(/edit/);
    });
  });

  describe('logouts', () => {
    it('webdriverio logs out and friendo sees only 1 user', () => {
      b.switchTab(tabs.webdriverio);
      b.url('http://localhost:8080/');

      b.switchTab(tabs.friendo);
      expect('.ic-user').to.have.count(1);
      expect(b.getCssProperty('.ic-user', 'background-color').value).to.equal(colors.friendo);
    });

    it('webdriverio logs in and both see 2 users', () => {
      b.switchTab(tabs.webdriverio);
      b.back();
      b.waitForVisible('#compass');
      b.click('#ic-show-sidebar');
      b.waitForVisible('#ic-sidebar');
      expect('.ic-user').to.have.count(2);
      colors.webdriverio = b.getCssProperty('.ic-user:nth-of-type(2)', 'background-color').value;

      b.switchTab(tabs.friendo);
      expect('.ic-user').to.have.count(2);
    });
  });

  describe('timeboxes', () => {
    it('webdriverio creates timer and friendo sees it', () => {
      b.switchTab(tabs.webdriverio);
      b.click('button[name=timer]');
      b.waitForVisible('#ic-timer-config');
      b.click('button[name=ic-3m]');
      b.waitForVisible('#ic-toast');

      b.switchTab(tabs.friendo);
      expect('#ic-toast').to.have.text(/A timebox for 3m0s has been created/);
      b.pause(1000);
      expect('button[name=timer] p.ic-time').to.have.text(/02:/);
    });

    it('can cancel timebox', () => {
      b.switchTab(tabs.friendo);
      b.click('button[name=timer] div div p');
      b.waitForVisible('#ic-toast');

      b.switchTab(tabs.webdriverio);
      expect('#ic-toast').to.have.text(/Timebox has been canceled/);
      expect('button[name=timer] p.ic-time').to.not.be.there();
    });
  });

  describe('chat', () => {
    it('red alert on chat box if message received while chat is hidden', () => {
      b.switchTab(tabs.webdriverio);
      expect(b.getCssProperty('#ic-chat', 'bottom').value).to.equal('-270px');

      b.switchTab(tabs.friendo);
      b.click('#ic-show-chat').pause(500);
      b.setValue('#message-text', ['first message', '\uE007']);
      b.waitForVisible('div.mine');
      expect('div.mine').to.have.text(/first message/);
      expect(b.getCssProperty('div.mine', 'background-color').value).to.equal(colors.friendo);

      b.switchTab(tabs.webdriverio);
      expect(b.getCssProperty('button#ic-show-chat', 'background-color').value).to.equal('rgba(194,26,3,1)');
    });

    it('chat messages are rendered correctly', () => {
      b.switchTab(tabs.webdriverio);
      b.click('#ic-show-chat');
      b.pause(500);

      expect('div.theirs').to.be.visible();
      expect('div.theirs').to.have.text(/first message/);
      expect(b.getCssProperty('div.theirs', 'background-color').value).to.equal(colors.friendo);
    });

    it('renders both "mine" and "their" messages with correct colors', () => {
      b.setValue('#message-text', ['second message', '\uE007']);
      b.waitForVisible('div.mine');
      expect('div.mine').to.have.text(/second message/);
      expect(b.getCssProperty('div.mine', 'background-color').value).to.equal(colors.webdriverio);

      b.switchTab(tabs.friendo);
      expect('div.theirs').to.be.visible();
      expect('div.theirs').to.have.text(/second message/);
      expect(b.getCssProperty('div.theirs', 'background-color').value).to.equal(colors.webdriverio);
    });
  });

  describe('draft mode', () => {
    it('other users do not see drafts', () => {
      b.switchTab(tabs.webdriverio);
      b.click('#ic-mode-draft');
      b.moveToObject('body', 300, 200);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');
      b.setValue('#ic-form-text', 'webdriverio draft');
      b.click('button[name=ship]');
      b.waitForVisible('#note1');
      expect('.ic-sticky-note').to.have.count(2);

      b.switchTab(tabs.friendo);
      expect('.ic-sticky-note').to.have.count(1);
    });

    it('notes submitted by others still show up while in draft mode', () => {
      // webdriverio in draft mode, friendo creates new note

      b.switchTab(tabs.friendo);
      b.moveToObject('body', 300, 600);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');
      b.setValue('#ic-form-text', 'note while in draft');
      b.click('button[name=ship]');
      b.waitForVisible('#note1');
      expect('.ic-sticky-note').to.have.count(2);

      b.switchTab(tabs.webdriverio);
      expect('.ic-sticky-note').to.have.count(3);
    });

    it('submitting a draft makes it visible to others', () => {
      b.switchTab(tabs.webdriverio);
      b.click('#note0 span a p.submit');
      b.pause(500);
      expect('#note2').to.have.text(/webdriverio draft/);

      b.switchTab(tabs.friendo);
      expect('.ic-sticky-note').to.have.count(3);
    });
  });

  describe('visual mode', () => {
    it('edits while in visual mode don\'t show up', () => {
      b.switchTab(tabs.webdriverio);
      b.click('#ic-mode-visual');
      b.waitForVisible('#ic-visual-toolbar');
      b.click('button.bold');
      b.click('#note0');
      b.click('#note2');
      expect(b.getAttribute('#note0 span a p', 'class')[0]).to.contain('bold');
      expect(b.getAttribute('#note2 span a p', 'class')[0]).to.contain('bold');

      b.switchTab(tabs.friendo);
      expect(b.getAttribute('#note0 span a p', 'class')[0]).to.not.contain('bold');
      expect(b.getAttribute('#note2 span a p', 'class')[0]).to.not.contain('bold');
    });

    it('deleting a note that is being edited by a user removes it from that user\'s screen', () => {
      b.switchTab(tabs.friendo);
      b.click('#ic-mode-visual');
      b.waitForVisible('#ic-visual-toolbar');
      b.click('#note2');
      b.click('#ic-bulk-delete');
      b.waitForVisible('#ic-modal');
      b.click('#ic-modal-confirm');
      b.pause(1000);
      expect('.ic-sticky-note').to.have.count(2);

      b.switchTab(tabs.webdriverio);
      expect('.ic-sticky-note').to.have.count(2);
      // #note0 is still selected
      expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(40,138,255)');
      // #note1 is still not selected
      expect(b.getCssProperty('#note1', 'border-color').value).to.equal('rgb(0,0,0)');
    });

    it('submitting changes show up on other\'s screen', () => {
      b.switchTab(tabs.webdriverio);
      b.click('#ic-bulk-submit');
      b.pause(500);

      b.switchTab(tabs.friendo);
      expect(b.getAttribute('#note0 span a p', 'class')[0]).to.contain('bold');
    });
  });

  describe('compass delete', () => {
    it('user who performs delete action gets redirected to home page', () => {
      b.switchTab(tabs.webdriverio);
      b.click('#ic-sidebar button[name=destroyer]');
      b.waitForVisible('#ic-modal');
      b.click('#ic-modal-confirm');
      b.pause(200);
      b.waitForVisible('#ic-modal');
      b.click('#ic-modal-confirm');
      b.pause(500);
      expect(b.getUrl()).to.equal('http://localhost:8080/');
    });

    it('any other user in that deleted workspace also gets redirected to home page', () => {
      b.switchTab(tabs.friendo);
      expect('#ic-modal').to.be.visible();
      expect('#ic-modal').to.have.text(new RegExp(PROMPTS.COMPASS_DELETED, 'i'));
      b.click('#ic-modal-confirm');
      b.pause(500);
      expect(b.getUrl()).to.equal('http://localhost:8080/');
    });
  });
});
