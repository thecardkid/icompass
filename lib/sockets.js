'use strict';

var socketIO = require('socket.io');
var io;

var Compass = require('../models/compass');
var UserManager = require('./userManager');
var Mailer = require('./mailer');
var logger = require('./logger');
var HOST = require('./constants').HOST;

var Manager = new UserManager();
var Mail = new Mailer();

module.exports = {
    connect: function(server) {
        io = socketIO.listen(server);

        io.sockets.on('connection', function(client) {
            var joinRoom = function(data) {
                client.room = data.code;
                client.username = data.username;
                client.compassId = data.compassId;
                client.join(client.room);
            };


            client.on('send mail', function(data) {
                var text = 'Access your compass via this link ' +
                    HOST + 'compass/edit/' + data.editCode + '/' + data.username;

                Mail.sendMessage(text, data.center, data.email, function(status) {
                    client.emit('mail status', status);
                });
            });


            client.on('create compass', function(data) {
                Compass.makeCompass(data.center, function(compass) {
                    logger.debug('Created compass with center', data.center, compass._id);
                    client.emit('compass ready', {
                        success: compass ? true : false,
                        center: data.center,
                        code: compass.editCode,
                    });
                });
            });


            client.on('find compass', function(data) {
                Compass.findCode(data.code, function(compass, viewOnly) {
                    client.emit('compass ready', {
                        success: compass ? true : false,
                        code: data.code,
                        viewOnly: viewOnly
                    });
                });
            });


            client.on('delete compass', function(id) {
                if (client.compassId !== id) return;

                Compass.remove({_id: id}, function(err) {
                    if (err) return logger.error(err);

                    logger.info(client.username, 'deleted compass', id);
                    io.sockets.in(client.room).emit('compass deleted');
                });
            });


            client.on('delete note', function(noteId) {
                Compass.deleteNote(client.compassId, noteId, function(notes) {
                    logger.info(client.username, 'deleted note', noteId, 'in compass', client.compassId);
                    io.sockets.in(client.room).emit('update notes', notes);
                });
            });


            client.on('find compass edit', function(data) {
                Compass.findByEditCode(data.code, function(compass) {
                    if (compass !== null) {
                        logger.debug('Found compass for editing', compass._id);
                        var o = Manager.addUser(data.code, data.username);
                        data.username = o.newUser;
                        data.compassId = compass._id.toString();
                        joinRoom(data);
                        logger.info(client.username, 'joined room', client.room);
                        logger.debug('Manager after user joined', o.manager);
                        io.sockets.in(client.room).emit('user joined', {users: o.manager, joined: client.username});
                    }

                    client.emit('compass found', {
                        compass: compass,
                        username: client.username || data.username,
                        viewOnly: false
                    });
                });
            });


            client.on('find compass view', function(data) {
                Compass.findByViewCode(data.code, function(compass) {
                    if (compass !== null) logger.info('request to view compass successful', compass._id);
                    client.emit('compass found', {
                        compass: compass,
                        username: data.username,
                        viewOnly: true
                    });
                });
            });


            client.on('disconnect', function(reason) {
                logger.info(client.username, 'left room', client.room, 'because', reason);

                var m = Manager.removeUser(client.room, client.username);
                logger.debug('Manager after user left', m);
                io.sockets.in(client.room).emit('user left', {users: m, left: client.username});
            });


            client.on('reconnected', function(data) {
                joinRoom(data);
                logger.info(client.username, 'rejoined room', client.room);

                var o = Manager.addUser(client.room, client.username, data.color);
                logger.debug('Manager after user reconnected', o.manager);
                io.sockets.in(client.room).emit('user joined', {users: o.manager, joined: client.username});
            });


            client.on('message', function(msg) {
                logger.info(client.username, 'sent a message to', client.room);
                io.sockets.in(client.room).emit('new message', msg);
            });


            client.on('new note', function(newNote) {
                Compass.addNote(client.compassId, newNote, function(c) {
                    logger.info(client.username, 'created a note', newNote._id);
                    delete newNote.doodle;
                    logger.debug(client.username, 'created a note', newNote);
                    io.sockets.in(client.room).emit('update notes', c.notes);
                });
            });


            client.on('update note', function(updatedNote) {
                Compass.updateNote(client.compassId, updatedNote, function(c) {
                    logger.info(client.username, 'updated a note', updatedNote._id);
                    delete updatedNote.doodle;
                    logger.debug(client.username, 'updated a note', updatedNote);
                    io.sockets.in(client.room).emit('update notes', c.notes);
                });
            });


            client.on('bulk update notes', function(noteIds, transformation) {
                Compass.bulkUpdateNotes(client.compassId, noteIds, transformation, function(c) {
                    logger.info(client.username, 'bulk edited notes');
                    io.sockets.in(client.room).emit('update notes', c.notes);
                });
            });


            client.on('bulk delete notes', function(noteIds) {
                Compass.deleteNotes(client.compassId, noteIds, function(notes) {
                    logger.info(client.username, 'deleted notes', noteIds, 'in compass', client.compassId);
                    io.sockets.in(client.room).emit('update notes', notes);
                });
            });


            /* WARNING: Testing purposes only */
            client.on('fake disconnect', function() {
                Manager.removeUser(client.room, client.username);
            });
        });
    }
};

