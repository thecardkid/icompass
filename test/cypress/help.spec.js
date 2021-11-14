const { setup, getElemWithDataCy } = require('./utils');
const { modal, helpMenu } = require('./data_cy');

function clickHelpButton() {
  cy.get('button.ic-help-button').click({ force: true });
}

describe('help menu', () => {
  before(setup);

  beforeEach(clickHelpButton);

  it('show prompt', () => {
    getElemWithDataCy(helpMenu.getStarted).click();
    getElemWithDataCy(modal.heading).should('contain', 'Innovator\'s Compass');
    getElemWithDataCy(modal.closeButton).click();
  });

  it('quick start guide', () => {
    getElemWithDataCy(helpMenu.guide).should('have.attr', 'href').should('contain', 'youtube.com');
    // hide the form for the next test
    clickHelpButton();
  });

  it('about us', () => {
    getElemWithDataCy(helpMenu.aboutUs).click();
    getElemWithDataCy(modal.heading).should('contain', 'Hi!');
    getElemWithDataCy(modal.closeButton).click();
  });

  it('release notes', () => {
    getElemWithDataCy(helpMenu.whatsNew).click();
    getElemWithDataCy(modal.heading).should('contain', 'New Things');
    getElemWithDataCy(modal.closeButton).click();
  });

  it('privacy statement', () => {
    getElemWithDataCy(helpMenu.privacyStatement).click();
    getElemWithDataCy(modal.heading).should('contain', 'Privacy Statement');
    getElemWithDataCy(modal.closeButton).click();
  });

  it('feedback', () => {
    getElemWithDataCy(helpMenu.leaveFeedback).click();
    cy.get('.ic-dynamic-modal .contents').should('contain', 'I\'d love to hear from you');
    getElemWithDataCy(modal.closeButton).click();
  });
});
