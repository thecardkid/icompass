'use strict';

const express = require('express');
const path = require('path');
const port = 8080;
const app = express();

var bodyParser = require('body-parser');
var logger = require('./lib/logger.js');
var db;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('*', function (request, response) {
    response.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

var server = app.listen(port, function() {
    logger.info('Listening on port:', port);
    db = require('./lib/db.js');
});

var socket = require('./lib/sockets');
socket.connect(server);

function cleanup() {
    logger.info('Disconnecting from MongoDB');
    db.disconnect();
    process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
