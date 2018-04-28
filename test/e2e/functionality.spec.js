const { setup, cleanup, switchMode } = require('./utils');

const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const MODALS = require('../../lib/constants.js').MODALS;

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

module.exports = { expectCompassStructure };

describe('basic functionality', () => {
  beforeAll(setup);

  afterAll(cleanup);

  it('elements are there', () => {
    expect('#vline').to.be.visible();
    expect('#hline').to.be.visible();
    expect('.ic-workspace-button').to.be.visible();
    expect('.ic-help-button').to.be.visible();
    expect('#center').to.have.text('topic');
    expectCompassStructure();
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

    it('drag', () => {
      const oldPos = b.getLocation('#note0');
      b.moveToObject('#note0', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note0', -290, -290);
      b.buttonUp(0);
      const newPosition = b.getLocation('#note0');

      expect(oldPos.x - newPosition.x).to.equal(300);
      expect(oldPos.y - newPosition.y).to.equal(300);
    });

    it('compact mode', () => {
      expect('div.compact').to.have.count(0);
      switchMode('#ic-compact');
      b.pause(300);
      expect('div.compact').to.have.count(1);
      switchMode('#ic-standard');
    });

    describe('delete', () => {
      it('rejecting alert preserves note', () => {
        b.moveToObject('#note0', 74, 2);
        b.leftClick();
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(new RegExp(MODALS.DELETE_NOTE.text, 'i'));
        b.click('#ic-modal-cancel');
        expect('div.ic-sticky-note').to.have.count(1);
      });

      it('accepting alert deletes note', () => {
        b.moveToObject('#note0', 74, 2);
        b.leftClick();
        b.waitForVisible('#ic-modal');
        b.click('#ic-modal-confirm');
        b.pause(500);
        expect('div.ic-sticky-note').to.have.count(0);
      });
    });
  });
});
