const { setup, getElemWithDataCy } = require('./utils');
const { modal, helpMenu } = require('./data_cy');

function clickHelpButton() {
  cy.get('button.ic-help-button').click({ force: true });
}

describe('help menu', () => {
  before(setup);

  describe('help items', () => {
    beforeEach(clickHelpButton);

    it('show prompt', () => {
      getElemWithDataCy(helpMenu.getStarted).click();
      getElemWithDataCy(modal.heading).should('contain', 'Innovators\' Compass');
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
      getElemWithDataCy(modal.heading).should('contain', 'New things');
      getElemWithDataCy(modal.closeButton).click();
    });

    it('privacy statement', () => {
      getElemWithDataCy(helpMenu.privacyStatement).click();
      getElemWithDataCy(modal.heading).should('contain', 'Privacy statement');
      getElemWithDataCy(modal.closeButton).click();
    });

    it('feedback', () => {
      getElemWithDataCy(helpMenu.leaveFeedback).click();
      cy.get('.ic-dynamic-modal .contents').should('contain', 'Leave your feedback');
      getElemWithDataCy(modal.closeButton).click();
    });
  });

  describe('dismissability', () => {
    const helpButton = 'button.ic-help-button';
    const helpMenu = '.ic-help-menu';

    it('dismisses if help icon clicked', () => {
      cy.get(helpButton).click();
      cy.get(helpMenu).should('be.visible');
      cy.get(helpButton).click();
      cy.get(helpMenu).should('not.exist');
    });

    it('dismisses if clicked elsewhere on page', () => {
      cy.get(helpButton).click();
      cy.get(helpMenu).should('be.visible');
      cy.get('#observations').click('right');
      cy.get(helpMenu).should('not.exist');
    });

    it('dismisses if workspace menu clicked', () => {
      cy.get(helpButton).click();
      cy.get(helpMenu).should('be.visible');
      cy.get('button.ic-workspace-button').click();
      cy.get(helpMenu).should('not.exist');
    });
  });
});
