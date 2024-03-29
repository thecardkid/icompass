/* global Cypress */

const { getColorAttr, modal, workspaceMenu } = require('./data_cy');

export const testImageURL = 'http://localhost:8080/test.jpg';

export function waitForVisible(selector) {
  cy.get(selector, { timeout: 10000 }).should('be.visible');
}

export function setup({ topic, centerTextInput } = {}) {
  cy.visit('/');
  // TODO compass-center is legacy (from before "topic" existed).
  // Rename to compass-topic
  cy.get('#compass-center').type(topic || 'e2e');
  cy.get('#username').type('sandbox');
  cy.get('button[type=submit]').click();
  // Check modal is not dismissable via backdrop or close button.
  getElemWithDataCy(modal.confirmButton).should('be.visible');
  getElemWithDataCy(modal.closeButton).should('not.exist');
  cy.get('#ic-backdrop2').click();
  getElemWithDataCy(modal.confirmButton).should('be.visible');
  cy.get('#ic-modal-input').type(centerTextInput || 'center');
  getElemWithDataCy(modal.confirmButton).click();
}

export function selectMenuOption(attr) {
  cy.get('button.ic-workspace-button').click();
  waitForVisible('div.ic-workspace-menu');
  getElemWithDataCy(attr).click();
}

export function cleanup() {
  selectMenuOption(workspaceMenu.deleteWorkspace);
  // confirm delete
  waitForVisible('#ic-modal', 100);
  cy.get('#ic-modal-confirm').click();
  // confirm thank-you-note
  waitForVisible('#ic-modal', 5000);
  cy.get('#ic-modal-confirm').click();
}

export function expectCompassStructure() {
  cy.get('#observations').should('be.visible');
  cy.get('#observations h1').should('contain', 'OBSERVATIONS');
  cy.get('#observations h2').should('contain', 'What\'s happening? Why?');

  cy.get('#principles').should('be.visible');
  cy.get('#principles h1').should('contain', 'PRINCIPLES');
  cy.get('#principles h2').should('contain', 'What matters most?');

  cy.get('#ideas').should('be.visible');
  cy.get('#ideas h1').should('contain', 'IDEAS');
  cy.get('#ideas h2').should('contain', 'What ways are there?');

  cy.get('#experiments').should('be.visible');
  cy.get('#experiments h1').should('contain', 'EXPERIMENTS');
  cy.get('#experiments h2').should('contain', 'What\'s a step to try?');
}

export function selectColor(color) {
  cy.get('.ic-form-palette .icon').click();
  getElemWithDataCy(getColorAttr(color)).click({
    // The palette itself is hidden until the color is clicked.
    force: true,
  });
}

export function selectSubmenuOption({ submenu, suboption }) {
  cy.get('button.ic-workspace-button').click();
  getElemWithDataCy(submenu).trigger('mouseover');
  getElemWithDataCy(suboption).click();
}

export function getElemWithDataCy(attr) {
  return cy.get(`[data-cy=${attr}]`);
}

export function clickXOnNote(noteNumber) {
  cy.get(`#note${noteNumber} .ic-close-window`).click({
    // The "x" is only visible on hover, so we need `force`.
    force: true
  });
}

export function matchImageSnapshot() {
  if (
    // Based on brief testing, image resolution is more consistent
    // in headless mode. Headed mode often ran into issues comparing
    // two images that are the same, but different resolutions.
    Cypress.browser.isHeaded ||
    // matchImageSnapshot runs into this error on Github Actions,
    // so we skip. The full env var is CYPRESS_SKIP_SNAPSHOTS, but
    // is truncated by Cypress (https://docs.cypress.io/guides/guides/environment-variables#Option-3-CYPRESS_).
    //
    // Error: Invalid file signature
   !!Cypress.env('SKIP_SNAPSHOTS')
  ) {
    cy.log('Skip matchImageSnapshot');
    return;
  }
  cy.setResolution([1920, 1080]);
  cy.matchImageSnapshot();
}

export function assertDraggable(selector, { deltaX, deltaY }) {
  let originalPosition;
  cy.get(selector).then($el => originalPosition = $el.position());
  cy.get(selector).move({ deltaX, deltaY });
  cy.get(selector).then($el => {
    const newPosition = $el.position();
    expect(newPosition.left).to.equal(originalPosition.left + deltaX);
    expect(newPosition.top).to.equal(originalPosition.top + deltaY);
  });
}

export function assertNotDraggable(selector) {
  let originalPosition;
  cy.get(selector).then($el => originalPosition = $el.position());
  cy.get(selector).move({ deltaX: 100, deltaY: 100 });
  cy.get(selector).then($el => {
    const newPosition = $el.position();
    expect(newPosition.left).to.equal(originalPosition.left);
    expect(newPosition.top).to.equal(originalPosition.top);
  });
}
