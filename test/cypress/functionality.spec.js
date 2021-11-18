const {
  assertDraggable,
  clickXOnNote,
  expectCompassStructure,
  getElemWithDataCy,
  setup,
} = require('./utils');
const { modal } = require('./data_cy');

describe('basic functionality', () => {
  before(() => {
    cy.clearLocalStorage();
    setup();
  });

  describe('structure', () => {
    it('elements are there', () => {
      cy.get('#vline').should('be.visible');
      cy.get('#hline').should('be.visible');
      cy.get('.ic-workspace-button').should('be.visible');
      cy.get('.ic-help-button').should('be.visible');
      // Set it the setup() call.
      cy.get('#ic-compass-topic').should('contain', 'webdriverio');
      cy.get('#center').should('contain', 'center');
      expectCompassStructure();
    });
  });

  describe('sticky notes workflow', () => {
    it('create', () => {
      cy.get('.ic-sticky-note').should('have.length', 0);
      cy.get('#observations .interactable').dblclick('center');
      cy.get('#ic-form-text .ql-editor').type('An observation');
      cy.get('button[name=ship]').click();
      cy.get('.ic-sticky-note').should('have.length', 1);
      cy.get('.ic-sticky-note').should('contain', 'An observation');
    });

    it('edit', () => {
      cy.get('.ic-sticky-note').dblclick('center');
      cy.get('#ic-form-text .ql-editor').clear().type('A principle');
      cy.get('button[name=ship]').click();
      cy.get('.ic-sticky-note').should('contain', 'A principle');
    });

    it('drag', () => {
      assertDraggable('#note0', { deltaX: 100, deltaY: 100 });
    });

    // it('compact mode', () => {
    //   cy.get('div.compact').should('have.length', 0);
    //   selectSubmenuOption({
    //     submenu: workspaceMenu.modes,
    //     suboption: workspaceMenu.modesSubactions.compact,
    //   });
    //   cy.get('div.compact').should('have.length', 1);
    //   selectSubmenuOption({
    //     submenu: workspaceMenu.modes,
    //     suboption: workspaceMenu.modesSubactions.standard,
    //   });
    // });

    describe('delete', () => {
      it('rejecting alert preserves note', () => {
        clickXOnNote(0);
        cy.get('.ic-dynamic-modal .title').should('contain', 'Are you sure');
        getElemWithDataCy(modal.closeButton).click();
        cy.get('div.ic-sticky-note').should('have.length', 1);
      });

      it('accepting alert deletes note', () => {
        clickXOnNote(0);
        cy.get('#ic-modal-confirm').click();
        cy.get('div.ic-sticky-note').should('have.length', 0);
      });
    });
  });

  describe('changing compass center', () => {
    const showPrompt = function() {
      cy.get('#center').dblclick('center');
    };

    it('clearing value, and submitting empty string, is ignored', () => {
      showPrompt();
      cy.get('#ic-modal-input').clear();
      getElemWithDataCy(modal.confirmButton).click();
      cy.get('#center').should('contain', 'center');
      getElemWithDataCy(modal.closeButton).click();
    });

    it('can change compass center', () => {
      showPrompt();
      cy.get('#ic-modal-input').type('center2');
      cy.get('#ic-modal-confirm').click();
      cy.wait(200);
      cy.get('#center').should('contain', 'center2');
    });
  });

  describe('really long center text input', () => {
    const longName = 'really long text that is definitely over thirty-five characters';
    it('truncates topic name by default', () => {
      setup({
        topic: longName,
      });
      cy.get('#ic-compass-topic').should('be.visible');
    });

    it('expands topic on click', () => {
      cy.get('#ic-compass-topic').click();
      cy.get('#ic-compass-topic').should('contain', longName);
    });

    it('truncates topic on click', () => {
      cy.get('#ic-compass-topic').click();
      cy.get('#ic-compass-topic').should('contain', '...');
    });
  });
});
