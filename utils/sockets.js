var socketIO = require('socket.io');
var Compass = require('../models/compass');
var _ = require('underscore');
var UserManager = require('./userManager.js');
var io;
var logger = require('./logger.js');

var Manager = new UserManager();

var socketObject = {
    socketServer: function(server) {
        io = socketIO.listen(server);

        io.sockets.on('connection', function(client) {
            var joinRoom = function(data) {
                client.room = data.hashcode;
                client.username = data.username;
                client.compassId = data.compassId;
                client.join(client.room);
            }

            client.on('connect compass', function(data) {
                joinRoom(data);
                logger.info(client.username, 'joined room', client.room);

                var m = Manager.addUser(client.room, client.username);
                logger.debug('Manager after user joined', m);
                io.sockets.in(client.room).emit('update users', m);
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

                var m = Manager.addUser(client.room, client.username, data.color);
                logger.debug('Manager after user reconnected', m);
                io.sockets.in(client.room).emit('update users', m);
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

