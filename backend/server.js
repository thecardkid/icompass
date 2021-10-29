/* global process: 1 */

const bodyParser = require('body-parser');
const express = require('express');
const expressSession = require('express-session');
const helmet = require('helmet');
const passport = require('passport');
const path = require('path');
const s3Router = require('react-dropzone-s3-uploader/s3router');

const appConfig = require('./config');
const initializeDB = require('./lib/db');
const logger = require('./lib/logger').DefaultLogger;
const socket = require('./lib/sockets');
const RoomManager = require('./lib/RoomManager');
const apiRoutes = require('./routes');
const adminRoutes = require('./routes/admin');
const googleAuth = require('./routes/google_auth');

const staticDir = path.join(__dirname, 'website-dist');
function handleConsumerSPA(req, res) {
  res.sendFile(path.resolve(staticDir, 'index.html'));
}

function handleAdminSPA(req, res) {
  res.sendFile(path.resolve(staticDir, 'admin.html'));
}

function apiLoggerMiddleware(req, res, next) {
  logger.info(req.method, req.url, res.statusCode);
  next();
}

function initApp() {
  googleAuth.setUpPassportForGoogleAuth(passport, appConfig);

  const app = express();
  app.use(expressSession({
    secret: 'my_precious',
    resave: true,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(staticDir));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(helmet({
    frameguard: {
      action: 'deny',
    },
    hidePoweredBy: {
      setTo: 'ASP.NET',
    },
    xssFilter: {
      setOnOldIE: true,
    },
  }));

  app.get('/', handleConsumerSPA);
  app.get('/disable-auto-email', handleConsumerSPA);
  app.get('/compass/edit/:code', handleConsumerSPA);
  app.get('/compass/edit/:code/:username', handleConsumerSPA);
  app.get('/compass/view/:code', handleConsumerSPA);

  app.use('/api/v1', apiLoggerMiddleware, apiRoutes);

  app.use('/s3', s3Router({
    bucket: appConfig.s3Bucket,
    region: 'us-east-2',
    headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT'},
    ACL: 'public-read',
    uniquePrefix: true,
  }));

  let db;
  const server = app.listen(appConfig.appPort, async function() {
    logger.info(`Listening on port ${appConfig.appPort}`);
    logger.info(`Server environment is: ${appConfig.serverEnv.nodeEnv}`);
    db = await initializeDB();
  });

  const roomManagerSingleton = new RoomManager();
  const socketIOInstance = socket.connect(server, roomManagerSingleton);
  googleAuth.installRoutes(app, passport);
  app.get('/admin', googleAuth.ensureAdminAuthenticatedMiddleware, handleAdminSPA);
  app.use('/admin/api', googleAuth.ensureAdminAuthenticatedMiddleware, apiLoggerMiddleware, function(req, res, next) {
    req.socketIOInstance = socketIOInstance;
    req.roomManager = roomManagerSingleton;
    return next();
  }, adminRoutes);

  const cleanup = function() {
    logger.info('Disconnecting from MongoDB');
    if (db.connections.length) {
      db.connections[0].close();
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  return server;
}

module.exports = initApp();
