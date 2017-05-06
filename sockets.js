var socketIO = require('socket.io');
var ObjectId = require('mongoose').Types.ObjectId;
var Compass = require('./models/compass');
var _ = require('underscore');
var client, io;

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

                // check if room existed
                if (!(room in userManager)) {
                    userManager[room] = {
                        usernameToColor: {},
                        colors: allColors.slice()
                    };
                }

                // make username unique
                while (username in userManager[room].usernameToColor) {
                    username += 'x';
                }

                // assign new username a color. TODO handle "too many users case"
                var r = Math.floor(Math.random() * userManager[room].colors.length);
                userManager[room].usernameToColor[username] = userManager[room].colors[r];
                userManager[room].colors.splice(r, 1);

                // console.log(userManager);

                io.sockets.in(room).emit('user joined', userManager[room].usernameToColor);
            }); // connect compass

            client.on('disconnect', function(reason) {
                // console.log(username, 'disconnected from room', room);

                if (!(userManager[room])) return; // TODO log this
                var c = userManager[room].usernameToColor[username];
                delete userManager[room].usernameToColor[username];

                // if no user left, delete room
                if (_.isEmpty(userManager[room].usernameToColor)) {
                    delete userManager[room];
                } else {
                    userManager[room].colors.push(c);
                    io.sockets.in(room).emit('user left', userManager[room].usernameToColor);
                }
                // console.log(userManager);
            }); // disconnect

            client.on('new note', function(info) {
                Compass.findOne({id: room}, function(err, compass) {
                    if (err) return console.error(err);

                    if (!(userManager[room])) return; // TODO log this
                    var color = userManager[room].usernameToColor[info.user];

                    var newNote = {
                        color: color,
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

                            io.sockets.in(room).emit('update notes', newCompass.notes[last]);
                        }
                    );
                });
            });
        });
    }
}

var makeNote = function(info) {
}

module.exports = socketObject;

