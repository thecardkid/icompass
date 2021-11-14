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
});
