'use strict';

var mongoose = require('mongoose');
var logger = require('./logger');

switch (process.env.NODE_ENV) {
    case 'production':
        mongoose.connect('mongodb://icompass:compass78@ds133311.mlab.com:33311/innovatorscompasshieu');
        logger.info('Connected to Mongo Lab instance');
        break;

    default:
        mongoose.connect('mongodb://localhost/compass');
        logger.info('Connected to local database');
        break;
}

var connection = mongoose.connection;

connection.on('error', function(e) {
    logger.error('Could not connect to mongoose', e);
});

connection.once('open', function(){
    logger.info('Mongodb Connection Successful');
});
