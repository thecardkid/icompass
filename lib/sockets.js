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
                const text = 'Access your compass via this link ' +
                    `${HOST}compass/edit/${data.editCode}/${data.username}`;

                Mail.sendMessage(text, data.email, function(status) {
                    client.emit('mail status', status);
                });
            });


            client.on('create timer', function(min, sec, startTime) {
                io.sockets.in(client.room).emit('start timer', min, sec, startTime);
            });


            client.on('cancel timer', function() {
                io.sockets.in(client.room).emit('all cancel timer');
            });


            client.on('create compass', function(data) {
                Compass.makeCompass(data.topic, function(compass) {
                    logger.debug('Created compass with topic', data.topic, compass._id);
                    client.emit('compass ready', {
                        success: !!compass,
                        topic: data.topic,
                        code: compass.editCode,
                    });
                });
            });

            client.on('set center', function(data) {
                Compass.setCenter(data.id, data.center, function(compass) {
                  logger.debug(`Set center to ${data.center} for compass ${data.id}`);
                  if (!!compass) {
                    client.emit('center set', data.center);
                  }
                });
            });

            client.on('find compass', function(data) {
                Compass.findCode(data.code, function(compass, viewOnly) {
                    client.emit('compass ready', {
                        success: !!compass,
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
                Compass.deleteNote(client.compassId, noteId, function(notes, deletedIdx) {
                    logger.info(client.username, 'deleted note', noteId, 'in compass', client.compassId);
                    io.sockets.in(client.room).emit('update notes', notes);
                    io.sockets.in(client.room).emit('deleted notes', deletedIdx);
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
                if (client.username) {
                    logger.info(client.username, 'left room', client.room, 'because', reason);
                    var m = Manager.removeUser(client.room, client.username);
                    io.sockets.in(client.room).emit('user left', {users: m, left: client.username});
                }
            });


            client.on('reconnected', function(data) {
                joinRoom(data);
                logger.info(client.username, 'rejoined room', client.room);

                var o = Manager.addUser(client.room, client.username, data.color);
                io.sockets.in(client.room).emit('user joined', {users: o.manager, joined: client.username});
            });


            client.on('message', function(msg) {
                io.sockets.in(client.room).emit('new message', msg);
            });


            client.on('new note', function(newNote) {
                Compass.addNote(client.compassId, newNote, function(c) {
                    logger.info(client.username, 'created a note', c.notes.slice(-1).pop()._id, 'in compass', client.compassId);
                    io.sockets.in(client.room).emit('update notes', c.notes);
                });
            });


            client.on('update note', function(updatedNote) {
                Compass.updateNote(client.compassId, updatedNote, function(c) {
                    logger.info(client.username, 'updated a note', updatedNote._id, 'in compass', client.compassId);
                    io.sockets.in(client.room).emit('update notes', c.notes);
                });
            });


            client.on('bulk update notes', function(noteIds, transformation) {
                Compass.bulkUpdateNotes(client.compassId, noteIds, transformation, function(c) {
                    logger.info(client.username, 'bulk edited notes', noteIds, 'in compass', client.compassId);
                    io.sockets.in(client.room).emit('update notes', c.notes);
                });
            });


            client.on('bulk delete notes', function(noteIds) {
                Compass.deleteNotes(client.compassId, noteIds, function(notes, deletedIdx) {
                    logger.info(client.username, 'deleted notes', noteIds, 'in compass', client.compassId);
                    io.sockets.in(client.room).emit('update notes', notes);
                    io.sockets.in(client.room).emit('deleted notes', deletedIdx);
                });
            });
        });
    }
};
