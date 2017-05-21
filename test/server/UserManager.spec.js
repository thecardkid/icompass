var UserManager = require('../../utils/userManager.js');
var expect = require('chai').expect;

var code = '1a2b3c4d';
var username = 'bruce willis';

describe('user manager', function() {

    beforeEach(function() {
        this.manager = new UserManager();
    });

    afterEach(function() {
        this.manager = null;
    });

    it('return empty manager if room does not exist', function() {
        var m = this.manager.getRoom(code);
        expect(m.usernameToColor).to.be.an('object');
        expect(m.colors).to.have.lengthOf(6);
    });

    it('add user without an assigned color to a room', function() {
        var o = this.manager.addUser(code, username);
        expect(o.manager.usernameToColor).to.have.keys(username);
        expect(o.manager.colors).to.have.lengthOf(5);
        expect(o.newUser).to.equal(username);
    });

    it('add user with an assigned color to a room', function() {
        var color = this.manager.possibleColors[2];

        var o = this.manager.addUser(code, username, color);
        expect(o.manager.usernameToColor).to.have.keys(username);
        expect(o.manager.usernameToColor[username]).to.equal(color);
        expect(o.manager.colors).to.not.have.members([color]);
        expect(o.newUser).to.equal(username);
    });

    it('prevent duplicate usernames', function() {
        this.manager.addUser(code, username);
        this.manager.addUser(code, username);
        var o = this.manager.addUser(code, username);
        expect(o.manager.usernameToColor).to.have.keys(username, username+'2', username+'3');
        expect(o.manager.colors).to.have.length(3);
        expect(o.newUser).to.equal(username+'3');
    });

    it('remove a user', function() {
        this.manager.addUser(code, username);
        this.manager.addUser(code, username);
        var m = this.manager.removeUser(code, username);
        expect(m.usernameToColor).to.not.have.keys(username);
        expect(m.colors).to.have.length(5);
    });

    it('delete room if last remaining user leaves', function() {
        this.manager.addUser(code, username);
        var m = this.manager.removeUser(code, username);
        expect(m).to.be.null;
    });
});
