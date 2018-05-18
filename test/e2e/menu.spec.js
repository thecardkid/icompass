const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const { setup, cleanup } = require('./utils');

const notesSubmenu = { submenu: 'div.ic-notes-submenu', submenuPosition: 0 };
const modesSubmenu = { submenu: 'div.ic-modes-submenu', submenuPosition: 1 };

const actions = {
  newWorkspace: 0,
  darkTheme: 1,
  email: 2,
  bookmark: 3,
  share: 4,
  logout: 8,
  deleteWorkspace: 9,
  textNote: Object.assign({}, notesSubmenu, { position: 0 }),
  imageNote: Object.assign({}, notesSubmenu, { position: 1 }),
  doodleNote: Object.assign({}, notesSubmenu, { position: 2 }),
  standardMode: Object.assign({}, modesSubmenu, { position: 0 }),
  compactMode: Object.assign({}, modesSubmenu, { position: 1 }),
  bulkMode: Object.assign({}, modesSubmenu, { position: 2 }),
  explainModes: Object.assign({}, modesSubmenu, { position: 3 }),
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

describe('workspace menu', () => {
  beforeAll(setup);

  afterAll(() => {
    b.back();
    cleanup();
  });

  describe('notes submenu', () => {
    it('new text note button', () => {
      selectSubmenuOption(actions.textNote);
      expect('#ic-note-form').to.be.visible();
      b.click('button[name="nvm"]');
    });

    it('new image note button', () => {
      selectSubmenuOption(actions.imageNote);
      expect('#ic-image-form').to.be.visible();
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

    it('bulk edit mode', () => {
      selectSubmenuOption(actions.bulkMode);
      expect('#ic-toast').to.have.text(/bulk edit/);
    });

    it('standard mode', () => {
      selectSubmenuOption(actions.standardMode);
      expect('#ic-toast').to.have.text(/standard/);
    });

    it('explain modes', () => {
      selectSubmenuOption(actions.explainModes);
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(/What are these modes/);
      b.click('#ic-modal-confirm');
    });
  });

  describe('main menu', () => {
    describe('dark theme', () => {
      it('can turn on', () => {
        b.click('.ic-workspace-button');
        b.waitForVisible('div.ic-workspace-menu');
        b.click('span.slider');
        b.pause(200);
        expect('.dark-theme').to.have.count(2);
      });

      it('saves in local storage', () => {
        b.refresh();
        b.waitForVisible('#compass');
        expect('.dark-theme').to.have.count(2);
      });

      it('can turn off', () => {
        b.click('.ic-workspace-button');
        b.waitForVisible('div.ic-workspace-menu');
        b.click('span.slider');
        b.pause(200);
        expect('.dark-theme').to.have.count(0);
      });

      it('saves in local storage again', () => {
        b.refresh();
        b.waitForVisible('#compass');
        expect('.dark-theme').to.have.count(0);
      });
    });

    describe('email reminder', () => {
      it('wrong email format displays error message', () => {
        selectMenuOption(actions.email);
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(/Receive a Link/);
        expect('#ic-modal-cancel').to.be.visible();
        expect(b.getAttribute('#ic-modal-input', 'placeholder')).to.be.empty;
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

    describe('share modal', () => {
      it('shows modal', () => {
        selectMenuOption(actions.share);
        expect('.ic-share').to.be.visible();
      });

      it('backdrop closes modal', () => {
        b.moveToObject('.ic-share', -20, -20);
        b.leftClick();
        expect('.ic-share').to.not.be.visible();
      });

      it('copy edit link', () => {
        selectMenuOption(actions.share);
        b.click('button.copy-edit');
        expect('#ic-toast').to.be.visible();
        expect('#ic-toast').to.have.text(/Edit link has been copied/);
      });

      it('copy view link', () => {
        b.click('button.copy-view');
        expect('#ic-toast').to.be.visible();
        expect('#ic-toast').to.have.text(/View-only link has been copied/);
      });

      describe('export as png', () => {
        it('has feedback when user clicks button', () => {
          expect('button[name=png]').to.be.visible();
          expect('div#exported-png').to.not.be.there();
          b.click('button[name=png]');
        });

        it('shows canvas along with instructions', () => {
          b.waitForVisible('div#exported-png');
          expect('div#exported-png canvas').to.be.visible();
          expect('div#exported-png p').to.have.text(/Right click/);
        });

        it('only one canvas is shown', () => {
          b.click('button[name=png]');
          b.pause(1500);
          expect('div#exported-png canvas').to.have.count(1);
        });
      });

      it('can x out', () => {
        b.click('button.ic-close-window');
        expect('.ic-share').to.not.be.visible();
      });
    });

    describe('bookmarking', () => {
      it('bookmark indicator invisible if workspace not bookmarked', () => {
        expect('#ic-bookmark').to.not.be.visible();
      });

      it('toast displays success status', () => {
        selectMenuOption(actions.bookmark);
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(/Bookmarks give you quick access/);
        b.setValue('#ic-modal-input', 'My bookmark');
        b.click('#ic-modal-confirm');
        b.waitForVisible('#ic-toast span');
        expect(b.getAttribute('#ic-toast span', 'class')).to.equal('success');
        expect('#ic-toast span').to.have.text(/Bookmarked/);
        b.click('#ic-toast span');
      });

      it('bookmark indicator appears', () => {
        expect('div#ic-bookmark-indicator').to.be.visible();
      });

      it('logout button', () => {
        selectMenuOption(actions.logout);
        expect(b.getUrl()).to.equal('http://localhost:8080/');
      });

      describe('bookmarks', () => {
        it('can unhide bookmarks', () => {
          b.click('#bookmark-button');
          b.pause(500);
          expect(b.getCssProperty('#ic-bookmarks', 'left').value).to.equal('0px');
          expect(b.getCssProperty('#bookmark-button', 'left').value).to.equal('200px');
        });

        it('remembers user showed bookmarks', () => {
          b.refresh();
          b.waitForVisible('#bookmark-button');
          expect(b.getCssProperty('#ic-bookmarks', 'left').value).to.equal('0px');
          expect(b.getCssProperty('#bookmark-button', 'left').value).to.equal('200px');
        });

        it('bookmark has correct info', () => {
          b.click('.ic-saved #arrow');
          b.pause(100);
          expect('.ic-saved a').to.have.text('My bookmark');
          expect('.ic-saved .ic-saved-info p').to.have.text('as "sandbox"');
        });

        describe('search', () => {
          it('shows nothing if search does not match', () => {
            expect('.ic-saved').to.have.count(1);
            b.setValue('#bookmark-search', 'does not match');
            b.pause(100);
            expect('.ic-saved').to.have.count(0);
          });

          it('shows match if search matches', () => {
            b.setValue('#bookmark-search', 'bookmark');
            b.pause(100);
            expect('.ic-saved').to.have.count(1);
            b.clearElement('#bookmark-search');
          });
        });

        it('bookmark leads to correct workspace', () => {
          b.click('.ic-saved a');
          b.waitForVisible('#compass');
          expect(b.getUrl()).to.contain('http://localhost:8080/compass/edit');
        });

        it('bookmark indicator exists if workspace has been bookmarked', () => {
          expect('div#ic-bookmark-indicator').to.be.visible();
        });

        it('bookmark prompt indicates workspace is already bookmarked', () => {
          selectMenuOption(actions.bookmark);
          b.waitForVisible('#ic-modal');
          expect('#ic-modal-body').to.have.text(/Already bookmarked/);
          b.click('#ic-modal-confirm');
          b.back();
        });

        it('can edit bookmark', () => {
          b.click('.ic-saved #arrow');
          b.pause(500);
          b.click('button.edit');
          b.waitForVisible('#ic-modal');
          expect('#ic-modal-body').to.contain.text(/Enter a new name/);
          b.setValue('#ic-modal-input', 'Changed name');
          b.click('#ic-modal-confirm');
          expect('.ic-saved a').to.have.text('Changed name');
        });

        it('can remove bookmark', () => {
          b.click('button.remove');
          b.waitForVisible('#ic-modal');
          expect('#ic-modal-body').to.have.text(/Are you sure/);
          b.click('#ic-modal-confirm');
          expect('.ic-saved').to.not.be.there();
        });

        describe('import/export bookmarks', () => {
          it('warns if exporting empty bookmarks', () => {
            b.click('button#export');
            b.pause(200);
            expect('#ic-toast').to.be.visible();
            expect('#ic-toast').to.have.text(/no bookmarks/);
          });

          it('notifies if empty file', () => {
            b.chooseFile('input[type=file]', './test/e2e/files/bookmarks/empty.json');
            b.pause(200);
            expect('#ic-toast').to.be.visible();
            expect('#ic-toast').to.have.text(/Nothing happened/);
          });

          it('errors if not json', () => {
            b.chooseFile('input[type=file]', './test/e2e/files/bookmarks/notjson.xml');
            b.pause(200);
            expect('#ic-toast').to.be.visible();
            expect('#ic-toast').to.have.text(/Invalid file type/);
          });

          it('aborts if attribute is missing', () => {
            b.chooseFile('input[type=file]', './test/e2e/files/bookmarks/missingattribute.json');
            b.pause(200);
            expect('#ic-modal').to.be.visible();
            expect('#ic-modal-body').to.have.text(/correct format/);
            b.click('#ic-modal-confirm');
          });

          it('aborts if href is invalid', () => {
            b.chooseFile('input[type=file]', './test/e2e/files/bookmarks/invalidhref.json');
            b.pause(200);
            expect('#ic-modal').to.be.visible();
            expect('#ic-modal-body').to.have.text(/correct format/);
            b.click('#ic-modal-confirm');
          });

          it('aborts if username is invalid', () => {
            b.chooseFile('input[type=file]', './test/e2e/files/bookmarks/invalidusername.json');
            b.pause(200);
            expect('#ic-modal').to.be.visible();
            expect('#ic-modal-body').to.have.text(/correct format/);
            b.click('#ic-modal-confirm');
          });

          it('succeeds and adds to existing bookmarks, without checking for duplicates', () => {
            expect('.ic-saved').to.have.count(0);
            b.chooseFile('input[type=file]', './test/e2e/files/bookmarks/valid.json');
            b.pause(200);
            expect('#ic-toast').to.be.visible();
            expect('#ic-toast').to.have.text(/Bookmarks imported/);
            expect('.ic-saved').to.have.count(1);
          });

          it('prompts for email', () => {
            expect('#ic-modal').to.be.visible();
            expect('#ic-modal').to.have.text(/Email your bookmarks/);
            b.click('#ic-modal-cancel');
          });
        });

        describe('emailing bookmarks', () => {
          it('toasts error if email invalid', () => {
            b.click('#email');
            b.waitForVisible('#ic-modal');
            b.setValue('#ic-modal-input', 'invalidemail@');
            b.click('#ic-modal-confirm');
            b.waitForVisible('#ic-toast');
            expect('#ic-toast').to.have.text(/not a valid email/);
          });

          it('toast success if email valid', () => {
            b.setValue('#ic-modal-input', 'fakeemail@test.com');
            b.click('#ic-modal-confirm');
            b.waitForVisible('#ic-toast');
            expect('#ic-toast').to.have.text(/email/);
          });
        });

        it('can hide bookmarks', () => {
          b.click('#bookmark-button');
          b.pause(500);
          expect(b.getCssProperty('#ic-bookmarks', 'left').value).to.equal('-200px');
          expect(b.getCssProperty('#bookmark-button', 'left').value).to.equal('0px');
        });

        it('remembers user hid bookmarks', () => {
          b.refresh();
          b.waitForVisible('#bookmark-button');
          expect(b.getCssProperty('#ic-bookmarks', 'left').value).to.equal('-200px');
          expect(b.getCssProperty('#bookmark-button', 'left').value).to.equal('0px');
        });
      });
    });
  });
});
