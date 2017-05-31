'use strict';

import mongoose from 'mongoose';
import { expect } from 'chai';
import { MODES } from '../../lib/constants';
import Compass from '../../models/compass';

const CENTER = 'test suite';
const NOTE = {
    user: 'mocha',
    color: '#FFCCCC',
    text: 'hello, world',
    style: { bold: false, italic: false, underline: false },
    doodle: null,
    isImage: false,
    x: 0.5,
    y: 0.5
};

function clearDB(cb) {
    for (var i in mongoose.connection.collections)
        mongoose.connection.collections[i].remove(function() {});
    cb();
}

before((done) => {
    if (mongoose.connection.readyState === 0) {
        mongoose.connect('mongodb://localhost/test', (err) => {
            if (err) throw err;
            done();
        })
    }
})


after((done) => {
    clearDB(done);
    mongoose.disconnect();
})

describe('Compass: models', () => {
    let DUT;

    it('#makeCompass', (done) => {
        Compass.makeCompass(CENTER, (c) => {
            DUT = c;
            expect(DUT.editCode).to.have.lengthOf(8);
            expect(DUT.viewCode).to.have.lengthOf(8);
            expect(DUT.center).to.equal(CENTER);
            expect(DUT.notes).to.be.empty;
            done();
        })
    })

    it('#findByEditCode', (done) => {
        Compass.findByEditCode(DUT.editCode,(c) => {
            expect(c.editCode).to.not.be.undefined;
            expect(c.viewCode).to.not.be.undefined;
            expect(c.center).to.equal(CENTER);
            done();
        })
    })

    it('#findByViewCode', (done) => {
        Compass.findByViewCode(DUT.viewCode, (c) => {
            expect(c.editCode).to.be.undefined;
            expect(c.viewCode).to.not.be.undefined;
            expect(c.center).to.equal(CENTER);
            done();
        })
    })

    it('#findCode', (done) => {
        let found = false;

        Compass.findCode(DUT.editCode, (c, mode) => {
            expect(c).to.not.be.null;
            expect(mode).to.equal(MODES.EDIT);
            if (found) done();
            else found = true;
        })

        Compass.findCode(DUT.viewCode, (c, mode) => {
            expect(c).to.not.be.null;
            expect(mode).to.equal(MODES.VIEW);
            if (found) done();
            else found = true;
        })
    })

    it('#addNote', (done) => {
        Compass.addNote(DUT._id, NOTE, (c) => {
            DUT = c;
            expect(c.notes).to.have.lengthOf(1);
            done();
        })
    })

    it('#updateNote', (done) => {
        let updated = Object.assign({}, DUT.notes[0]._doc);
        updated.text = 'Updated';
        updated._id = updated._id.toString(); // emulate client side request
        Compass.updateNote(DUT._id, updated, (c) => {
            expect(c.notes).to.have.lengthOf(1);
            expect(c.notes[0].text).to.equal('Updated');
            done();
        })
    })

    it('#deleteNote', (done) => {
        Compass.deleteNote(DUT._id, DUT.notes[0]._id.toString(), (newNotes) => {
            expect(newNotes).to.be.empty;
            done();
        })
    })
})


