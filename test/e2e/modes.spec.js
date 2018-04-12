const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

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

  afterAll(() => require('./utils').cleanup);

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
      b.click('div[name=find]');
      b.setValue('#compass-code', viewCode);
      b.setValue('#username', 'sandbox');
      b.click('input[type=submit]');
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
    it('valid username', () => {
      b.url(`${editURL}/sandbox`);
      b.waitForVisible('#compass');

      expect('#center').to.be.visible();
      expect('#vline').to.be.visible();
      expect('#hline').to.be.visible();
      expect('#ic-show-chat').to.be.visible();
      expect('#ic-show-sidebar').to.be.visible();
      expect('#ic-modes').to.be.visible();
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
        b.pause(200);

        expect('#ic-modal-body').to.have.text(/not valid/);
      });

      it('missing username', () => {
        b.click('#ic-modal-confirm');
        b.pause(200);

        expect('#ic-modal-body').to.have.text(/not valid/);
      });

      it('valid username', () => {
        b.setValue('#ic-modal-input', 'sandbox');
        b.click('#ic-modal-confirm');
        b.waitForVisible('#compass');
        expect('#vline').to.be.visible();
        expect('#hline').to.be.visible();
        expect('#ic-show-chat').to.be.visible();
        expect('#ic-show-sidebar').to.be.visible();
        expect('#ic-modes').to.be.visible();
      });
    });
  });
});
