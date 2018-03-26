const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const MODALS = require('../../lib/constants.js').MODALS;

describe('basic functionality', () => {
  beforeAll(require('./utils').setup);

  afterAll(require('./utils').cleanup);

  it('elements are there', () => {
    expect('#vline').to.be.visible();
    expect('#hline').to.be.visible();
    expect('#ic-sidebar').to.be.visible();
    expect(b.getCssProperty('#ic-chat', 'bottom').value).to.equal('-270px');
    expect('#ic-show-chat').to.be.visible();
    expect('#ic-show-sidebar').to.be.visible();
    expect('#ic-modes').to.be.visible();
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
    it('prompt', () => {
      b.keys(['p']);
      expect('#ic-about').to.be.visible();
      b.keys(['p']);
      expect('#ic-about').to.not.be.visible();
    });

    it('chat', () => {
      b.keys(['c']);
      b.pause(500);
      expect(b.getCssProperty('#ic-chat', 'bottom').value).to.equal('0px');
      b.keys(['c']);
    });

    it('sidebar', () => {
      b.keys(['s']);
      b.pause(500);
      expect(b.getCssProperty('#ic-sidebar', 'left').value).to.equal('-240px');
      b.keys(['s']);
    });

    it('new note', () => {
      b.keys(['n']);
      expect('#ic-note-form').to.be.visible();
      b.click('button[name=ship]');
      expect('#ic-note-form').to.be.visible();
      b.click('button[name=nvm]');
      expect('#ic-note-form').to.not.be.visible();
    });

    it('new doodle', () => {
      b.keys(['d']);
      expect('#ic-doodle-form').to.be.visible();
      b.click('button[name=nvm]');
      expect('#ic-doodle-form').to.not.be.visible();
    });
  });

  describe('sticky workflow', () => {
    describe('text', () => {
      it('create', () => {
        b.keys(['n']);
        expect('.ic-sticky-note').to.not.be.there();
        b.setValue('#ic-form-text', 'An observation');
        b.click('button[name=ship]');
        b.waitForVisible('.ic-sticky-note');
        expect('.ic-sticky-note').to.have.text(/An observation/);
      });

      it('edit', () => {
        b.moveToObject('.ic-sticky-note', 5, 5);
        b.doDoubleClick();
        b.waitForVisible('#ic-note-form');
        b.setValue('#ic-form-text', 'A principle');
        b.click('button[name=ship]');
        b.pause(500);
        expect('.ic-sticky-note').to.have.text(/A principle/);
      });
    });

    describe('images', () => {
      it('accepting image prompt should render image', () => {
        expect('a.ic-img').to.not.be.there();

        b.keys(['n']);
        b.setValue('#ic-form-text', 'https://s-media-cache-ak0.pinimg.com/736x/47/b9/7e/47b97e62ef6f28ea4ae2861e01def86c.jpg');
        b.click('button[name=ship]');
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(new RegExp(MODALS.IMPORT_IMAGE.text, 'i'));

        b.click('#ic-modal-confirm');
        b.pause(1000);
        expect('a.ic-img').to.be.visible();
      });

      it('rejecting the prompt should render text', () => {
        b.moveToObject('a.ic-img', 50, 50);
        b.doDoubleClick();
        b.waitForVisible('#ic-form-text');
        b.click('button[name=ship]');
        b.waitForVisible('#ic-modal');
        b.click('#ic-modal-cancel');
        b.pause(1000);
        expect('a.ic-img').to.not.be.there();
      });
    });

    it('dragging', () => {
      const oldPos = b.getLocation('#note1');
      b.moveToObject('#note1', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note1', -290, -290);
      b.buttonUp(0);
      const newPosition = b.getLocation('#note1');

      expect(oldPos.x - newPosition.x).to.equal(300);
      expect(oldPos.y - newPosition.y).to.equal(300);
    });

    describe('delete', () => {
      it('rejecting alert preserves note', () => {
        b.moveToObject('#note1', 158, 3);
        b.leftClick();
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(new RegExp(MODALS.DELETE_NOTE.text, 'i'));
        b.click('#ic-modal-cancel');
        expect('#note1').to.be.visible();
      });

      it('accepting alert deletes note', () => {
        b.moveToObject('#note1', 158, 3);
        b.leftClick();
        b.waitForVisible('#ic-modal');
        b.click('#ic-modal-confirm');
        b.pause(500);
        expect('#note1').to.not.be.there();
      });
    });

    describe('other actions', () => {
      it('doodle', () => {
        b.keys(['d']);
        b.waitForVisible('#ic-doodle-form');
        b.click('button[name=ship]');
        expect('#ic-doodle-form').to.be.visible();

        b.moveToObject('#ic-doodle', 155, 75);
        b.buttonDown(0);
        b.moveToObject('#ic-doodle', 255, 175);
        b.buttonUp(0);
        b.pause(500);
        b.click('button[name=ship]');
        b.waitForVisible('#note1');

        expect(b.getAttribute('#note1 .ic-img img', 'src')).to.contain('data:image/png;base64');
      });

      it('styling', () => {
        b.keys(['n']);
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
        b.pause(500);

        expect('#note2').to.be.visible();
        expect(b.getAttribute('#note2 a p', 'class')[0]).to.not.contain('bold');
        expect(b.getAttribute('#note2 a p', 'class')[0]).to.contain('italic');
        expect(b.getAttribute('#note2 a p', 'class')[0]).to.contain('underline');
      });

      it('double click for new note', () => {
        b.moveToObject('body', 300, 200);
        b.doDoubleClick();
        b.waitForVisible('#ic-note-form');
        b.setValue('#ic-form-text', 'Double click to create');
        b.click('button[name=ship]');
        b.waitForVisible('#note3');
        const pos = b.getLocation('#note3');
        expect(pos.x).to.equal(300);
        expect(pos.y).to.equal(200);
      });
    });
  });

  it('compact mode', () => {
    const compactCss = {
      letterSpacing: '-1px',
      overflow: 'auto',
      maxHeight: '70px',
    };

    let letterSpacing = b.getCssProperty('#note0 a', 'letter-spacing').value;
    let overflow = b.getCssProperty('#note0 a', 'overflow').value;
    let height = b.getCssProperty('#note0 a', 'max-height').value;

    expect(letterSpacing).to.not.equal(compactCss.letterSpacing);
    expect(overflow).to.not.equal(compactCss.overflow);
    expect(height).to.not.equal(compactCss.maxHeight);

    b.click('#ic-mode-compact');
    b.pause(300);

    letterSpacing = b.getCssProperty('#note0 a', 'letter-spacing').value;
    overflow = b.getCssProperty('#note0 a', 'overflow').value;
    height = b.getCssProperty('#note0 a', 'max-height').value;

    expect(letterSpacing).to.equal(compactCss.letterSpacing);
    expect(overflow).to.equal(compactCss.overflow);
    expect(height).to.equal(compactCss.maxHeight);

    b.click('#ic-mode-normal');
  });

  it('chat events', () => {
    b.keys(['c']);
    b.pause(500);
    expect(b.getCssProperty('#ic-chat', 'bottom').value).to.equal('0px');

    b.setValue('#message-text', 'Hello world!');
    b.keys('\uE007'); // ENTER key
    b.waitForVisible('.bubble');

    expect('.bubble').to.have.text(/Hello world!/);
    expect(b.getAttribute('.bubble', 'class')).to.contain('mine');
  });
});
