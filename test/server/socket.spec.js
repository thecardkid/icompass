import socket from '../../utils/sockets.js';
import io from 'socket.io-client';
import { expect } from 'chai';

let client;

const socketURL = 'http://localhost:8080';
const options = {
    transports: ['websocket'],
    forceNew: true
};
const code = '1a2b3c4d';
const compassId = '1234567890';
const user1 = {code: code, username: 'Hieu', compassId: compassId};
const user2 = {code: code, username: 'Jordan', compassId: compassId};
const user3 = {code: code, username: 'Bam', compassId: compassId};

function connect() {
    return io.connect(socketURL, options);
}

describe('socket connection events', () => {

    beforeEach((done) => {
        client = connect();
        client.on('connect', () => {
            client.emit('connect compass', user1);
            done();
        })
    })

    afterEach((done) => {
        client.disconnect();
        done();
    })

    it('return correct user manager for room creator', (done) => {
        client.on('user joined', (data) => {
            expect(data.users.usernameToColor).to.include.keys(user1.username);
            expect(data.users.colors).to.have.lengthOf(5);
            expect(data.joined).to.equal(user1.username);
            done();
        })
    })

    it('return correct user manager for successive user joins', (done) => {
        let client2 = connect();

        client2.on('connect', () => {
            client2.emit('connect compass', user2);

            let client3 = connect();

            client3.on('connect', () => {
                client3.emit('connect compass', user3);

                client3.on('user joined', (data) => {
                    expect(data.users.usernameToColor).to.include.keys(user1.username, user2.username, user3.username);
                    expect(data.users.colors).to.have.lengthOf(3);
                    expect(data.joined).to.equal(user3.username);
                    client3.disconnect();
                    client2.disconnect();
                    done();
                })
            })
        })
    })

    it('return correct name when user with duplicate name joins', (done) => {
        let client2 = connect();

        client2.on('connect', () => {
            client2.emit('connect compass', user1);

            client2.on('assigned name', (username) => {
                expect(username).to.equal(user1.username+'2');
                client2.disconnect();
                done();
            })
        })
    })

    it('return correct user manager after user disconnects', (done) => {
        let client2 = connect();
        client2.on('connect', () => {
            client2.emit('connect compass', user2);
            client2.disconnect();

            client.on('user left', (data) => {
                expect(data.users.usernameToColor).to.include.keys(user1.username);
                expect(data.users.colors).to.have.lengthOf(5);
                expect(data.left).to.equal(user2.username);
                done();
            })
        });
    })

    it('return correct manager after user reconnects', (done) => {
        let recon = JSON.parse(JSON.stringify(user1));
        recon.color = '#FFAE27';
        client.emit('fake disconnect', 'reason');
        client.emit('reconnected', recon);

        let i = 0;
        client.on('user joined', function(data) {
            if (i++ === 1) { // must wait for second user joined emission
                expect(data.users.usernameToColor).to.include.keys(recon.username);
                expect(data.users.usernameToColor[recon.username]).to.equal(recon.color);
                expect(data.users.colors).to.have.length(5);
                expect(data.users.colors).to.not.have.members([recon.color]);
                done();
            }
        })
    })

    it('broadcast messages to other users', (done) => {
        let client2 = connect();;

        client2.on('connect', () => {
            client2.emit('connect compass', user2);

            let client3 = connect();

            client3.on('connect', () => {
                client3.emit('connect compass', user3);
                let text = 'Hello!';
                let received = false;
                client3.emit('message', {username: user3.username, text: text});

                client2.on('new message', (msg) => {
                    expect(msg.username).to.equal(user3.username);
                    expect(msg.text).to.equal(text);
                    if (received) done();
                    received = true;
                })

                client.on('new message', (msg) => {
                    expect(msg.username).to.equal(user3.username);
                    expect(msg.text).to.equal(text);
                    if (received) done();
                    received = true;
                })
            })
        })
    })
})

