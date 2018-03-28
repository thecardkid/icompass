const mongoose = require('mongoose');

const logger = require('./logger');

const env = process.env.NODE_ENV;
const options = {
  autoReconnect: true,
  reconnectTries: 100,
  reconnectInterval: 2000,
};

let uname = process.env.MONGO_UNAME;
let password = process.env.MONGO_PWD;
let db;

switch (env) {
  case 'production':
    if (!uname) logger.error('No username provided for mongodb connection');
    if (!password) logger.error('No password provided for mongodb connection');
    db = mongoose.connect(`mongodb://${uname}:${password}@ds145603-a0.mlab.com:45603,ds145603-a1.mlab.com:45603/icompass-production?replicaSet=rs-ds145603`, options);
    logger.info('Connected to Mongo Lab instance');
    break;

  case 'test':
    if (!uname) logger.error('No username provided for mongodb connection');
    if (!password) logger.error('No password provided for mongodb connection');
    db = mongoose.connect(`mongodb://${uname}:${password}@ds127443.mlab.com:27443/staging`, options);
    logger.info('Connected to Test environment');
    break;

  default:
    db = mongoose.connect('mongodb://localhost/compass');
    logger.info('Connected to local database');
    break;
}

mongoose.connection.on('error', function(e) {
  logger.error('Could not connect to mongoose', e);
});

mongoose.connection.once('open', function() {
  logger.info('Mongodb Connection Successful');
});

module.exports = db;
