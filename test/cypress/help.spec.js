const { setup, getElemWithDataCy } = require('./utils');
const { helpMenu } = require('./data_cy');

function clickHelpButton() {
  cy.get('button.ic-help-button').click({ force: true });
}

describe('help menu', () => {
  before(setup);

  beforeEach(clickHelpButton);

  it('show prompt', () => {
    getElemWithDataCy(helpMenu.getStarted).click();
    cy.get('#ic-modal-body').should('contain', 'Innovator\'s Compass');
    cy.get('#ic-modal-confirm').click();
  });

  it('quick start guide', () => {
    getElemWithDataCy(helpMenu.guide).should('have.attr', 'href').should('contain', 'youtube.com');
    // hide the form for the next test
    clickHelpButton();
  });

  it('about us', () => {
    getElemWithDataCy(helpMenu.aboutUs).click();
    cy.get('#ic-modal-body').should('contain', 'Hi!');
    cy.get('#ic-modal-confirm').click();
  });

  it('release notes', () => {
    getElemWithDataCy(helpMenu.whatsNew).click();
    cy.get('#ic-modal-body').should('contain', 'Release');
    cy.get('#ic-modal-confirm').click();
  });

  it('privacy statement', () => {
    getElemWithDataCy(helpMenu.privacyStatement).click();
    cy.get('#ic-modal-body').should('contain', 'Privacy Statement');
    cy.get('#ic-modal-confirm').click();
  });

  it('contact', () => {
    getElemWithDataCy(helpMenu.leaveFeedback).click();
    cy.get('.ic-dynamic-modal .contents').should('contain', 'I\'d love to hear from you');
    cy.get('button.ic-close-window').click();
  });
});
