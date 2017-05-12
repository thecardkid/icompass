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
            client.on('move note', handleMoveNote); // move note
            client.on('edit note', handleEditNote);
        });
    }
}

function handleConnectCompass(info) {
    client.room = info.hashcode;
    client.username = info.username;
    client.token = info.token;
    client.compassId = info._id;

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

    Compass.findOne({id: client.compassId}, function(err, compass) {

    })

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
    Compass.findOne({id: client.room}, function(err, compass) {
        if (err) logger.error('Error finding compass with ID', client.room, err);

        console.log(client.room, client.username);
        if (!(userManager[client.room])) logger.debug('Creating a note for a room that does not exist!', newNote);

        Compass.findByIdAndUpdate(
            compass._id,
            {$push: {notes: newNote}},
            {$safe: true, upsert: false, new: true},
            function (err, newCompass) {
                if (err) logger.error('Error updating compass with ID', client.room, err);

                var last = newCompass.notes.length - 1;

                logger.info(client.username, 'created a note');
                logger.debug(client.username, 'created a note', newNote);
                io.sockets.in(client.room).emit('add note', newCompass.notes[last]);
            }
        );
    });
}

function handleMoveNote(info) {
    Compass.findOne({id: client.room}, function(err, compass) {
        if (err) logger.error('Error finding compass with ID', client.room, err);

        if (!(userManager[client.room])) logger.debug('Moving a note for a room that does not exist', info);

        var changed;
        var newNotes = _.filter(compass.notes, function(e, i) {
            if (e._id.toString() == info.noteId) {
                changed = e;
                return false;
            }
            return true;
        });

        changed.x = info.x;
        changed.y = info.y;
        newNotes.push(changed);

        Compass.findByIdAndUpdate(
            compass._id,
            {$set: {notes: newNotes}},
            {$safe: true, upsert: false, new: true},
            function (err, newCompass) {
                if (err) logger.error('Error updating compass with ID', client.room, err);

                logger.info(client.username, 'moved a note');
                logger.debug(client.username, 'moved a note', changed);
                io.sockets.in(client.room).emit('refresh notes', newCompass.notes);
            }
        );
    });
}

function handleEditNote(info) {
    Compass.findOne({id: client.room}, function(err, compass) {
        if (err) logger.error('Error finding compass with ID', client.room, err);

        if (!(userManager[client.room])) logger.debug('Moving a note for a room that does not exist', info);

        var changed;
        var newNotes = _.filter(compass.notes, function(e, i) {
            if (e._id.toString() == info.noteId) {
                changed = e;
                return false;
            }
            return true;
        });

        changed.text = info.text;
        newNotes.push(changed);

        Compass.findByIdAndUpdate(
            compass._id,
            {$set: {notes: newNotes}},
            {$safe: true, upsert: false, new: true},
            function (err, newCompass) {
                if (err) logger.error('Error updating compass with ID', client.room, err);

                logger.info(client.username, 'edited a note');
                logger.debug(client.username, 'edited a note', changed);
                io.sockets.in(client.room).emit('refresh notes', newCompass.notes);
            }
        );
    });
}

module.exports = socketObject;

