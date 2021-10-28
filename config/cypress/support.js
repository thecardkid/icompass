require('@4tw/cypress-drag-drop');
require('cypress-file-upload');
require('cypress-localstorage-commands');

const { addMatchImageSnapshotCommand } = require('cypress-image-snapshot/command');

addMatchImageSnapshotCommand({
  failureThreshold: 0.00,
  failureThresholdType: 'percent',
  customDiffConfig: { threshold: 0.0 },
  capture: 'viewport',
});

Cypress.Commands.add("setResolution", (size) => {
  if (Cypress._.isArray(size)) {
    cy.viewport(size[0], size[1]);
  } else {
    cy.viewport(size);
  }
});
