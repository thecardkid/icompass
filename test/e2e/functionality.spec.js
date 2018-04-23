const { setup, cleanup, switchMode } = require('./utils');

const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const MODALS = require('../../lib/constants.js').MODALS;
const imageUrl = 'https://s-media-cache-ak0.pinimg.com/736x/47/b9/7e/47b97e62ef6f28ea4ae2861e01def86c.jpg';

describe('basic functionality', () => {
  beforeAll(setup);

  afterAll(cleanup);

  it('elements are there', () => {
    expect('#vline').to.be.visible();
    expect('#hline').to.be.visible();
    expect('.ic-workspace-button').to.be.visible();
    expect('.ic-help-button').to.be.visible();
    expect('#center').to.have.text('topic');

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
  });

  describe('key bindings', () => {
    it('new note', () => {
      b.keys('n');
      expect('#ic-note-form').to.be.visible();
      b.click('button[name=ship]');
      expect('#ic-note-form').to.be.visible();
      b.keys('\uE00C'); // ESCAPE
      expect('#ic-note-form').to.not.be.visible();
    });

    it('new doodle', () => {
      b.keys('d');
      expect('#ic-doodle-form').to.be.visible();
      b.keys('\uE00C'); // ESCAPE
      expect('#ic-doodle-form').to.not.be.visible();
    });
  });

  describe('sticky workflow', () => {
    describe('text', () => {
      it('create', () => {
        expect('.ic-sticky-note').to.have.count(0);
        b.keys('n');
        b.setValue('#ic-form-text', 'An observation');
        b.click('button[name=ship]').pause(200);
        expect('.ic-sticky-note').to.have.count(1);
        expect('.ic-sticky-note').to.have.text(/An observation/);
      });

      it('edit', () => {
        b.moveToObject('.ic-sticky-note', 5, 5);
        b.doDoubleClick();
        b.waitForVisible('#ic-note-form');
        b.setValue('#ic-form-text', 'A principle');
        b.click('button[name=ship]');
        b.pause(200);
        expect('.ic-sticky-note').to.have.text(/A principle/);
      });

      it('dragging', () => {
        const oldPos = b.getLocation('#note0');
        b.moveToObject('#note0', 10, 10);
        b.buttonDown(0);
        b.moveToObject('#note0', -290, -290);
        b.buttonUp(0);
        const newPosition = b.getLocation('#note0');

        expect(oldPos.x - newPosition.x).to.equal(300);
        expect(oldPos.y - newPosition.y).to.equal(300);
      });
    });

    describe('images', () => {
      it('entering link in note form should ask if the link is an image', () => {
        b.keys('n');
        b.setValue('#ic-form-text', imageUrl);
        b.click('button[name=ship]');
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(new RegExp(MODALS.IMPORT_IMAGE.text, 'i'));
      });

      it('rejecting the prompt should embed the link', () => {
        b.click('#ic-modal-cancel');
        b.pause(1000);
        expect('div.ic-img').to.have.count(0);
        expect('#note1 span div.contents p a').to.be.there(); // expect embedded link
      });

     it('accepting image prompt should render image', () => {
        b.moveToObject('#note1', 10, 1);
        b.doDoubleClick();
        b.waitForVisible('#ic-note-form');
        b.click('button[name=ship]');
        b.waitForVisible('#ic-modal');

        b.click('#ic-modal-confirm');
        b.pause(1000);
        expect('div.ic-img').to.have.count(1);
      });

      it('editing an image made from the note-form will show an image-form', () => {
        b.moveToObject('div.ic-img', 50, 50);
        b.doDoubleClick();
        b.pause(100);
        expect('#ic-image-form').to.be.visible();
        b.click('button[name=nvm]');
      });

      describe('image form', () => {
        it('create image', () => {
          b.keys('i');
          b.waitForVisible('#ic-image-form');

          b.setValue('#ic-form-text', imageUrl);
          b.pause(200);
          expect('div.preview').to.be.visible();
          expect('div.preview img').to.be.visible();
          b.click('button[name=ship]');

          expect('div.ic-img').to.have.count(2);
        });

        it('edit image', () => {
          b.moveToObject('div.ic-img', 20, 20);
          b.doDoubleClick();
          b.waitForVisible('#ic-image-form');
          expect('#ic-form-text').to.have.text(imageUrl);
          b.click('button[name=nvm]');
        });
      });
    });

    describe('delete', () => {
      it('rejecting alert preserves note', () => {
        b.moveToObject('#note2', 164, 2);
        b.leftClick();
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(new RegExp(MODALS.DELETE_NOTE.text, 'i'));
        b.click('#ic-modal-cancel');
        expect('div.ic-sticky-note').to.have.count(3);
      });

      it('accepting alert deletes note', () => {
        b.moveToObject('#note1', 164, 2);
        b.leftClick();
        b.waitForVisible('#ic-modal');
        b.click('#ic-modal-confirm');
        b.pause(500);
        expect('div.ic-sticky-note').to.have.count(2);
      });
    });

    describe('other actions', () => {
      it('doodle', () => {
        b.keys('d');
        b.waitForVisible('#ic-doodle-form');
        b.click('button[name=ship]');
        expect('#ic-doodle-form').to.be.visible();

        b.moveToObject('#ic-doodle', 155, 75);
        b.buttonDown(0);
        b.moveToObject('#ic-doodle', 255, 175);
        b.buttonUp(0);
        b.pause(500);
        b.click('button[name=ship]').pause(200);
        expect('div.ic-sticky-note').to.have.count(3);

        expect(b.getAttribute('#note2 div.ic-img img', 'src')).to.contain('data:image/png;base64');
      });

      it('styling', () => {
        b.keys('n');
        b.waitForVisible('#ic-note-form');
        b.setValue('#ic-form-text', 'Text styling example');

        expect(b.getAttribute('#ic-form-text', 'class')).to.not.contain('bold');
        b.click('button[name=bold]');
        b.pause(100);
        expect(b.getAttribute('#ic-form-text', 'class')).to.contain('bold');
        b.click('button[name=bold]');
        b.pause(100);
        expect(b.getAttribute('#ic-form-text', 'class')).to.not.contain('bold');

        b.click('button[name=italic]');
        b.click('button[name=underline]');
        b.pause(100);
        b.click('button[name=ship]');
        b.pause(200);

        expect('div.ic-sticky-note').to.have.count(4);
        expect(b.getAttribute('#note3 div.contents p', 'class')[0]).to.not.contain('bold');
        expect(b.getAttribute('#note3 div.contents p', 'class')[0]).to.contain('italic');
        expect(b.getAttribute('#note3 div.contents p', 'class')[0]).to.contain('underline');
      });

      it('double click for new note', () => {
        b.moveToObject('body', 300, 200);
        b.doDoubleClick();
        b.waitForVisible('#ic-note-form');
        b.setValue('#ic-form-text', 'Double click to create');
        b.click('button[name=ship]').pause(200);
        expect('div.ic-sticky-note').to.have.count(5);
        const pos = b.getLocation('#note4');
        expect(pos.x).to.equal(300);
        expect(pos.y).to.equal(200);
      });
    });
  });

  it('compact mode', () => {
    expect('div.compact').to.have.count(0);
    switchMode('#ic-compact');
    b.pause(300);
    expect('div.compact').to.have.count(3);
    switchMode('#ic-standard');
  });
});
