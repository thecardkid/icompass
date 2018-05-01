const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const { expectCompassStructure } = require('./functionality.spec');
const { setup, cleanup } = require('./utils');

const expect = chai.expect;
const b = browser;

describe('view modes', () => {
  let editURL,
    viewURL,
    editCode,
    viewCode;

  beforeAll(() => {
    setup();
    editCode = b.getUrl().substring(35, 43);
    editURL = `http://localhost:8080/compass/edit/${editCode}`;
    expect(b.getUrl()).to.equal(`${editURL}/sandbox`);

    b.click('button.ic-workspace-button');
    b.waitForVisible('div.ic-workspace-menu');
    b.elements('div.ic-menu-item').value[4].click();
    b.waitForVisible('.ic-share');
    viewCode = b.getValue('input#ic-view-link').substring(35, 43);
    viewURL = `http://localhost:8080/compass/view/${viewCode}`;
  });

  afterAll(cleanup);

  it('view-only mode from link', () => {
    b.url(viewURL);
    b.waitForVisible('#compass');
    expect('#center').to.be.visible();
    expect('#vline').to.be.visible();
    expect('#hline').to.be.visible();
    expect('.ic-workspace-button').to.not.be.there();
    expect('.ic-help-button').to.not.be.there();

    expectCompassStructure();
  });

  describe('edit mode', () => {
    it('valid username', () => {
      b.url(`${editURL}/sandbox`);
      b.waitForVisible('#compass');

      expect('#center').to.be.visible();
      expect('#vline').to.be.visible();
      expect('#hline').to.be.visible();
      expect('.ic-workspace-button').to.be.visible;
      expect('.ic-help-button').to.be.visible;
      expectCompassStructure();
    });

    it('invalid code and invalid username', () => {
      b.url('http://localhost:8080/compass/edit/12345/,,,');
      b.waitForVisible('#ic-modal');

      expect('#ic-modal-body').to.have.text(/There was a problem with your login info/);
      expect('#ic-modal-body').to.have.text(/Your code is not valid/);
      expect('#ic-modal-body').to.have.text(/Username can only contain letters/);

      b.click('#ic-modal-confirm');
      b.waitForVisible('#ic-landing');
      expect(b.getUrl()).to.equal('http://localhost:8080/');
    });

    it('with editCode for view-only mode', () => {
      b.url(`http://localhost:8080/compass/view/${editCode}/sandbox`);
      b.waitForVisible('#ic-modal');

      expect('#ic-modal-body').to.have.text(/I couldn't find your compass/);

      b.click('#ic-modal-confirm');
      b.waitForVisible('#ic-landing');

      expect(b.getUrl()).to.equal('http://localhost:8080/');
    });

    describe('username input', () => {
      beforeEach(() => {
        b.url(editURL);
        b.waitForVisible('#ic-modal');
      });

      it('bad username', () => {
        expect('#ic-modal-body').to.have.text(/Welcome/);

        b.setValue('#ic-modal-input', 'sandbox2');
        b.click('#ic-modal-confirm');
        b.waitForVisible('#ic-toast');
        expect('#ic-toast').to.have.text(/Username must be fewer/);
      });

      it('missing username', () => {
        b.click('#ic-modal-confirm');
        b.waitForVisible('#ic-toast');
        expect('#ic-toast').to.have.text(/You can't leave this empty/);
      });

      it('valid username', () => {
        b.setValue('#ic-modal-input', 'sandbox');
        b.click('#ic-modal-confirm');
        b.waitForVisible('#compass');
        expect('#center').to.be.visible();
        expect('#vline').to.be.visible();
        expect('#hline').to.be.visible();
        expect('.ic-workspace-button').to.be.visible;
        expect('.ic-help-button').to.be.visible;
      });
    });
  });
});
