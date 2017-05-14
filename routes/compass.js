var router = require('express').Router();
var sockets = require('../utils/sockets.js');
var Compass = require('../models/compass.js');
var logger = require('../utils/logger.js');
var DefaultCompass = require('../models/defaultCompass.js');

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

router.post('/create', function(req, res, next) {
    var hash = generateUUID();
    var newCompass = DefaultCompass;
    newCompass.id = hash;
    newCompass.center = req.body.center;
    Compass.create(newCompass, function (err, compass) {
        if (err) return logger.error(err);

        logger.debug('Successfully created compass', compass._id);
        res.json({hash: hash, compass: compass});
    });
});

router.post('/load', function(req, res, next) {
    Compass.findOne({'id': req.body.id}, function(err, compass) {
        if (err) return logger.error(err);

        logger.debug('Successfully loaded compass', compass._id);
        res.json({compass: compass});
    })
});

module.exports = router;

