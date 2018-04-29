const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const { setup, cleanup } = require('./utils');
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

  describe('text draft', () => {
    it('create', () => {
      b.moveToObject('body', 200, 500);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');
      b.setValue('#ic-form-text', 'draft 0');
      b.click('button[name=draft]');
      b.pause(200);
      expect('.ic-sticky-note').to.have.count(3);
      expect('.draft').to.have.count(1);
      expect(b.getCssProperty('.draft div.contents', 'background-color').value).to.equal('rgba(128,128,128,1)');
    });

    it('form has correct heading', () => {
      b.moveToObject('#note0', 10, 10);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');
      expect('h1.ic-modal-title').to.have.text(/Edit this draft/);
      expect('.ic-form-palette').to.not.be.visible();
    });

    it('can edit draft', () => {
      b.setValue('#ic-form-text', 'Edited draft');
      b.click('button[name=bold]').click('button[name=underline]');
      b.click('button[name=ship]');
      b.pause(200);
      expect('#note0').to.have.text(/Edited draft/);
      expect(b.getAttribute('#note0 div.contents p', 'class')).to.contain('bold');
      expect(b.getAttribute('#note0 div.contents p', 'class')).to.contain('underline');
    });

    it('can drag draft', () => {
      const oldPos = b.getLocation('#note0');
      b.moveToObject('#note0', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note0', -40, -40);
      b.buttonUp(0);
      const newPosition = b.getLocation('#note0');

      expect(oldPos.x - newPosition.x).to.equal(50);
      expect(oldPos.y - newPosition.y).to.equal(50);
    });

    describe('can still edit non-draft', () => {
      it('form has correct title and does not have draft button', () => {
        b.moveToObject('#note1', 10, 10);
        b.doDoubleClick();
        b.waitForVisible('#ic-note-form');
        expect('h1.ic-modal-title').to.have.text(/Edit this note/);
        expect('button[name=draft]').to.not.be.visible();
      });

      it('can make edit', () => {
        b.setValue('#ic-form-text', 'Edited note');
        b.click('button[name=ship]');
        expect('#note1').to.have.text(/Edited note/);
      });

      it('can drag', () => {
        const oldPos = b.getLocation('#note1');
        b.moveToObject('#note1', 10, 10);
        b.buttonDown(0);
        b.moveToObject('#note1', 30, 30);
        b.buttonUp(0);
        const newPosition = b.getLocation('#note1');

        expect(oldPos.x - newPosition.x).to.equal(-20);
        expect(oldPos.y - newPosition.y).to.equal(-20);
      });
    });
  });

  describe('image draft', () => {
    it('image form should render correctly', () => {
      b.moveToObject('body', 400, 500);
      b.keys('Shift');
      b.doDoubleClick();
      b.keys('Shift');
      b.waitForVisible('#ic-image-form');
      b.setValue('#ic-form-text', DOG_PHOTO_LINK);
      b.click('button[name=draft]');
      b.pause(200);
      expect('.ic-sticky-note').to.have.count(4);
      expect('.draft').to.have.count(2);
      expect('.ic-img').to.have.count(1);
    });

    it('renders draft with image', () => {
      expect('#note1 div.contents img').to.be.there();
      expect('#note1 div.contents button.submit').to.be.there();
    });

    it('edit image draft', () => {
      b.moveToObject('div.ic-img', 20, 20);
      b.doDoubleClick();
      b.waitForVisible('#ic-image-form');
      expect('h1.ic-modal-title').to.have.text(/Edit photo draft/);
      expect('.ic-form-palette').to.not.be.visible();
      expect('#ic-form-text').to.have.text(DOG_PHOTO_LINK);
      expect('button[name=draft]').to.not.be.visible();
      b.click('button[name=nvm]');
    });

    it('can drag', () => {
      const oldPos = b.getLocation('#note1');
      b.moveToObject('#note1', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note1', 30, 30);
      b.buttonUp(0);
      const newPosition = b.getLocation('#note1');

      expect(oldPos.x - newPosition.x).to.equal(-20);
      expect(oldPos.y - newPosition.y).to.equal(-20);
    });
  });

  describe('doodle draft', () => {
    it('create doodle draft', () => {
      b.keys('Alt');
      b.keys('d');
      b.keys('Alt');
      b.waitForVisible('#ic-doodle-form');
      b.moveToObject('#ic-doodle', 155, 75);
      b.buttonDown(0);
      b.moveToObject('#ic-doodle', 255, 175);
      b.buttonUp(0);
      b.pause(1000);
      b.click('button[name=draft]');
      b.pause(200);
      expect('.ic-sticky-note').to.have.count(5);
      expect('.draft').to.have.count(3);
      expect('.ic-img').to.have.count(2);
      expect(b.getAttribute('#note2 div.contents img', 'src')).to.contain('data:image/png;base64');
    });

    it('cannot edit doodle', () => {
      b.moveToObject('#note2', 10, 10);
      b.doDoubleClick();
      b.waitForVisible('#ic-toast span');
      expect(b.getAttribute('#ic-toast span', 'class')).to.equal('warning');
      expect('#ic-toast span').to.have.text(/Sketches cannot be edited/);
    });

    it('can drag', () => {
      const oldPos = b.getLocation('#note2');
      b.moveToObject('#note2', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note2', 30, 30);
      b.buttonUp(0);
      const newPosition = b.getLocation('#note2');

      expect(oldPos.x - newPosition.x).to.equal(-20);
      expect(oldPos.y - newPosition.y).to.equal(-20);
    });
  });

  it('drafts are saved in local storage', () => {
    b.refresh().pause(5000);
    b.waitForVisible('.ic-sticky-note');
    expect('.ic-sticky-note').to.have.count(5);
    expect('.draft').to.have.count(3);
  });

  describe('submit drafts', () => {
    it('submit text note', () => {
      b.click('#note0 div.contents button.submit');
      b.pause(100);
      expect('.ic-sticky-note').to.have.count(5);
      expect('.draft').to.have.count(2);
      expect('.ic-img').to.have.count(2);
    });

    it('submit image note', () => {
      b.click('#note0 div.contents button.submit');
      b.pause(100);
      expect('.ic-sticky-note').to.have.count(5);
      expect('.draft').to.have.count(1);
      expect('.ic-img').to.have.count(2);
    });
  });

  describe('others', () => {
    it('compact mode does not discard drafts', () => {
      b.keys(['Shift', '2', 'Shift']);
      expect('.compact').to.have.count(5);
    });

    describe('bulk edit mode', () => {
      it('does not discard drafts', () => {
        b.keys(['Shift', '3', 'Shift']);
        expect('.ic-sticky-note').to.have.count(5);
      });

      it('cannot select draft in bulk mode', () => {
        b.click('#ic-toast');
        b.moveToObject('#note4', 50, 50); // drafts come last in bulk mode
        b.leftClick();
        b.waitForVisible('#ic-toast');
        expect('#ic-toast').to.have.text(/Cannot select drafts/);
        b.click('#ic-toast');
      });

      it('cannot submit drafts in bulk mode', () => {
        b.click('#note4 div.contents button.submit');
        b.waitForVisible('#ic-toast');
        expect('#ic-toast').to.have.text(/Cannot select drafts/);
      });
    });

    it('has correct prompt when deleting draft', () => {
      b.keys(['Shift', '1', 'Shift']); // enter standard mode
      b.moveToObject('#note0', 164, 2); // delete the doodle
      b.leftClick();
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(/Discard this draft/);
    });

    it('can discard draft', () => {
      b.click('#ic-modal-confirm');
      b.pause(200);
      expect('.ic-sticky-note').to.have.count(4);
      expect('.draft').to.have.count(0);
    });
  });
});
