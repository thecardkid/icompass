const {
  expectCompassStructure,
  getElemWithDataCy,
  setup,
  selectMenuOption,
  selectSubmenuOption,
} = require('./utils');
const { modal, workspaceMenu } = require('./data_cy');

describe('workspace menu', () => {
  before(() => {
    cy.clearLocalStorage();
    setup();
  });

  describe('dismissability', () => {
    const menuButton = 'button.ic-workspace-button';
    const menu = '.ic-workspace-menu';

    it('dismisses if burger icon clicked', () => {
      cy.get(menuButton).click();
      cy.get(menu).should('be.visible');
      cy.get(menuButton).click();
      cy.get(menu).should('not.exist');
    });

    it('dismisses if clicked elsewhere on page', () => {
      cy.get(menuButton).click();
      cy.get(menu).should('be.visible');
      cy.get('#observations').click('right');
      cy.get(menu).should('not.exist');
    });

    it('dismisses if help menu clicked', () => {
      cy.get(menuButton).click();
      cy.get(menu).should('be.visible');
      cy.get('button.ic-help-button').click();
      cy.get(menu).should('not.exist');
    });

    it('does not dismiss if clicked on one of the expandable items', () => {
      cy.get(menuButton).click();
      cy.get(menu).should('be.visible');
      getElemWithDataCy(workspaceMenu.exportAs).click();
      cy.get(menu).should('be.visible');
      // Dismiss.
      cy.get(menuButton).click();
    });
  });

  describe('notes submenu', () => {
    it('new text note button', () => {
      selectSubmenuOption({
        submenu: workspaceMenu.notes,
        suboption: workspaceMenu.notesSubactions.text,
      });
      cy.get('#ic-note-form').should('be.visible');
      cy.get('button[name="nvm"]').click();
    });

    it('new image note button', () => {
      selectSubmenuOption({
        submenu: workspaceMenu.notes,
        suboption: workspaceMenu.notesSubactions.image,
      });
      cy.get('#ic-image-form').should('be.visible');
      cy.get('button[name="nvm"]').click();
    });

    it('new doodle button', () => {
      selectSubmenuOption({
        submenu: workspaceMenu.notes,
        suboption: workspaceMenu.notesSubactions.doodle,
      });
      cy.get('#ic-doodle-form').should('be.visible');
      cy.get('button[name="nvm"]').click();
    });
  });

  describe('modes submenu', () => {
    // it('compact mode', () => {
    //   selectSubmenuOption({
    //     submenu: workspaceMenu.modes,
    //     suboption: workspaceMenu.modesSubactions.compact,
    //   });
    //   cy.get('.ic-toast-message').should('contain', 'compact');
    // });

    it('multi-edit mode', () => {
      selectMenuOption(workspaceMenu.modesSubactions.bulk);
      cy.get('.bulk-edit-btn.cancel').click();
    });

    // it('standard mode', () => {
    //   selectSubmenuOption({
    //     submenu: workspaceMenu.modes,
    //     suboption: workspaceMenu.modesSubactions.standard,
    //   });
    //   cy.get('.ic-toast-message').should('contain', 'standard');
    // });
    //
    // it('explain modes', () => {
    //   selectSubmenuOption({
    //     submenu: workspaceMenu.modes,
    //     suboption: workspaceMenu.modesSubactions.explain,
    //   });
    //   getElemWithDataCy(modal.heading).should('contain', 'What are these modes');
    //   getElemWithDataCy(modal.closeButton).click();
    // });
  });

  describe('exports submenu', () => {
    it('as google doc', () => {
      selectSubmenuOption({
        submenu: workspaceMenu.exportAs,
        suboption: workspaceMenu.exportAsSubactions.googleDocs,
      });
      cy.get('div.ic-gdoc.ic-dynamic-modal').should('be.visible');
      cy.get('div.ic-modal-warning').should('contain', 'Doodles will not be included');
      getElemWithDataCy(modal.closeButton).click();
    });

    it('as screenshot', () => {
      selectSubmenuOption({
        submenu: workspaceMenu.exportAs,
        suboption: workspaceMenu.exportAsSubactions.screenshot,
      });
      cy.get('div#exported-png p').should('contain', 'Right click');
      getElemWithDataCy(modal.closeButton).click();
    });
  });

  describe('move center submenu', () => {
    let defaultCenterX, defaultCenterY;

    before(() => {
      cy.get('#center').then($el => {
        const pos = $el.position();
        defaultCenterX = pos.left;
        defaultCenterY = pos.top;
      });
    });

    describe('custom position', () => {
      beforeEach(() => {
        selectSubmenuOption({
          submenu: workspaceMenu.moveCenter,
          suboption: workspaceMenu.moveCenterSubactions.customPosition,
        });
        cy.get('#center-drag-modal').should('be.visible');
        cy.get('#center').trigger('mousedown', { button: 0, force: true });
        cy.get('#compass').click(50, 50, { force: true });
      });

      it('cancel will reset', () => {
        // TODO make selector stricter
        cy.get('button.cancel').click();
        cy.get('#center').then($el => {
          const pos = $el.position();
          expect(pos.left).to.equal(defaultCenterX);
          expect(pos.top).to.equal(defaultCenterY);
        });
      });

      it('accept will save', () => {
        // TODO make selector stricter
        cy.get('button.accept').click();
        cy.reload();
        cy.wait(1000);
        cy.get('#center').then($el => {
          const pos = $el.position();
          expect(pos.left).to.be.lessThan(defaultCenterX);
          expect(pos.top).to.be.lessThan(defaultCenterY);
        });
      });
    });

    describe('reset to center', () => {
      it('resets', () => {
        selectSubmenuOption({
          submenu: workspaceMenu.moveCenter,
          suboption: workspaceMenu.moveCenterSubactions.reset,
        });
        cy.get('#center').then($el => {
          const pos = $el.position();
          expect(pos.left).to.equal(defaultCenterX);
          expect(pos.top).to.equal(defaultCenterY);
        });
        // Hide the menu to reset the state for the next test
        cy.get('.ic-workspace-button').click();
      });
    });
  });

  describe('main menu', () => {
    describe('copy workspace', () => {
      it('modal looks right', () => {
        selectMenuOption(workspaceMenu.copyWorkspace);
        getElemWithDataCy(modal.closeButton).click();
      });
    });

    describe('dark mode', () => {
      const expectDarkTheme = function(val) {
        cy.should(() => {
          const prefs = JSON.parse(localStorage.getItem('prefs'));
          expect(prefs).to.have.keys('darkTheme');
          expect(prefs['darkTheme']).to.equal(val);
        });
      };

      it('can turn on', () => {
        cy.get('.ic-workspace-button').click();
        cy.get('span.slider').click();
        cy.get('.dark-theme').should('have.length', 2);
        expectDarkTheme(true);
      });

      it('can turn off', () => {
        cy.get('span.slider').click();
        cy.get('.dark-theme').should('not.exist');
        expectDarkTheme(false);
        // Hide workspace menu as "cleanup"
        cy.get('.ic-workspace-button').click();
      });
    });

    describe('email reminder', () => {
      const checkbox = '#ic-always-email-value';
      const input = '#ic-modal-input';

      const validEmail = 'foo@bar.com';

      const createWorkspace = () => {
        cy.visit('/');
        cy.get('#compass-center').type('testing');
        cy.get('#username').type('sandbox');
        cy.get('button[type=submit]').click();
      };

      // state is in LocalStorage, so we need it to persist between tests.
      beforeEach(cy.restoreLocalStorage);
      afterEach(cy.saveLocalStorage);

      it('cannot proceed without valid email', () => {
        selectMenuOption(workspaceMenu.email);
        cy.get(checkbox).should('not.be.checked');
        cy.get(checkbox).check();

        // No input.
        getElemWithDataCy(modal.confirmButton).click();
        getElemWithDataCy(modal.confirmButton).should('be.visible');

        // Bad input.
        cy.get(input).type('foo@.com');
        getElemWithDataCy(modal.confirmButton).click();
        getElemWithDataCy(modal.confirmButton).should('be.visible');
        cy.get('.ic-toast-error').should('be.visible');

        // Valid input.
        cy.get(input).clear().type(validEmail);
        getElemWithDataCy(modal.confirmButton).click();
        cy.get('.ic-toast-success').should('be.visible');
      });

      it('creating a new workspace will trigger email send', () => {
        cy.url().then($url => {
          createWorkspace();
          cy.get('.ic-toast-message').should('contain', 'automatically');
          getElemWithDataCy(modal.whatsThis).click();
          getElemWithDataCy(modal.heading).should('contain', 'Automatic reminder emails');
          getElemWithDataCy(modal.closeButton).click();
          // Should now show the prompt.
          getElemWithDataCy(modal.heading).should('contain', '1.');
          cy.visit($url);
        });
      });

      it('can unsubscribe by unchecking the box', () => {
        cy.url().then($url => {
          selectMenuOption(workspaceMenu.email);
          cy.get(checkbox).should('be.checked');
          cy.get('.ic-modal-warning').should('contain', validEmail);

          // Unchecking should forget immediately.
          cy.get(checkbox).uncheck();
          cy.get('.ic-modal-warning').should('not.exist');
          createWorkspace();
          cy.get('.ic-toast-success').should('not.be.visible');

          cy.visit($url);
        });
      });

      it('can unsubscribe by /disable-auto-email', () => {
        cy.url().then($url => {
          // First, enable the auto-email. Repeated from above.
          selectMenuOption(workspaceMenu.email);
          cy.get(checkbox).check();
          cy.get(input).clear().type(validEmail);
          getElemWithDataCy(modal.confirmButton).click();
          createWorkspace();
          cy.get('.ic-toast-message').should('contain', 'automatically');

          cy.visit('/disable-auto-email');
          createWorkspace();
          cy.get('.ic-toast-message').should('not.be.visible');

          cy.visit($url);
        });
      });
    });

    describe('share modal', () => {
      it('shows modal', () => {
        selectMenuOption(workspaceMenu.share);
        cy.get('.ic-share').should('be.visible');
      });

      it('copy edit link', () => {
        cy.get('button.copy-edit').click();
        cy.get('.ic-toast-message').should('contain', 'Edit link has been copied');
      });

      it('copy view link', () => {
        cy.get('button.copy-view').click();
        cy.get('.ic-toast-message').should('contain', 'View-only link has been copied');
      });

      it('can x out', () => {
        getElemWithDataCy(modal.closeButton).click();
        cy.get('.ic-share').should('not.exist');
      });
    });

    describe('bookmarking', () => {
      it('bookmark indicator invisible if workspace not bookmarked', () => {
        cy.get('#ic-bookmark').should('not.exist');
      });

      it('toast displays success status', () => {
        selectMenuOption(workspaceMenu.bookmark);
        cy.get('#ic-modal-input').type('My bookmark');
        getElemWithDataCy(modal.confirmButton).click();
        cy.get('.ic-toast-success').should('be.visible');
      });

      it('bookmark indicator appears', () => {
        cy.get('div#ic-bookmark-indicator').should('be.visible');
      });

      // describe('bookmarks', () => {
      //   it('can unhide bookmarks', () => {
      //     cy.get('#bookmark-button').click();
      //     b.pause(500);
      //     expect(b.getCssProperty('#ic-bookmarks', 'left').value).to.equal('0px');
      //     expect(b.getCssProperty('#bookmark-button', 'left').value).to.equal('200px');
      //   });
      //
      //   it('remembers user showed bookmarks', () => {
      //     b.refresh();
      //     b.waitForVisible('#bookmark-button');
      //     expect(b.getCssProperty('#ic-bookmarks', 'left').value).to.equal('0px');
      //     expect(b.getCssProperty('#bookmark-button', 'left').value).to.equal('200px');
      //   });
      //
      //   it('bookmark has correct info', () => {
      //     cy.get('.ic-saved #arrow').click();
      //     b.pause(100);
      //     cy.get('.ic-saved a').should('contain', 'My bookmark');
      //     cy.get('.ic-saved .ic-saved-info p').should('contain', 'as "sandbox"');
      //   });
      //
      //   describe('search', () => {
      //     it('shows nothing if search does not match', () => {
      //       expect('.ic-saved').to.have.count(1);
      //       cy.get('#bookmark-search').type('does not match');
      //       b.pause(100);
      //       expect('.ic-saved').to.have.count(0);
      //     });
      //
      //     it('shows match if search matches', () => {
      //       cy.get('#bookmark-search').type('bookmark');
      //       b.pause(100);
      //       expect('.ic-saved').to.have.count(1);
      //       b.clearElement('#bookmark-search');
      //     });
      //   });
      //
      //   it('bookmark leads to correct workspace', () => {
      //     cy.get('.ic-saved a').click();
      //     b.waitForVisible('#compass');
      //     expect(b.getUrl()).to.contain('http://localhost:8080/compass/edit');
      //   });
      //
      //   it('bookmark indicator exists if workspace has been bookmarked', () => {
      //     cy.get('div#ic-bookmark-indicator').should('be.visible');
      //   });
      //
      //   it('bookmark prompt indicates workspace is already bookmarked', () => {
      //     selectMenuOption(menuActions.bookmark);
      //     b.waitForVisible('#ic-modal');
      //     getElemWithDataCy(modal.heading).should('contain', 'Already bookmarked');
      //     getElemWithDataCy(modal.confirmButton).click();
      //     b.back();
      //   });
      //
      //   it('can edit bookmark', () => {
      //     cy.get('.ic-saved #arrow').click();
      //     b.pause(500);
      //     cy.get('button.edit').click();
      //     b.waitForVisible('#ic-modal');
      //     getElemWithDataCy(modal.heading).should('contain', 'Enter a new name');
      //     cy.get('#ic-modal-input').type('Changed name');
      //     getElemWithDataCy(modal.confirmButton).click();
      //     cy.get('.ic-saved a').should('contain', 'Changed name');
      //   });
      //
      //   it('can remove bookmark', () => {
      //     cy.get('button.remove').click();
      //     b.waitForVisible('#ic-modal');
      //     getElemWithDataCy(modal.heading).should('contain', 'Are you sure');
      //     getElemWithDataCy(modal.confirmButton).click();
      //     expect('.ic-saved').to.not.be.there();
      //   });
      //
      //   describe('emailing bookmarks', () => {
      //     it('toasts error if email invalid', () => {
      //       cy.get('#email').click();
      //       b.waitForVisible('#ic-modal');
      //       cy.get('#ic-modal-input').type('invalidemail@');
      //       getElemWithDataCy(modal.confirmButton).click();
      //       b.waitForVisible('.ic-toast-message');
      //       cy.get('#ic-toast').should('contain', 'not a valid email');
      //     });
      //
      //     it('toast success if email valid', () => {
      //       cy.get('#ic-modal-input').type('fakeemail@test.com');
      //       getElemWithDataCy(modal.confirmButton).click();
      //       b.waitForVisible('#ic-toast');
      //       cy.get('#ic-toast').should('contain', 'link to this workspace');
      //     });
      //   });
      //
      //   it('can hide bookmarks', () => {
      //     cy.get('#bookmark-button').click();
      //     b.pause(500);
      //     expect(b.getCssProperty('#ic-bookmarks', 'left').value).to.equal('-200px');
      //     expect(b.getCssProperty('#bookmark-button', 'left').value).to.equal('0px');
      //   });
      //
      //   it('remembers user hid bookmarks', () => {
      //     b.refresh();
      //     b.waitForVisible('#bookmark-button');
      //     expect(b.getCssProperty('#ic-bookmarks', 'left').value).to.equal('-200px');
      //     expect(b.getCssProperty('#bookmark-button', 'left').value).to.equal('0px');
      //   });
      // });
    });

    describe('logout', () => {
      it('navigates to landing page', () => {
        selectMenuOption(workspaceMenu.logout);
        cy.location().should((loc) => {
          expect(loc.pathname).to.equal('/');
        });
      });

      it('workspace still exists', () => {
        cy.go('back');
        expectCompassStructure();
      });
    });

    describe('delete workspace', () => {
      it('navigates to landing page', () => {
        selectMenuOption(workspaceMenu.deleteWorkspace);
        getElemWithDataCy(modal.confirmButton).click();
        // Deleting workspace shows two modals
        getElemWithDataCy(modal.confirmButton).click();
        cy.wait(500);
        cy.location().should((loc) => {
          expect(loc.pathname).to.equal('/');
        });
      });

      it('workspace no longer exists', () => {
        cy.go('back');
        getElemWithDataCy(modal.heading).should('contain', 'not found');
      });
    });
  });
});
