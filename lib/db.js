'use strict';

var mongoose = require('mongoose');
var logger = require('./logger');

var uname = process.env.MONGO_UNAME;
var password = process.env.MONGO_PWD;
var env = process.env.NODE_ENV;
var options = {
    autoReconnect: true,
    reconnectTries: 100,
    reconnectInterval: 2000
};

var auth;

switch (env) {
    case 'production':
        if (!uname) logger.error('No username provided for mongodb connection');
        if (!password) logger.error('No password provided for mongodb connection');
        auth = uname + ':' + password;
        mongoose.connect('mongodb://' + auth + '@ds145603-a0.mlab.com:45603,ds145603-a1.mlab.com:45603/icompass-production?replicaSet=rs-ds145603', options);
        logger.info('Connected to Mongo Lab instance');
        break;

    case 'test':
        if (!uname) logger.error('No username provided for mongodb connection');
        if (!password) logger.error('No password provided for mongodb connection');
        auth = uname + ':' + password;
        mongoose.connect('mongodb://' + auth + '@ds127443.mlab.com:27443/staging', options);
        logger.info('Connected to Test environment');
        break;

    default:
        mongoose.connect('mongodb://localhost/compass');
        logger.info('Connected to local database');
        break;
}

mongoose.connection.on('error', function(e) {
    logger.error('Could not connect to mongoose', e);
});

mongoose.connection.once('open', function(){
    logger.info('Mongodb Connection Successful');
});
