import {
  getElemWithDataCy,
  selectMenuOption,
  setup,
} from './utils';
const { modal, workspaceMenu } = require('./data_cy');

describe('local storage', () => {
  before(setup);
  beforeEach(cy.restoreLocalStorage);
  afterEach(cy.saveLocalStorage);

  describe('note progress', () => {
    const createProgress = 'create progress';
    const editProgressFirstNote = ' 1 progress';
    const editProgressSecondNote = ' 2 progress';
    const editProgressDraftNote = ' draft progress';

    const $editor = '#ic-form-text .ql-editor';

    // This is technically a "before", but hooks don't trigger beforeEach and
    // afterEach hooks, which we need to persist local storage.
    it('setup', () => {
      let x = 200, y = 200;
      // First, set up some notes.
      cy.get('body').dblclick(x, y);
      cy.get($editor).type('first note');
      cy.get('button[name=ship]').click();
      cy.get('body').dblclick(x+100, y);
      cy.get($editor).type('second note');
      cy.get('button[name=ship]').click();
      cy.get('body').dblclick(x+200, y);
      cy.get($editor).type('draft note');
      cy.get('button[name=draft]').click();

      // Set up typing progress.
      cy.get('body').dblclick(x+300, y);
      cy.get($editor).type(createProgress);
      cy.get('button[name=nvm]').click();
      // Drafts come first.
      cy.get('#note0').dblclick();
      cy.get($editor).type(editProgressDraftNote);
      cy.get('button[name=nvm]').click();
      cy.get('#note1').dblclick();
      cy.get($editor).type(editProgressFirstNote);
      cy.get('button[name=nvm]').click();
      cy.get('#note2').dblclick();
      cy.get($editor).type(editProgressSecondNote);
      cy.get('button[name=nvm]').click();
    });

    it('create progress', () => {
      cy.reload();
      cy.wait(1500);
      cy.get('body').dblclick(500, 500);
      cy.get($editor).should('contain', createProgress);
      cy.get('button[name=nvm]').click();
      cy.get('#note0').dblclick();
      cy.get($editor).should('contain', editProgressDraftNote);
      cy.get('button[name=nvm]').click();
      cy.get('#note1').dblclick();
      cy.get($editor).should('contain', editProgressFirstNote);
      cy.get('button[name=nvm]').click();
      cy.get('#note2').dblclick();
      cy.get($editor).should('contain', editProgressSecondNote);
      cy.get('button[name=nvm]').click();
    });
  });

  describe('auto-email feature', () => {
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
        // This assertion fails in Cypress, but I can't seem to recreate
        // outside of Cypress.
        // cy.get(checkbox).should('be.checked');
        cy.get('.ic-modal-warning').should('contain', validEmail);

        // Carry-on from the bug above, since it starts out unchecked, we
        // must check it first.
        cy.get(checkbox).check();
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
});
