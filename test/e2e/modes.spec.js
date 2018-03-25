const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const ERROR_MSG = require('../../lib/constants').ERROR_MSG;
const PROMPTS = require('../../lib/constants').PROMPTS;

describe('view modes', () => {
  let editURL,
    viewURL,
    editCode,
    viewCode;

  beforeAll(() => {
    require('./utils').setup();
    editCode = b.getAttribute('button[name=share-edit]', 'id');
    editURL = `http://localhost:8080/compass/edit/${editCode}`;
    expect(b.getUrl()).to.equal(editURL + '/sandbox');

    viewCode = b.getAttribute('button[name=share-view]', 'id');
    viewURL = `http://localhost:8080/compass/view/${viewCode}`;
  });

  afterAll(() => {
    require('./utils').cleanup();
  });

  describe('view-only mode', () => {
    it('from url', () => {
      b.url(viewURL);
      b.waitForVisible('#compass');

      expect('#center').to.be.visible();
      expect('#vline').to.be.visible();
      expect('#hline').to.be.visible();

      expect('#ic-modes').to.not.be.there();
      expect('#ic-sidebar').to.not.be.there();
      expect('#ic-chat').to.not.be.there();
      expect('#ic-show-chat').to.not.be.there();
      expect('#ic-show-sidebar').to.not.be.there();
    });

    it('from login page', () => {
      b.url('http://localhost:8080');
      b.waitForVisible('body');
      b.click('button[name=find]');
      b.setValue('#compass-code', viewCode);
      b.setValue('#username', 'sandbox');
      b.click('button[name=next]');
      b.waitForVisible('#ic-modal');

      expect('#ic-modal-body').to.have.text(/view-only access/);
      expect('#ic-modal-body').to.have.text(/sandbox/);

      b.click('#ic-modal-confirm');
      b.waitForVisible('#compass');

      expect('#center').to.be.visible();
      expect('#vline').to.be.visible();
      expect('#hline').to.be.visible();

      expect('#ic-modes').to.not.be.there();
      expect('#ic-sidebar').to.not.be.there();
      expect('#ic-chat').to.not.be.there();
      expect('#ic-show-chat').to.not.be.there();
      expect('#ic-show-sidebar').to.not.be.there();
    });
  });

  describe('edit mode', () => {
    it('with valid username', () => {
      b.url(`${editURL}/sandbox`);
      b.waitForVisible('#compass');

      expect('#center').to.be.visible();
      expect('#vline').to.be.visible();
      expect('#hline').to.be.visible();
      expect('#ic-sidebar').to.be.visible();
      expect('#ic-chat').to.be.visible();
      expect('#ic-show-chat').to.be.visible();
      expect('#ic-show-sidebar').to.be.visible();
      expect('#ic-modes').to.be.visible();
    });

    it('with bad code and bad username', () => {
      b.url(`http://localhost:8080/compass/edit/${editCode.substring(1, 5)}/,,,`);
      b.waitForVisible('#ic-modal');

      expect('#ic-modal-body').to.have.text(/There was a problem with your login info/);
      expect('#ic-modal-body').to.have.text(/Your code is not valid/);
      expect('#ic-modal-body').to.have.text(/Username can only contain a-zA-Z/);

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
        expect('#ic-modal-body h3').to.have.text(new RegExp(PROMPTS.PROMPT_NAME, 'i'));

        b.setValue('#ic-modal-input', 'sandbox2');
        b.click('#ic-modal-confirm');
        b.pause(100);

        expect('#ic-modal-body').to.have.text(new RegExp(ERROR_MSG.UNAME_HAS_NON_CHAR, 'i'));
      });

      it('missing username', () => {
        b.click('#ic-modal-confirm');
        b.pause(100);

        expect('#ic-modal-body').to.have.text(new RegExp(ERROR_MSG.REQUIRED('Username'), 'i'));
      });

      it('valid username', () => {
        b.setValue('#ic-modal-input', 'sandbox');
        b.click('#ic-modal-confirm');
        b.waitForVisible('#compass');
        expect('#vline').to.be.visible();
        expect('#hline').to.be.visible();
        expect('#ic-sidebar').to.be.visible();
        expect('#ic-chat').to.be.visible();
        expect('#ic-show-chat').to.be.visible();
        expect('#ic-show-sidebar').to.be.visible();
        expect('#ic-modes').to.be.visible();
      });
    });
  });
});
