const express = require('express');
const path = require('path');
const port = 8080;
const app = express();

var bodyParser = require('body-parser');
var db = require('./utils/db.js')
var socket = require('./utils/sockets.js');

// serve static assets normally
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Handles all routes so you do not get a not found error
app.get('*', function (request, response) {
	response.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

var server = app.listen(port, function() {
    console.log("Listening on port:", port);
});

socket.socketServer(server);

