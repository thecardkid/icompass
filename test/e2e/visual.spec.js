const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const { setup, cleanup, switchMode } = require('./utils');
const { PROMPTS, MODALS, STICKY_COLORS } = require('../../lib/constants');
const TEXT = 'this is a note',
    POSITIONS = [ {x: 250, y: 200}, {x: 350, y: 200}, {x: 450, y: 200}, {x: 550, y: 200} ];

const expectHighlighted = (noteId) => {
  expect(b.getCssProperty(`${noteId} div.contents`, 'background-color').value).to.equal('rgba(204,255,204,1)');
};

describe('visual mode', () => {
  beforeAll(() => {
    setup();

    for (let i = 0; i < POSITIONS.length; i++) {
      let p = POSITIONS[i];
      b.moveToObject('body', p.x, p.y);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');
      b.setValue('#ic-form-text', TEXT);
      b.click('button[name=ship]');
      b.pause(500);
    }
  });

  afterAll(cleanup);

  it('visual mode toolbar is draggable', () => {
    expect('#ic-visual-toolbar').to.not.be.there();
    switchMode('#ic-bulk');
    b.waitForVisible('#ic-visual-toolbar');

    let pos = b.getLocation('#ic-visual-toolbar');

    b.moveToObject('#ic-visual-toolbar', 3, 3);
    b.buttonDown(0);
    b.moveToObject('#ic-visual-toolbar', -147, 3);
    b.buttonUp(0);

    let newPos = b.getLocation('#ic-visual-toolbar');
    expect(pos.x).to.not.equal(newPos.x);
  });

  describe('modifications are disabled', () => {
    afterEach(() => {
      b.click('#ic-toast span');
      b.waitForVisible('#ic-toast span', 1000, true);
    });

    it('no new note', () => {
      b.moveToObject('body', 200, 500);
      b.doDoubleClick();
      b.waitForVisible('#ic-toast span');
      expect(b.getAttribute('#ic-toast span', 'class')).to.equal('warning');
      expect('#ic-toast span').to.have.text(new RegExp(PROMPTS.VISUAL_MODE_NO_CREATE, 'i'));
    });

    it('exiting after double click does not open note form', () => {
      b.click('#ic-bulk-cancel');
      b.pause(500);
      expect('#ic-note-form').to.not.be.visible();
      switchMode('#ic-bulk');
    });

    it('editing disabled', () => {
      b.moveToObject('#note0', 10, 10);
      b.doDoubleClick();
      b.waitForVisible('#ic-toast span');
      expect(b.getAttribute('#ic-toast span', 'class')).to.equal('warning');
      expect('#ic-toast span').to.have.text(new RegExp(PROMPTS.VISUAL_MODE_NO_CHANGE, 'i'));
    });
  });

  describe('renders correctly', () => {
    let borderCss;

    beforeAll(() => {
      switchMode('#ic-standard');
      switchMode('#ic-bulk');
      b.waitForVisible('#ic-visual-toolbar');
    });

    it('bold button', () => {
      b.click('button.bold');
      borderCss = b.getCssProperty('button.bold', 'border').value;
      expect(borderCss).to.equal('2px solid rgb(255, 255, 255)');
      b.click('button.bold');
    });

    it('italic button', () => {
      b.click('button.italic');
      borderCss = b.getCssProperty('button.italic', 'border').value;
      expect(borderCss).to.equal('2px solid rgb(255, 255, 255)');
      b.click('button.italic');
    });

    it('underline button', () => {
      b.click('button.underline');
      borderCss = b.getCssProperty('button.underline', 'border').value;
      expect(borderCss).to.equal('2px solid rgb(255, 255, 255)');
      b.click('button.underline');
    });

    it('color button', () => {
      b.click('button#CCFFCC');
      borderCss = b.getCssProperty('button#CCFFCC', 'border').value;
      expect(borderCss).to.equal('2px solid rgb(255, 69, 0)');
      b.click('button#CCFFCC');
    });

    it('bulk deleting exits visual mode', () => {
      b.click('button#ic-bulk-delete');
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(new RegExp(MODALS.BULK_DELETE_NOTES.text, 'i'));
      b.click('#ic-modal-confirm');
      expect('#ic-visual-toolbar').to.not.be.visible();
    });

    it('clicking cancel exits visual mode', () => {
      switchMode('#ic-bulk');
      b.click('#ic-bulk-cancel');
      expect('#ic-visual-toolbar').to.not.be.visible();
    });
  });

  describe('bulk editing', () => {
    beforeEach(() => {
      switchMode('#ic-standard');
      switchMode('#ic-bulk');
      b.waitForVisible('#ic-visual-toolbar');
    });

    it('font styling', () => {
      b.click('#note0');
      expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(40,138,255)');

      b.click('button.bold');
      b.click('button.italic');
      b.click('button.underline');
      b.pause(200);

      expect(b.getAttribute('#note0 div.contents p', 'class')[0]).to.include('bold')
        .and.to.include('italic')
        .and.to.include('underline');
      expect(b.getAttribute('#note1 div.contents p', 'class')[0]).to.not.include('bold')
        .and.to.not.include('italic')
        .and.to.not.include('underline');

      b.click('#note1');
      b.pause(200);
      expect(b.getAttribute('#note1 div.contents p', 'class')[0]).to.include('bold')
        .and.to.include('italic')
        .and.to.include('underline');

      b.click('#note1');
      b.pause(200);
      expect(b.getAttribute('#note1 div.contents p', 'class')[0]).to.not.include('bold')
        .and.to.not.include('italic')
        .and.to.not.include('underline');

      b.click('#note0');
      b.click('button.bold');
      b.click('button.italic');
      b.click('button.underline');
    });

    it('sticky note coloring', () => {
      const background = b.getCssProperty('#note0 div.contents', 'background-color').value;

      b.click('#note0');
      b.click('#note1');
      b.pause(200);

      b.click(`button${STICKY_COLORS[2]}`); // button#CCFFCC
      b.pause(200);
      expect(b.getCssProperty('#note0 div.contents', 'background-color').value).to.equal('rgba(255,204,255,1)');
      expect(b.getCssProperty('#note1 div.contents', 'background-color').value).to.equal('rgba(255,204,255,1)');

      b.click(`button${STICKY_COLORS[4]}`);
      b.pause(500);
      expect(b.getCssProperty('#note0 div.contents', 'background-color').value).to.equal('rgba(204,255,255,1)');
      expect(b.getCssProperty('#note1 div.contents', 'background-color').value).to.equal('rgba(204,255,255,1)');

      b.click(`button${STICKY_COLORS[4]}`);
      b.pause(500);
      expect(b.getCssProperty('#note0 div.contents', 'background-color').value).to.equal(background);
      expect(b.getCssProperty('#note1 div.contents', 'background-color').value).to.equal(background);

      b.click('#note0');
      b.click('#note1');
    });
  });

  describe('submitting', () => {
    beforeEach(() => {
      switchMode('#ic-standard');
      switchMode('#ic-bulk');
      b.waitForVisible('#ic-visual-toolbar');
    });

    it('setup', () => {
      b.click('#note0');
      b.click('#note1');
      b.pause(200);
      b.click('button.bold');
      b.click('button.italic');
      b.click('button#CCFFCC');
      b.click('#ic-bulk-submit');
      b.pause(500);

      expect(b.getAttribute('#note0 div.contents p', 'class')[0]).to.include('bold').and.include('italic');
      expect(b.getAttribute('#note1 div.contents p', 'class')[0]).to.include('bold').and.include('italic');
      expect(b.getCssProperty('#note0 div.contents', 'background-color').value).to.equal('rgba(204,255,204,1)');
      expect(b.getCssProperty('#note1 div.contents', 'background-color').value).to.equal('rgba(204,255,204,1)');
    });

    it('empty submit does nothing', () => {
      switchMode('#ic-bulk');
      b.click('#note0');
      b.click('#note1');
      b.click('#ic-bulk-submit');
      b.pause(1000);
      expect(b.getAttribute('#note0 div.contents p', 'class')[0]).to.include('bold').and.include('italic');
      expect(b.getAttribute('#note1 div.contents p', 'class')[0]).to.include('bold').and.include('italic');
      expect(b.getCssProperty('#note0 div.contents', 'background-color').value).to.equal('rgba(204,255,204,1)');
      expect(b.getCssProperty('#note1 div.contents', 'background-color').value).to.equal('rgba(204,255,204,1)');
    });
  });

  describe('drag', () => {
    beforeEach(() => {
      switchMode('#ic-bulk');
    });

    afterEach(() => {
      switchMode('#ic-standard');
    });

    it('can drag one note', () => {
      b.click('#note0');
      const oldPos = b.getLocation('#note0');
      b.moveToObject('#note0', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note0', 60, 60);
      b.buttonUp(0);

      const newPos = b.getLocation('#note0');
      expect(newPos.x - oldPos.x).to.equal(50);
      expect(newPos.y - oldPos.y).to.equal(50);
      expectHighlighted('#note0');
    });

    it('dragging on an unhighlighted note does not perform drag', () => {
      b.click('#note0');
      const oldPos = b.getLocation('#note0');

      b.moveToObject('#note1', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note1', 40, 40);
      b.buttonUp(0);

      const newPos = b.getLocation('#note0');
      expect(newPos.x).to.equal(oldPos.x);
      expect(newPos.y).to.equal(oldPos.y);
    });

    it('can drag more than one note', () => {
      b.click('#note0');
      b.click('#note1');
      b.click('#note1');

      const oldPos0 = b.getLocation('#note0');
      const oldPos1 = b.getLocation('#note1');

      b.moveToObject('#note0', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note0', 40, 40);
      b.buttonUp(0);

      const newPos0 = b.getLocation('#note0');
      const newPos1 = b.getLocation('#note1');

      expect(newPos0.x - oldPos0.x).to.equal(30);
      expect(newPos0.y - oldPos0.y).to.equal(30);
      expectHighlighted('#note0');
      expect(newPos1.x - oldPos1.x).to.equal(30);
      expect(newPos1.y - oldPos1.y).to.equal(30);
      expectHighlighted('#note1');
    });

    it('note positions are reliable after drag', () => {
      expect(b.getAttribute('#note0', 'data-x')).to.equal('0');
      expect(b.getAttribute('#note0', 'data-y')).to.equal('0');
      expect(b.getAttribute('#note1', 'data-x')).to.equal('0');
      expect(b.getAttribute('#note1', 'data-y')).to.equal('0');
    });

    it('dragging after standard is stable', () => {
      switchMode('#ic-standard');
      const oldPos = b.getLocation('#note0');

      b.moveToObject('#note0', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note0', 50, 50);
      b.buttonUp(0);

      const newPos = b.getLocation('#note0');
      expect(newPos.x - oldPos.x).to.equal(40);
      expect(newPos.y - oldPos.y).to.equal(40);
    });
  });

  it('bulk delete', () => {
    switchMode('#ic-bulk');
    b.click('#note0');
    b.click('#note1');
    b.click('#note2');
    b.click('#note3');
    b.click('button#ic-bulk-delete');
    b.waitForVisible('#ic-modal');
    expect('#ic-modal-body').to.have.text(new RegExp(MODALS.BULK_DELETE_NOTES.text, 'i'));
    b.click('#ic-modal-confirm');
    b.pause(1000);

    expect('#ic-visual-toolbar').to.not.be.there();
    expect('#note0').to.not.be.there();
    expect('#note1').to.not.be.there();
    expect('#note2').to.not.be.there();
    expect('#note3').to.not.be.there();
  });
});
