'use strict';

var socketIO = require('socket.io');
var io;
var logger = require('./logger');

module.exports = {
    connect: function(server) {
        io = socketIO.listen(server);

        io.sockets.on('connection', function(client) {
            console.log('CONNECTION');
            var onevent = client.onevent;
            client.onevent = function (packet) {
                var args = packet.data || [];
                onevent.call (this, packet);    // original call
                packet.data = ["*"].concat(args);
                onevent.call(this, packet);      // additional call to catch-all
            };

            client.on('*', function(event, data) {
                console.log(event);
                console.log(data);
            });


            client.on('create compass', function(data) {
                console.log('create compass', data);
                // client.emit('compass ready', {
                //     success: true,
                //     center: data.center,
                //     code: '12345678'
                // });
            });
        });
    }
};
