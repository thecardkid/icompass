var assert = require('assert');
var socket = require('../sockets.js');
var io = require('socket.io-client');
var expect = require('chai').expect;

var socketURL = 'http://localhost:8080';
var options = {
    transports: ['websocket'],
    forceNew: true
};

var client;
var code = '1a2b3c4d';
var user1 = {hashcode: code, username: 'Hieu', manager: {}};
var user2 = {hashcode: code, username: 'Jordan', manager: {}};
var user3 = {hashcode: code, username: 'Bam', manager: {}};

function connect() {
    return io.connect(socketURL, options);
}

describe('socket backend operations', function() {

    beforeEach(function(done) {
        client = connect();
        client.on('connect', function() {
            client.emit('connect compass', user1)
            done();
        })
    })

    afterEach(function(done) {
        client.disconnect();
        done();
    })

    describe('user joined events', function() {
        it('return correct user manager for room creator', function(done) {
            client.on('user joined', function(users) {
                expect(users.usernameToColor).to.include.keys(user1.username);
                expect(users.colors).to.have.lengthOf(5);
                done();
            })
        })

        it('return correct user manager for successive user joins', function(done) {
            client2 = connect();;

            client2.on('connect', function() {
                client2.emit('connect compass', user2);

                client3 = connect();

                client3.on('connect', function() {
                    client3.emit('connect compass', user3);

                    client3.on('user joined', function(users) {
                        expect(users.usernameToColor).to.include.keys(user1.username, user2.username, user3.username);
                        expect(users.colors).to.have.lengthOf(3);
                        client3.disconnect();
                        client2.disconnect();
                        done();
                    })
                })
            })
        })

        it('return correct user manager after user disconnects', function(done) {
            client2 = connect();
            client2.on('connect', function() {
                client2.emit('connect compass', user2);
                client2.disconnect();

                client.on('user left', function(users) {
                    expect(users.usernameToColor).to.include.keys(user1.username);
                    expect(users.colors).to.have.lengthOf(5);
                    done();
                })
            });
        })

        it('accept client-side manager if it can\'t find the room', function(done) {
            var manager = {
                usernameToColor: {
                    'one': '#aabbcc',
                    'two': '#ddeeff',
                    'existing': '#223322'
                },
                colors: ['#111111', '#222222', '#333333']
            };

            clientExisting = connect();
            clientExisting.on('connect', function() {
                client2.emit('new note', {
                    x: 0.5,
                    y: 0.5,
                    text: 'a mock note',
                    color: '#223322',
                    manager: manager
                });

                client.on('refresh users', function(users) {
                    expect(users.usernameToColor).to.include.keys('one', 'two', 'existing');
                    expect(users.colors).to.have.lengthOf(3);
                    clientExisting.disconnect();
                    done();
                })
            })
        })
    })
})

