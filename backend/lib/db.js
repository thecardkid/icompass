const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const logger = require('./logger').DefaultLogger;
const config = require('../config');

async function getMongoURI() {
  if (config.serverEnv.isTest) {
    return await (new MongoMemoryServer()).getUri();
  }
  return process.env.MONGODB_URI || 'mongodb://localhost/compass';
}

async function initializeDB() {
  const db = await mongoose.connect(await getMongoURI(), {
    useNewUrlParser: true,
  });
  if (db.connections.length) {
    const conn = db.connections[0];
    logger.info(`Connected to Mongo instance ${conn.host}:${conn.port}`);
  }

  mongoose.connection.on('error', function(e) {
    logger.error('Could not connect to mongoose', e);
    throw new Error(e);
  });
  mongoose.set('useFindAndModify', false);
  return db;
}

module.exports = initializeDB;
