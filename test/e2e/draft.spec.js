const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const { setup, cleanup, switchMode } = require('./utils');
const { PROMPTS, MODALS } = require('../../lib/constants');
const DOG_PHOTO_LINK = 'https://www.cesarsway.com/sites/newcesarsway/files/styles/large_article_preview/public/Common-dog-behaviors-explained.jpg?itok=FSzwbBoi';
const POSITIONS = [{ x: 400, y: 200 }, { x: 500, y: 200 }];

describe('draft mode', () => {
  beforeAll(() => {
    setup();
    for (let i = 0; i < POSITIONS.length; i++) {
      let p = POSITIONS[i];
      b.pause(100);
      b.moveToObject('body', p.x, p.y);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');
      b.setValue('#ic-form-text', 'This is a note');
      b.click('button[name=ship]');
      b.pause(500);
    }
  });

  afterAll(cleanup);

  describe('edit to normal notes are disabled', () => {
    it('disables dragging', () => {
      switchMode('#ic-draft');
      b.moveToObject('#note0', 10, 10);
      b.buttonDown(0);
      b.pause(100);
      b.moveToObject('body', -100, 0);
      b.buttonUp(0);
      b.waitForVisible('#ic-toast span');
      expect(b.getAttribute('#ic-toast span', 'class')).to.equal('warning');
      expect('#ic-toast span').to.have.text(new RegExp(PROMPTS.DRAFT_MODE_NO_CHANGE, 'i'));
    });

    it('disables editing text', () => {
      b.pause(100);
      b.moveToObject('#note0', 10, 10);
      b.doDoubleClick();
      b.waitForVisible('#ic-toast span');
      expect(b.getAttribute('#ic-toast span', 'class')).to.equal('warning');
      expect('#ic-toast span').to.have.text(new RegExp(PROMPTS.DRAFT_MODE_NO_CHANGE, 'i'));
      b.click('#ic-toast span');
    });
  });

  describe('text draft', () => {
    it('note form should have correct properties', () => {
      switchMode('#ic-draft');
      b.moveToObject('body', 200, 500);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');
      expect(b.getCssProperty('#ic-form-text', 'background-color').value).to.equal('rgba(128,128,128,1)');
      expect('h1.ic-modal-title').to.have.text(/Create a draft/);
    });

    it('can make draft note', () => {
      b.setValue('#ic-form-text', 'A draft text note');
      b.click('button[name=ship]');
      b.waitForVisible('#note2');
      expect('#note0').to.have.text(/A draft text note/);
      expect('#note0 span div.contents p.submit').to.be.visible();
    });
  });

  describe('image draft', () => {
    it('image form should render correctly', () => {
      b.moveToObject('body', 400, 500);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');
      b.setValue('#ic-form-text', DOG_PHOTO_LINK);
      b.click('button[name=ship]');
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(new RegExp(MODALS.IMPORT_IMAGE.text, 'i'));
      b.click('#ic-modal-confirm');
    });

    it('renders draft with image', () => {
      b.pause(1000);
      expect('#note1 span div.contents img').to.be.there();
      expect('#note1 span div.contents p.submit').to.be.there();
    });
  });

  describe('doodle draft', () => {
    it('create doodle draft', () => {
      b.keys(['d']);
      b.waitForVisible('#ic-doodle-form');
      b.moveToObject('#ic-doodle', 155, 75);
      b.buttonDown(0);
      b.moveToObject('#ic-doodle', 255, 175);
      b.buttonUp(0);
      b.pause(1000);
      b.click('button[name=ship]');
      b.waitForVisible('#note2');
      b.pause(1000);
      expect(b.getAttribute('#note2 span div.contents img', 'src')).to.contain('data:image/png;base64');
    });
  });

  describe('edit draft', () => {
    it('form has correct heading', () => {
      b.moveToObject('#note0', 10, 10);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');
      expect('h1.ic-modal-title').to.have.text(/Edit this draft/);
    });

    it('can make edit', () => {
      b.setValue('#ic-form-text', 'Edited text');
      b.click('button[name=bold]').click('button[name=underline]');
      b.click('button[name=ship]');
      b.pause(200);
      expect('#note0').to.have.text(/Edited text/);
      expect(b.getAttribute('#note0 span div.contents p', 'class')[0]).to.contain('bold');
      expect(b.getAttribute('#note0 span div.contents p', 'class')[0]).to.contain('underline');
    });

    it('cannot edit doodle', () => {
      b.moveToObject('#note2', 10, 10);
      b.doDoubleClick();
      b.waitForVisible('#ic-toast span');
      expect(b.getAttribute('#ic-toast span', 'class')).to.equal('warning');
      expect('#ic-toast span').to.have.text(new RegExp(PROMPTS.CANNOT_EDIT_DOODLE, 'i'));
    });
  });

  describe('delete draft', () => {
    it('delete draft', () => {
      b.moveToObject('body', 100, 100);
      b.doDoubleClick();
      b.setValue('#ic-form-text', 'To be deleted');
      b.click('button[name=ship]');
      b.moveToObject('#note3', 20, 20);
      b.click('#note3 button.ic-close-window');
      b.click('#ic-modal-confirm');
      b.pause(100);
    });
  });

  describe('submit drafts', () => {
    it('submit #note2', () => {
      b.click('#note2 span div.contents p.submit');
      b.pause(100);
      expect(b.getCssProperty('#note2 span div.contents', 'background').value).to.not.contain('rgb(128,128,128)');
    });

    it('submit #note1', () => {
      b.click('#note1 span div.contents p.submit');
      b.pause(100);
      expect(b.getCssProperty('#note1 span div.contents', 'background').value).to.not.contain('rgb(128,128,128)');
    });

    describe('changing mode', () => {
      it('trigger warning', () => {
        switchMode('#ic-standard');
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(new RegExp(MODALS.EXIT_DRAFT_MODE.text, 'i'));
      });

      it('discard draft if accept alert', () => {
        b.click('#ic-modal-confirm');
        expect(b.getCssProperty('#note0 span div.contents', 'background').value).to.not.contain('rgb(128,128,128)');
      });
    });
  });
});
