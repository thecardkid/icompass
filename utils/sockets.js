var socketIO = require('socket.io');
var Compass = require('../models/compass.js');
var _ = require('underscore');
var UserManager = require('./userManager.js');
var io;
var logger = require('./logger.js');
var MODES = require('./constants.js').MODES;

var Manager = new UserManager();

var socketObject = {
    socketServer: function(server) {
        io = socketIO.listen(server);

        io.sockets.on('connection', function(client) {
            var joinRoom = function(data) {
                client.room = data.code;
                client.username = data.username;
                client.compassId = data.compassId;
                client.join(client.room);
            }


            client.on('create compass', function(data) {
                Compass.makeCompass(data.center, function(compass) {
                    client.emit('compass ready', {
                        code: compass.edit,
                        mode: MODES.EDIT,
                        compass: compass,
                        username: data.username
                    });
                });
            });


            client.on('find compass', function(data) {
                Compass.findCode(data.code, function(compass, mode) {
                    if (compass === null) return client.emit('compass null');

                    client.emit('compass ready', {
                        code: data.code,
                        mode: mode,
                        compass: compass,
                        username: data.username
                    });
                });
            });


            client.on('connect compass', function(data) {
                var o = Manager.addUser(data.code, data.username);
                data.username = o.newUser;
                joinRoom(data);
                logger.info(client.username, 'joined room', client.room);

                logger.debug('Manager after user joined', o.manager);
                client.emit('assigned name', o.newUser);
                io.sockets.in(client.room).emit('update users', o.manager);
            });


            client.on('disconnect', function(reason) {
                logger.info(client.username, 'left room', client.room, 'because', reason);

                var m = Manager.removeUser(client.room, client.username);
                logger.debug('Manager after user left', m);
                io.sockets.in(client.room).emit('update users', m);
            });


            client.on('reconnected', function(data) {
                joinRoom(data);
                logger.info(client.username, 'rejoined room', client.room);

                var o = Manager.addUser(client.room, client.username, data.color);
                logger.debug('Manager after user reconnected', o.manager);
                io.sockets.in(client.room).emit('update users', o.manager);
            })


            client.on('message', function(msg) {
                logger.debug(client.username, 'sent a message to', client.room);
                io.sockets.in(client.room).emit('new message', msg);
            })


            client.on('new note', function(newNote) { // new note
                Compass.addNote(client.compassId, newNote, function(newCompass) {
                    logger.info(client.username, 'created a note');
                    logger.debug(client.username, 'created a note', newNote);
                    io.sockets.in(client.room).emit('update notes', newCompass.notes);
                });
            });


            client.on('update note', function(updatedNote) {
                Compass.updateNote(client.compassId, updatedNote, function(c) {
                    logger.info(client.username, 'updated a note');
                    logger.debug(client.username, 'updated a note', updatedNote);
                    io.sockets.in(client.room).emit('update notes', c.notes);
                });
            });


            /* WARNING: Testing purposes only */
            client.on('fake disconnect', function(data) {
                Manager.removeUser(client.room, client.username);
            })
        });
    }
}

module.exports = socketObject;

