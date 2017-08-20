'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const port = process.env.NODE_PORT || 8080;

let app = express();
let logger = require('./lib/logger.js');
let db;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('*', function (request, response) {
    response.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

let server = app.listen(port, function() {
    logger.info('Listening on port:', port);
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
