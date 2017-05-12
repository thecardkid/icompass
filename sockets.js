var socketIO = require('socket.io');
var ObjectId = require('mongoose').Types.ObjectId;
var Compass = require('./models/compass');
var _ = require('underscore');
var io;
var logger = require('./logger');
var client;

var allColors = [
    '#FFAE27', // orange
    '#CCFFCC', // green
    '#FFCCFF', // pink
    '#CCCCFF', // purple
    '#CCFFFF', // blue
    '#FFFFCC', // yellow
];
var userManager = {};

var socketObject = {
    socketServer: function(server) {
        io = socketIO.listen(server);

        io.sockets.on('connection', function(c) {
            client = c;
            client.on('connect compass', handleConnectCompass); // connect compass
            client.on('disconnect', handleDisconnectCompass); // disconnect
            client.on('new note', handleMakeNote); // new note
            client.on('move note', handleUpdateNote); // move note
            client.on('edit note', handleUpdateNote);
        });
    }
}

function handleConnectCompass(info) {
    client.room = info.hashcode;
    client.username = info.username;
    client.compassId = info.compassId;

    client.join(client.room);
    logger.info(client.username, 'joined room', client.room);

    var manager;
    // check if room existed
    if (!(client.room in userManager))
        manager = {usernameToColor: {}, colors: allColors.slice()};
    else
        manager = userManager[client.room];

    // make username unique
    while (client.username in manager.usernameToColor)
        client.username += 'x';

    // assign new username a color. TODO handle "too many users case"
    var r = Math.floor(Math.random() * manager.colors.length);
    manager.usernameToColor[client.username] = manager.colors[r];
    manager.colors.splice(r, 1);

    userManager[client.room] = manager;
    logger.debug('Manager after user joined', userManager);
    io.sockets.in(client.room).emit('user joined', userManager[client.room]);
}

function handleDisconnectCompass(reason) {
    logger.info(client.username, 'left room', client.room, 'because', reason);

    var manager = userManager[client.room];
    if (!(manager)) return; // TODO log this
    var c = manager.usernameToColor[client.username];
    delete manager.usernameToColor[client.username];

    // if no user left, delete room
    if (_.isEmpty(manager.usernameToColor)) {
        delete userManager[client.room];
    } else {
        manager.colors.push(c);
        io.sockets.in(client.room).emit('user left', manager);
        userManager[client.room] = manager;
    }

    logger.debug('Manager after user left', userManager);
}

function handleMakeNote(newNote) {
    Compass.addNote(client.compassId, newNote, function(newCompass) {
        var last = newCompass.notes.length - 1;

        logger.info(client.username, 'created a note');
        logger.debug(client.username, 'created a note', newNote);
        io.sockets.in(client.room).emit('add note', newCompass.notes[last]);
    });
}

function handleUpdateNote(updatedNote) {
    Compass.updateNote(client.compassId, updatedNote, function(c) {
        logger.info(client.username, 'updated a note');
        logger.debug(client.username, 'updated a note', updatedNote);
        io.sockets.in(client.room).emit('refresh notes', c.notes);
    });
}

module.exports = socketObject;

