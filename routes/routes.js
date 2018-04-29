const compassSchema = require('../models/compass');

module.exports = {
  getByEditCode: (req, res) => {
    compassSchema.findByEditCode(req.query.id, (compass) => {
      res.json({ compass });
    });
  },
};

