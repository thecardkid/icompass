var socketIO = require('socket.io');
var ObjectId = require('mongoose').Types.ObjectId;
var Compass = require('./models/compass');
var socket, io;

var usernameToColor = {};

var socketObject = {
    socketServer: function(server) {
        io = socketIO.listen(server);

        io.sockets.on('connection', function(s) {
            socket = s;
            socket.on('connect compass', connectCompass);
            socket.on('new note', makeNote);
        });
    }
}

var connectCompass = function(info) {
    socket.compassID = info.hashcode;
    socket.join(info.hashcode);
    io.sockets.in(socket.compassID).emit('user joined', info.username);
}

var makeNote = function(info) {
    Compass.findOne({id: socket.compassID}, function(err, compass) {
        if (err) return console.error(err);

        var newNote = {
            user: info.user,
            text: info.text,
            quadrant: info.type
        };

        Compass.findByIdAndUpdate(
            compass._id,
            {$push: {notes: newNote}},
            {$safe: true, upsert: false, new: true},
            function (err, newCompass) {
                if (err) return console.error(err);

                var last = newCompass.notes.length - 1;

                io.sockets.in(socket.compassID).emit('update notes', newCompass.notes[last]);
            }
        );
    });
}

module.exports = socketObject;

