const router = require('express').Router();
const compassSchema = require('../models/compass');

router.get('/view', (req, res) => {
  compassSchema.findByViewCode(req.query.id, (compass) => {
    res.json({ compass });
  });
});

module.exports = router;
