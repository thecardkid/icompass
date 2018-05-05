let bodyParser = require('body-parser');
let express = require('express');
let helmet = require('helmet');
let path = require('path');
const s3Router = require('react-dropzone-s3-uploader/s3router');

let logger = require('./lib/logger.js');
let routes = require('./routes/routes.js');

let app = express();
let db;
const PORT = process.env.NODE_PORT || 8080;

app.use(express.static(__dirname + '/public'));
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

app.use(logger.api);

app.use('/api/v1', routes);

app.use('/s3', s3Router({
  bucket: 'innovatorscompass',
  region: 'us-east-2',
  headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT'},
  ACL: 'public-read',
  uniquePrefix: true,
}));

app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

let server = app.listen(PORT, function() {
  logger.info('Listening on port:', PORT);
  db = require('./lib/db.js');
});

let socket = require('./lib/sockets');
socket.connect(server);

function cleanup() {
  logger.info('Disconnecting from MongoDB');
  db.disconnect();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

module.exports = app;
