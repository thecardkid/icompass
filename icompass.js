'use strict';

let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let helmet = require('helmet');

let app = express();
let logger = require('./lib/logger.js');
let db;
const PORT = process.env.NODE_PORT || 8080;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(helmet({
    frameguard: {
        action: 'deny',
    },
    hidePoweredBy: {
        setTo: 'ASP.NET'
    },
    xssFilter: {
        setOnOldIE: true
    }
}));

app.get('*', function (request, response) {
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
