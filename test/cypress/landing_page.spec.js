const { matchImageSnapshot } = require('./utils');

describe('landing page', () => {
  before(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('renders correctly', () => {
    cy.title().should('eq', 'The Innovators\' Compass');
    cy.get('div#message').should('be.visible');
    cy.get('div#get-started-form').should('be.visible');
    cy.get('div#get-started-form input').should('have.length', 2);
    cy.get('a.ic-guide').should('be.visible');
    cy.get('a.ic-guide').should('have.attr', 'href', 'https://youtu.be/3IbxFHQ5Dxo');
    matchImageSnapshot();
  });

  describe('invalid input', () => {
    it('missing both', () => {
      cy.get('button[type=submit]').click();
      // TODO instead of checking we are not on the next page, check for the error alerts
      cy.get('#ic-modal').should('not.exist');
      cy.get('#compass').should('not.exist');
    });

    it('missing username', () => {
      cy.get('#compass-center').type('acceptable');
      cy.get('#username').clear();
      cy.get('button[type=submit]').click();
      cy.get('#ic-modal').should('not.exist');
      cy.get('#compass').should('not.exist');
    });

    it('missing topic', () => {
      cy.get('#compass-center').clear();
      cy.get('#username').type('sandbox');
      cy.get('button[type=submit]').click();
      cy.get('#ic-modal').should('not.exist');
      cy.get('#compass').should('not.exist');
    });
  });

  describe('valid input', () => {
    it('can create workspace and is prompted for email', () => {
      cy.get('#compass-center').type('topic');
      cy.get('#username').type('sandbox');
      cy.get('button[type=submit]').click();
      matchImageSnapshot();
    });
  });

  describe('email', () => {
    beforeEach(() => {
      // Fill out the fields, and click the submit button, so that each test
      // starts with the email prompt showing.
      cy.visit('/');
      cy.get('#compass-center').type('center');
      cy.get('#username').type('sandbox');
      cy.get('button[type=submit]').click();
    });

    describe('email validation', () => {
      it('rejects empty email', () => {
        cy.get('#ic-modal-confirm').click();
        cy.get('#ic-toast span').should('contain', 'not a valid email address');
      });

      it('rejects invalid email', () => {
        cy.get('#ic-modal-input').type('fakeemail');
        cy.get('#ic-modal-confirm').click();
        cy.get('#ic-toast span').should('contain', 'not a valid email address');
      });

      it('valid email goes through', () => {
        cy.get('#ic-modal-input').type('fakeemail@test.com');
        cy.get('#ic-modal-confirm').click();
        cy.get('#compass').should('be.visible');
        cy.get('#ic-toast span').should('contain', 'link to this workspace');
      });

      it('skipping goes through', () => {
        cy.get('#ic-modal-cancel').click();
        cy.get('#compass').should('be.visible');
      });

      it('skipping goes through even with invalid input', () => {
        cy.get('#ic-modal-input').type('fakeemail');
        cy.get('#ic-modal-cancel').click();
        cy.get('#compass').should('be.visible');
      });
    });

    describe('always email feature', () => {
      it('does not store an invalid email', () => {
        cy.get('#ic-modal-input').type('invalidemail');
        cy.get('#ic-always-email-value').check();
        cy.get('#ic-modal-confirm').click();
        cy.get('#ic-toast span').should('contain', 'not a valid email address');

        // to test that it's not stored, refresh the page and
        // re-execute the form
        cy.visit('/');
        cy.get('#compass-center').type('center');
        cy.get('#username').type('sandbox');
        cy.get('button[type=submit]').click();
        cy.get('#ic-always-email-value').should('not.be.checked');
      });

      it('does store valid email', () => {
        cy.get('#ic-modal-input').type('fakeuser@fakedomain.com');
        cy.get('#ic-always-email-value').check();
        cy.get('#ic-modal-confirm').click();
        cy.get('#ic-toast').should('contain', 'link to this workspace');

        // to test that it's stored, refresh the page and
        // re-execute the form
        cy.visit('/');
        cy.get('#compass-center').type('center');
        cy.get('#username').type('sandbox');
        cy.get('button[type=submit]').click();
        // assert that we are taken straight to workspace
        cy.get('#ic-toast').should('contain', 'automatically');
      });

      it('unsubscribe from automatic emails', () => {
        cy.visit('/disable-auto-email');
        cy.get('#ic-modal-body').should('contain', 'turned off');
        // redirects to home page
        cy.get('#ic-modal-confirm').click();

        cy.get('#compass-center').type('center');
        cy.get('#username').type('sandbox');
        cy.get('button[type=submit]').click();
        cy.get('#ic-always-email-value').should('not.be.checked');
      });
    });
  });
});
