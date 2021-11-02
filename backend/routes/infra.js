const express = require('express');
const config = require('../config');

function handleVersion(req, res) {
  res.json({ build: config.build });
}

function handlePing(req, res) {
  res.send('ok');
}

module.exports = (function() {
  const router = express.Router();
  router.get('/version', handleVersion);
  router.get('/ping', handlePing);
  return router;
})();

