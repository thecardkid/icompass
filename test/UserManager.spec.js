var UserManager = require('../utils/userManager.js');
var expect = require('chai').expect;

var code = '1a2b3c4d';
var username = 'bruce willis';

describe('user manager', function() {

    beforeEach(function() {
        this.manager = new UserManager();
    })

    afterEach(function() {
        this.manager = null;
    })

    it('return empty manager if room does not exist', function() {
        var m = this.manager.getRoom(code);
        expect(m.usernameToColor).to.be.an('object');
        expect(m.colors).to.have.lengthOf(6);
    })

    it('add user without an assigned color to a room', function() {
        var m = this.manager.addUser(code, username);
        expect(m.usernameToColor).to.have.keys(username);
        expect(m.colors).to.have.lengthOf(5);
    })

    it('add user with an assigned color to a room', function() {
        var color = this.manager.possibleColors[2];

        var m = this.manager.addUser(code, username, color);
        expect(m.usernameToColor).to.have.keys(username);
        expect(m.usernameToColor[username]).to.equal(color);
        expect(m.colors).to.not.have.members([color]);
    })

    it('prevent duplicate usernames', function() {
        this.manager.addUser(code, username);
        this.manager.addUser(code, username);
        var m = this.manager.addUser(code, username);
        expect(m.usernameToColor).to.have.keys(username, username+'2', username+'3');
        expect(m.colors).to.have.length(3);
    })

    it('remove a user', function() {
        this.manager.addUser(code, username);
        this.manager.addUser(code, username);
        var m = this.manager.removeUser(code, username);
        expect(m.usernameToColor).to.not.have.keys(username);
        expect(m.colors).to.have.length(5);
    })

    it('delete room if last remaining user leaves', function() {
        this.manager.addUser(code, username);
        var m = this.manager.removeUser(code, username);
        expect(m).to.be.null;
    })
})
