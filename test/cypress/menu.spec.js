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

  describe('editables submenu', () => {
    it('edit people groups', () => {
      selectSubmenuOption({
        submenu: workspaceMenu.editables,
        suboption: workspaceMenu.editablesSubactions.peopleGroup,
      });
      getElemWithDataCy(modal.heading).should('contain', 'Who\'s involved');
      getElemWithDataCy(modal.closeButton).click();
    });

    it('edit topic', () => {
      selectSubmenuOption({
        submenu: workspaceMenu.editables,
        suboption: workspaceMenu.editablesSubactions.topic,
      });
      getElemWithDataCy(modal.heading).should('contain', 'Edit workspace topic');
      getElemWithDataCy(modal.closeButton).click();
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
    it('multi-edit mode', () => {
      selectMenuOption(workspaceMenu.modesSubactions.bulk);
      cy.get('.toolbar-close').click();
    });
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
        cy.get('.drag-modal-close').click();
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

    describe.skip('email reminder', () => {
      // Tested in local_storage.spec.js.
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
