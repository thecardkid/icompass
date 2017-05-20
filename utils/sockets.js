var socketIO = require('socket.io');
var Compass = require('../models/compass.js');
var _ = require('underscore');
var UserManager = require('./userManager.js');
var Mailer = require('./mailer.js');
var io;
var logger = require('./logger.js');
var MODES = require('./constants.js').MODES;

var Manager = new UserManager();
var Mail = new Mailer();

const HOST = (process.env.NODE_ENV === 'production') ? 'http://icompass.hieuqn.com/' : 'http://localhost:8080/'

module.exports = {
    socketServer: function(server) {
        io = socketIO.listen(server);

        io.sockets.on('connection', function(client) {
            var joinRoom = function(data) {
                client.room = data.code;
                client.username = data.username;
                client.compassId = data.compassId;
                client.join(client.room);
            };

            var sendMail = function(compass, data) {
                var text = 'Edit code: ' + compass.editCode +
                    '\nView code: ' + compass.viewCode + '\n\n' +
                    'Visit this link for a pre-filled form: ' +
                    HOST + compass.editCode + '/' + data.username;

                Mail.sendMessage(text, data.email, function(status) {
                    if (status) client.emit('mail sent');
                    else client.emit('mail not sent');
                });
            };


            client.on('create compass', function(data) {
                Compass.makeCompass(data.center, function(compass) {
                    if (data.email)
                        sendMail(compass, data);
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


            client.on('connect compass', function(data) {
                var o = Manager.addUser(data.code, data.username);
                data.username = o.newUser;
                joinRoom(data);
                logger.info(client.username, 'joined room', client.room);

                logger.debug('Manager after user joined', o.manager);
                client.emit('assigned name', o.newUser);
                io.sockets.in(client.room).emit('user joined', {users: o.manager, joined: client.username});
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


            client.on('new note', function(newNote) { // new note
                Compass.addNote(client.compassId, newNote, function(newCompass) {
                    logger.info(client.username, 'created a note', newNote._id);
                    logger.debug(client.username, 'created a note', newNote);
                    io.sockets.in(client.room).emit('update notes', newCompass.notes);
                });
            });


            client.on('update note', function(updatedNote) {
                Compass.updateNote(client.compassId, updatedNote, function(c) {
                    logger.info(client.username, 'updated a note', updatedNote._id);
                    logger.debug(client.username, 'updated a note', updatedNote);
                    io.sockets.in(client.room).emit('update notes', c.notes);
                });
            });


            /* WARNING: Testing purposes only */
            client.on('fake disconnect', function(data) {
                Manager.removeUser(client.room, client.username);
            });
        });
    }
}

