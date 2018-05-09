const router = require('express').Router();
const compassSchema = require('../models/compass');

router.get('/edit', (req, res) => {
  compassSchema.findByEditCode(req.query.id, (compass) => {
    res.json({ compass });
  });
});

module.exports = router;

