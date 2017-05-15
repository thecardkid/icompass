var router = require('express').Router();
var sockets = require('../utils/sockets.js');
var Compass = require('../models/compass.js');
var logger = require('../utils/logger.js');
var DefaultCompass = require('../models/defaultCompass.js');
var modes = require('../utils/constants.js').modes;

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
    newCompass.editCode = generateUUID();
    newCompass.viewCode = generateUUID();
    newCompass.center = req.body.center;
    Compass.create(newCompass, function (err, compass) {
        if (err) return logger.error(err);

        logger.debug('Successfully created compass', compass._id);
        res.json({code: compass.edit, mode: modes.edit, compass: compass});
    });
});

router.post('/find', function(req, res, next) {
    Compass.findOne({'editCode': req.body.code}, function(err, compass) {
        if (err) return logger.error(err);

        if (compass === null) {
            Compass.findOne({'viewCode': req.body.code}, function(err, compass) {
                if (err) return logger.error(err);

                var copy = JSON.parse(JSON.stringify(compass));
                delete copy.editCode;
                //TODO delete comment code
                logger.debug('Found compass for viewing', compass._id);
                res.json({code: req.body.code, mode: modes.view, compass: copy})
            })
        } else {
            logger.debug('Found compass for editing', compass._id);
            res.json({code: req.body.code, mode: modes.edit, compass: compass});
        }
    })
});

module.exports = router;

