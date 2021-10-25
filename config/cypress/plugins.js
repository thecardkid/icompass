const { addMatchImageSnapshotPlugin } = require('cypress-image-snapshot/plugin');

module.exports = function(on, config) {
  addMatchImageSnapshotPlugin(on, config);
};
