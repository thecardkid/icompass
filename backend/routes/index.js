const router = require('express').Router();
const { ensureAdminAuthenticatedMiddleware } = require('./google_auth');

const workspace = require('./workspace');
const infra = require('./infra');

router.use('/-', infra);
router.use('/api/v1/workspace', workspace);

module.exports = router;
