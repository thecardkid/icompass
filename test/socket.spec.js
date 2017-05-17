var socket = require('../utils/sockets.js');
var io = require('socket.io-client');
var expect = require('chai').expect;

var socketURL = 'http://localhost:8080';
var options = {
    transports: ['websocket'],
    forceNew: true
};

var client;
var code = '1a2b3c4d';
var compassId = '1234567890';
var user1 = {code: code, username: 'Hieu', compassId: compassId};
var user2 = {code: code, username: 'Jordan', compassId: compassId};
var user3 = {code: code, username: 'Bam', compassId: compassId};

function connect() {
    return io.connect(socketURL, options);
}

describe('socket connection events', function() {

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

    it('return correct user manager for room creator', function(done) {
        client.on('update users', function(users) {
            expect(users.usernameToColor).to.include.keys(user1.username);
            expect(users.colors).to.have.lengthOf(5);
            done();
        })
    })

    it('return correct user manager for successive user joins', function(done) {
        client2 = connect();

        client2.on('connect', function() {
            client2.emit('connect compass', user2);

            client3 = connect();

            client3.on('connect', function() {
                client3.emit('connect compass', user3);

                client3.on('update users', function(users) {
                    expect(users.usernameToColor).to.include.keys(user1.username, user2.username, user3.username);
                    expect(users.colors).to.have.lengthOf(3);
                    client3.disconnect();
                    client2.disconnect();
                    done();
                })
            })
        })
    })

    it('return correct name when user with duplicate name joins', function(done) {
        client2 = connect();

        client2.on('connect', function() {
            client2.emit('connect compass', user1);

            client2.on('assigned name', function(username) {
                expect(username).to.equal(user1.username+'2');
                client2.disconnect();
                done();
            })
        })
    })

    it('return correct user manager after user disconnects', function(done) {
        client2 = connect();
        client2.on('connect', function() {
            client2.emit('connect compass', user2);
            client2.disconnect();

            var i = 0;
            client.on('update users', function(users) {
                if (i++ === 1) {
                    expect(users.usernameToColor).to.include.keys(user1.username);
                    expect(users.colors).to.have.lengthOf(5);
                    done();
                }
            })
        });
    })

    it('return correct manager after user reconnects', function(done) {
        var recon = JSON.parse(JSON.stringify(user1));
        recon.color = '#FFAE27';
        client.emit('fake disconnect', 'reason');
        client.emit('reconnected', recon);

        var i = 0;
        client.on('update users', function(users) {
            if (i++ === 1) { // must wait for second user joined emission
                expect(users.usernameToColor).to.include.keys(recon.username);
                expect(users.usernameToColor[recon.username]).to.equal(recon.color);
                expect(users.colors).to.have.length(5);
                expect(users.colors).to.not.have.members([recon.color]);
                done();
            }
        })
    })

    it('broadcast messages to other users', function(done) {
        client2 = connect();;

        client2.on('connect', function() {
            client2.emit('connect compass', user2);

            client3 = connect();

            client3.on('connect', function() {
                client3.emit('connect compass', user3);
                var text = 'Hello!';
                var received = false;
                client3.emit('message', {username: user3.username, text: text});

                client2.on('new message', function(msg) {
                    expect(msg.username).to.equal(user3.username);
                    expect(msg.text).to.equal(text);
                    if (received) done();
                    received = true;
                })

                client.on('new message', function(msg) {
                    expect(msg.username).to.equal(user3.username);
                    expect(msg.text).to.equal(text);
                    if (received) done();
                    received = true;
                })
            })
        })
    })
})

