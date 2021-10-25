const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const logger = require('./logger').DefaultLogger;

async function initializeDB() {
  let uri = process.env.MONGODB_URI || 'mongodb://localhost/compass';
  if (process.env.NODE_ENV === 'test') {
    const mongod = new MongoMemoryServer();
    uri = await mongod.getUri();
  }
  const db = await mongoose.connect(uri, {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: 100,
    reconnectInterval: 2000,
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
