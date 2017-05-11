var socketIO = require('socket.io');
var ObjectId = require('mongoose').Types.ObjectId;
var Compass = require('./models/compass');
var _ = require('underscore');
var client, io;
var logger = require('./logger');

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
            var username, room;

            client.on('connect compass', function(info) {
                room = info.hashcode;
                username = info.username;

                client.join(room);
                logger.info(username, 'joined room', room);

                // check if room existed
                if (!(room in userManager)) {
                    userManager[room] = {
                        usernameToColor: {},
                        colors: allColors.slice()
                    };
                }

                // make username unique
                while (username in userManager[room].usernameToColor)
                    username += 'x';

                // assign new username a color. TODO handle "too many users case"
                var r = Math.floor(Math.random() * userManager[room].colors.length);
                userManager[room].usernameToColor[username] = userManager[room].colors[r];
                userManager[room].colors.splice(r, 1);

                logger.debug('Manager after user joined', userManager);
                io.sockets.in(room).emit('user joined', userManager[room]);
            }); // connect compass

            client.on('disconnect', function(reason) {
                logger.info(username, 'left room', room);

                if (!(userManager[room])) return; // TODO log this
                var c = userManager[room].usernameToColor[username];
                delete userManager[room].usernameToColor[username];

                // if no user left, delete room
                if (_.isEmpty(userManager[room].usernameToColor)) {
                    delete userManager[room];
                } else {
                    userManager[room].colors.push(c);
                    io.sockets.in(room).emit('user left', userManager[room]);
                }
                logger.debug('Manager after user left', userManager);
            }); // disconnect

            client.on('new note', function(newNote) {
                Compass.findOne({id: room}, function(err, compass) {
                    if (err) logger.error('Error finding compass with ID', room, err);

                    if (!(userManager[room])) logger.debug('Creating a note for a room that does not exist!', info);

                    Compass.findByIdAndUpdate(
                        compass._id,
                        {$push: {notes: newNote}},
                        {$safe: true, upsert: false, new: true},
                        function (err, newCompass) {
                            if (err) logger.error('Error updating compass with ID', room, err);

                            var last = newCompass.notes.length - 1;

                            logger.info(username, 'created a note');
                            logger.debug(username, 'created a note', newNote);
                            io.sockets.in(room).emit('add note', newCompass.notes[last]);
                        }
                    );
                });
            }); // new note

            client.on('move note', function(info) {
                Compass.findOne({id: room}, function(err, compass) {
                    if (err) logger.error('Error finding compass with ID', room, err);

                    if (!(userManager[room])) logger.debug('Moving a note for a room that does not exist', info);

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
                            if (err) logger.error('Error updating compass with ID', room, err);

                            logger.info(username, 'moved a note');
                            logger.debug(username, 'moved a note', changed);
                            io.sockets.in(room).emit('refresh notes', newCompass.notes);
                        }
                    );
                });
            }); // move note

            client.on('edit note', function(info) {
                Compass.findOne({id: room}, function(err, compass) {
                    if (err) logger.error('Error finding compass with ID', room, err);

                    if (!(userManager[room])) logger.debug('Moving a note for a room that does not exist', info);

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
                            if (err) logger.error('Error updating compass with ID', room, err);

                            logger.info(username, 'edited a note');
                            logger.debug(username, 'edited a note', changed);
                            io.sockets.in(room).emit('refresh notes', newCompass.notes);
                        }
                    );
                });
            }); // edit note
        });
    }
}

module.exports = socketObject;

