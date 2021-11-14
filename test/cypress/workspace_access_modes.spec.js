const { expectCompassStructure, getElemWithDataCy, setup, selectMenuOption } = require('./utils');
const { modal, workspaceMenu } = require('./data_cy');

describe('workspace access modes', () => {
  let editURL, viewURL;

  before(() => {
    cy.clearLocalStorage();
    setup();

    cy.get('#observations .interactable').dblclick('center');
    cy.get('#ic-form-text .ql-editor').type('this is a note');
    cy.get('button[name=ship]').click();
    cy.get('div.ic-sticky-note').should('have.length', 1);

    cy.get('#experiments .interactable').dblclick('center');
    cy.get('#ic-form-text .ql-editor').type('this is a note');
    cy.get('button[name=draft]').click();
    cy.get('div.ic-sticky-note').should('have.length', 2);

    cy.url().then($url => editURL = $url);
    selectMenuOption(workspaceMenu.share);
    cy.get('input#ic-view-link').then($el => {
      const u = new URL($el.val());
      viewURL = u.pathname;
    });
  });

  describe('view-only mode', () => {
    it('invalid code', () => {
      cy.visit('/compass/view/1234abcd');
      getElemWithDataCy(modal.heading).should('contain', 'Workspace not found');
      getElemWithDataCy(modal.confirmButton).click();
      cy.url().should('eq', 'http://localhost:8080/');
    });

    it('view-only mode from link', () => {
      cy.visit(viewURL);
      cy.get('#center').should('be.visible');
      cy.get('#vline').should('be.visible');
      cy.get('#hline').should('be.visible');
      // From setup function;
      cy.get('#ic-compass-topic').should('contain', 'webdriverio');
      cy.get('.ic-workspace-button').should('not.exist');
      cy.get('.ic-help-button').should('not.exist');
      expectCompassStructure();
    });

    it('cant see drafts', () => {
      cy.get('.ic-sticky-note').should('have.length', 1);
      cy.get('.draft').should('have.length', 0);
    });

    it('cant create notes', () => {
      cy.get('#ideas .interactable').dblclick('center');
      cy.get('.ic-form').should('not.exist');
    });

    it('cant drag notes', () => {
      let originalPosition = {};
      cy.get('#note0').then($button => {
        originalPosition = $button.position();
      });
      const moveXY = { deltaX: 100, deltaY: 100 };
      cy.get('#note0').move(moveXY);
      cy.get('#note0').then($button => {
        const newPosition = $button.position();
        expect(newPosition.left).to.equal(originalPosition.left);
        expect(newPosition.top).to.equal(originalPosition.top);
      });
    });

    it('cant edit notes', () => {
      cy.get('#note0').dblclick('center');
      cy.get('.ic-form').should('not.exist');
    });

    it('cant delete notes', () => {
      cy.get('#note0 button.ic-close-window').should('not.exist');
    });

    it('cant upvote notes', () => {
      cy.get('p.ic-upvote').should('not.exist');
    });

    it('cant edit center', () => {
      cy.get('#center').dblclick();
      cy.get('#ic-modal').should('not.exist');
    });

    // TODO make this work in cypress
    it.skip('cant drag select', () => {
      cy.get('#observations')
        .trigger('mousedown', { force: true })
        .trigger('mousemove', 100, 0, { force: true });
      cy.get('div#select-area').should('not.exist');
      // cy.get('body').trigger('mouseup', { force: true });
    });

    it('cant see context menu', () => {
      cy.get('#note0').rightclick();
      cy.get('div.ic-menu.context-menu').should('not.exist');
    });
  });

  describe('edit mode', () => {
    it('valid username', () => {
      cy.visit(editURL);
      cy.get('#center').should('be.visible');
      cy.get('#vline').should('be.visible');
      cy.get('#hline').should('be.visible');
      cy.get('.ic-workspace-button').should('be.visible');
      cy.get('.ic-help-button').should('be.visible');
      expectCompassStructure();
    });

    it('invalid code and invalid username', () => {
      cy.visit('/compass/edit/12345/,,,');
      getElemWithDataCy(modal.heading).should('contain', 'Workspace not found');
      getElemWithDataCy(modal.confirmButton).click();
      cy.url().should('eq', 'http://localhost:8080/');
    });

    describe('username input', () => {
      it('prompts for username if missing from path', () => {
        cy.visit(editURL.replace('/sandbox', ''));
        getElemWithDataCy(modal.heading).should('contain', 'Welcome');
      });

      it('ignores submitting empty input', () => {
        getElemWithDataCy(modal.confirmButton).click();
        getElemWithDataCy(modal.confirmButton).should('be.visible');
      });

      it('bad username', () => {
        cy.get('#ic-modal-input').type('sandbox2');
        cy.get('#ic-modal-confirm').click();
        cy.get('.ic-toast-message').should('contain', 'letters-only');
      });

      it('valid username', () => {
        cy.get('#ic-modal-input').clear().type('sandbox');
        cy.get('#ic-modal-confirm').click();
        cy.get('#center').should('be.visible');
        cy.get('#vline').should('be.visible');
        cy.get('#hline').should('be.visible');
        cy.get('.ic-workspace-button').should('be.visible');
        cy.get('.ic-help-button').should('be.visible');
      });
    });
  });
});
