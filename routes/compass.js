var router = require('express').Router();
var sockets = require('../sockets');
var Compass = require('../models/compass');
var DefaultCompass = require('../models/defaultCompass');

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
    // Compute real hash for new workspace
    var hash = generateUUID();
    var newCompass = DefaultCompass;
    newCompass.id = hash;
    Compass.create(newCompass, function (err, compass) {
        if (err) return console.log(err);
        res.json({hash: hash, compass: compass});
    });
});

router.post('/load', function(req, res, next) {
    Compass.findOne({'id': req.body.id}, function(err, compass) {
        if (err) return console.error(err);
        res.json({compass: compass});
    })
});

module.exports = router;

