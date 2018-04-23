const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const { setup, cleanup } = require('./utils');
const imageUrl = 'https://www.cesarsway.com/sites/newcesarsway/files/styles/large_article_preview/public/Common-dog-behaviors-explained.jpg?itok=FSzwbBoi';

describe('forms', () => {
  beforeAll(setup);

  afterAll(cleanup);

  describe('text', () => {
    it('create', () => {
      b.moveToObject('body', 100, 200);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');
      b.setValue('#ic-form-text', 'text note');
      b.click('button[name=ship]');
      b.pause(200);
      expect('div.ic-sticky-note').to.have.count(1);
      expect('#note0').to.have.text(/text note/);
      const { x, y } = b.getLocation('#note0');
      expect(x).to.equal(100);
      expect(y).to.equal(200);
    });

    it('edit', () => {
      b.moveToObject('#note0', 10, 1);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');
      expect('#ic-form-text').to.have.text('text note');
      b.setValue('#ic-form-text', 'edited note');
      b.click('button[name=ship]');
      b.pause(200);
      expect('#note0').to.have.text(/edited note/);
    });

    it('styling', () => {
      b.moveToObject('#note0', 10, 1);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');

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

      expect(b.getAttribute('#note0 div.contents p', 'class')[0]).to.not.contain('bold');
      expect(b.getAttribute('#note0 div.contents p', 'class')[0]).to.contain('italic');
      expect(b.getAttribute('#note0 div.contents p', 'class')[0]).to.contain('underline');
    });

    it('drag', () => {
      b.moveToObject('#note0', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note0', -40, -40);
      b.buttonUp(0);
      const { x, y } = b.getLocation('#note0');
      expect(100 - x).to.equal(50);
      expect(200 - y).to.equal(50);
    });
  });

  describe('text into image', () => {
    it('entering link in note form should ask if the link is an image', () => {
      b.moveToObject('body', 100, 300);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');
      b.setValue('#ic-form-text', imageUrl);
      b.click('button[name=ship]');
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(/Is this an image/);
    });

    it('rejecting the prompt should embed the link', () => {
      b.click('#ic-modal-cancel');
      b.pause(100);
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
      b.pause(100);
      expect('div.ic-img').to.have.count(1);
    });

    it('editing an image made from the note-form will show an image-form', () => {
      b.moveToObject('#note1', 10, 10);
      b.doDoubleClick();
      b.pause(100);
      expect('#ic-image-form').to.be.visible();
      b.click('button[name=nvm]');
    });
  });

  describe('image', () => {
    const xoffset = 100;
    const yoffset = 500;

    it('create', () => {
      b.moveToObject('body', xoffset, yoffset);
      b.keys('Shift');
      b.doDoubleClick();
      b.keys('Shift');
      b.waitForVisible('#ic-image-form');
      b.setValue('#ic-form-text', imageUrl);
      b.click('button[name=ship]');
      b.pause(200);
      expect('div.ic-sticky-note').to.have.count(3);
      const { x, y } = b.getLocation('#note2');
      expect(x).to.equal(xoffset);
      expect(y).to.equal(yoffset);
    });

    it('edit', () => {
      b.moveToObject('#note2', 10, 1);
      b.doDoubleClick();
      b.waitForVisible('#ic-image-form');
      expect('#ic-form-text').to.have.text(imageUrl);
      b.click('button[name=nvm]');
    });

    it('drag', () => {
      b.moveToObject('#note2', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note2', 40, 40);
      b.buttonUp(0);
      const { x, y } = b.getLocation('#note2');
      expect(xoffset - x).to.equal(-30);
      expect(yoffset - y).to.equal(-30);
    });
  });

  describe('doodle', () => {
    const xoffset = 300;
    const yoffset = 500;

    it('create', () => {
      b.moveToObject('body', xoffset, yoffset);
      b.keys('Alt');
      b.doDoubleClick();
      b.keys('Alt');
      b.waitForVisible('#ic-doodle-form');

      // draw doodle
      b.moveToObject('#ic-doodle', 155, 75);
      b.buttonDown(0);
      b.moveToObject('#ic-doodle', 255, 175);
      b.buttonUp(0);
      b.pause(200);

      b.click('button[name=ship]');
      b.pause(200);
      expect('div.ic-sticky-note').to.have.count(4);
      const { x, y } = b.getLocation('#note3');
      expect(x).to.equal(xoffset);
      expect(y).to.equal(yoffset);
      expect(b.getAttribute('#note3 div.ic-img img', 'src')).to.contain('data:image/png;base64');
    });

    it('edit', () => {
      b.moveToObject('#note3', 10, 1);
      b.doDoubleClick();
      b.waitForVisible('#ic-toast');
      expect('#ic-toast').to.have.text(/Doodles cannot be changed/);
      b.click('#ic-toast');
    });

    it('drag', () => {
      b.moveToObject('#note3', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note3', 10, 40);
      b.buttonUp(0);
      const { x, y } = b.getLocation('#note3');
      expect(xoffset - x).to.equal(0);
      expect(yoffset - y).to.equal(-30);
    });
  });
});
