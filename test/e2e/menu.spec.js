const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const { setup, cleanup } = require('./utils');
const PROMPTS = require('../../lib/constants').PROMPTS;
const MODALS = require('../../lib/constants').MODALS;

const shareSubmenu = { submenu: 'div.ic-share-submenu', submenuPosition: 0 };
const notesSubmenu = { submenu: 'div.ic-notes-submenu', submenuPosition: 1 };
const modesSubmenu = { submenu: 'div.ic-modes-submenu', submenuPosition: 2 };

const actions = {
  newWorkspace: 0,
  email: 1,
  bookmark: 2,
  logout: 7,
  deleteWorkspace: 8,
  editLink: Object.assign({}, shareSubmenu, { position: 0 }),
  viewLink: Object.assign({}, shareSubmenu, { position: 1 }),
  pdf: Object.assign({}, shareSubmenu, { position: 2 }),
  twitter: Object.assign({},  shareSubmenu,{  position: 3 }),
  textNote: Object.assign({}, notesSubmenu, { position: 0 }),
  doodleNote: Object.assign({}, notesSubmenu, { position: 1 }),
  standardMode: Object.assign({}, modesSubmenu, { position: 0 }),
  compactMode: Object.assign({}, modesSubmenu, { position: 1 }),
  draftMode: Object.assign({}, modesSubmenu, { position: 2 }),
  bulkMode: Object.assign({}, modesSubmenu, { position: 3 }),
};

const selectMenuOption = (count) => {
  b.click('button.ic-workspace-button');
  b.waitForVisible('div.ic-workspace-menu');
  b.elements('div.ic-menu-item').value[count].click();
};

const selectSubmenuOption = ({ submenu, submenuPosition, position }) => {
  b.click('button.ic-workspace-button');
  b.waitForVisible('div.ic-workspace-menu');
  browser.moveTo(browser.elements('div.has-more').value[submenuPosition].ELEMENT, 10, 10);
  browser.waitForVisible(submenu);
  b.elements(`${submenu} div.ic-menu-item`).value[position].click();
};

describe('sidebar', () => {
  beforeAll(setup);

  afterAll(() => {
    b.back();
    cleanup();
  });

  describe('share submenu', () => {
    it('share edit link', () => {
      selectSubmenuOption(actions.editLink);
      b.saveScreenshot('sel.png');
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(/Share this link below/);
      expect('#ic-modal-body p').to.have.text(/\/compass\/edit/);
      b.click('#ic-modal-confirm');
    });

    it('share view mode', () => {
      selectSubmenuOption(actions.viewLink);
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(/Share this link below/);
      expect('#ic-modal-body p').to.have.text(/\/compass\/view/);
      b.click('#ic-modal-confirm');
    });

    it('export button', () => {
      selectSubmenuOption(actions.pdf);
      b.waitForVisible('#ic-modal');
      expect(b.getText('#ic-modal-body')).to.contain('I see you want to save this compass as a PDF');
      b.click('#ic-modal-cancel');
    });

    // it('tweet button is there', () => {
    //   expect('button[name=tweet]').to.be.visible();
    // });
  });

  describe('notes submenu', () => {
    it('new note button', () => {
      selectSubmenuOption(actions.textNote);
      expect('#ic-note-form').to.be.visible();
      b.click('button[name="nvm"]');
    });

    it('new doodle button', () => {
      selectSubmenuOption(actions.doodleNote);
      expect('#ic-doodle-form').to.be.visible();
      b.click('button[name="nvm"]');
    });
  });

  describe('modes submenu', () => {
    it('compact mode', () => {
      selectSubmenuOption(actions.compactMode);
      expect('#ic-toast').to.have.text(/compact/);
    });

    it('draft mode', () => {
      selectSubmenuOption(actions.draftMode);
      expect('#ic-toast').to.have.text(/draft/);
    });

    it('bulk edit mode', () => {
      selectSubmenuOption(actions.bulkMode);
      expect('#ic-toast').to.have.text(/bulk edit/);
    });

    it('standard mode', () => {
      selectSubmenuOption(actions.standardMode);
      expect('#ic-toast').to.have.text(/standard/);
    });
  });

  describe('main menu', () => {
    describe('email reminder', () => {
      it('wrong email format displays error message', () => {
        selectMenuOption(actions.email);
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(/Email reminder/);
        b.setValue('#ic-modal-input', 'fakeemail');
        b.click('#ic-modal-confirm');
        b.waitForVisible('#ic-toast');
        expect('#ic-toast').to.have.text(/not a valid email/);
      });

      it('valid email shows toast', () => {
        b.setValue('#ic-modal-input', 'fakeemail@valid.com');
        b.click('#ic-modal-confirm');
        b.waitForVisible('#ic-toast span');
        expect('#ic-toast span').to.have.text(/email/);
      });
    });

    describe('bookmarking', () => {
      it('toast displays success status', () => {
        selectMenuOption(actions.bookmark);
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(/Bookmarks give you quick access/);
        b.setValue('#ic-modal-input', 'My bookmark');
        b.click('#ic-modal-confirm');
        b.waitForVisible('#ic-toast span');
        expect(b.getAttribute('#ic-toast span', 'class')).to.equal('success');
        expect('#ic-toast span').to.have.text(new RegExp(PROMPTS.SAVE_SUCCESS, 'i'));
        b.click('#ic-toast span');
      });

      it('logout button, as well as bookmark has correct info', () => {
        selectMenuOption(actions.logout);
        b.waitForVisible('div.ic-saved');
        expect(b.getUrl()).to.equal('http://localhost:8080/');
        b.click('div.ic-saved a');
        b.waitForVisible('#compass');
        expect(b.getUrl()).to.contain('http://localhost:8080/compass/edit');
        b.back();
        b.waitForVisible('#ic-landing');
        b.click('div.ic-saved #arrow');
        b.pause(100);
        expect('div.ic-saved a').to.have.text('My bookmark');
        expect('div.ic-saved div.ic-saved-info p').to.have.text('as "sandbox"');
      });

      it('can edit bookmark', () => {
        b.click('button.edit');
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.contain.text(new RegExp(MODALS.EDIT_BOOKMARK, 'i'));
        b.setValue('#ic-modal-input', 'Changed name');
        b.click('#ic-modal-confirm');
        expect('div.ic-saved a').to.have.text('Changed name');
      });

      it('can remove bookmark', () => {
        b.click('button.remove');
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(new RegExp(MODALS.DELETE_BOOKMARK.text, 'i'));
        b.click('#ic-modal-confirm');
        expect('div.ic-saved').to.not.be.there();
      });
    });
  });

  /*
  it('user section', () => {
    expect('div.ic-sidebar-list[name=users]').to.be.visible();
    expect('div.ic-sidebar-list[name=users] p').to.have.text(/You/);
  });

  describe('other actions section', () => {
    it('privacy statement', () => {
      expect('button[name=privacy]').to.be.visible();
      b.click('button[name=privacy]');
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(/Privacy Statement/);
      b.click('#ic-modal-confirm');
    });

    it('feedback form', () => {
      expect('button[name=sucks]').to.be.visible();
      b.click('button[name=sucks]');
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(/We'd love to hear from you/);
      b.click('#ic-modal-confirm');
    });

    it('tutorial button has link', () => {
      expect('button[name=tutorial] a').to.be.there();
    });


  });
  */
});
