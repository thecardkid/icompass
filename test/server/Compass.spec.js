'use strict';

import mongoose from 'mongoose';
import { expect } from 'chai';
import Compass from '../../models/compass';
import _ from 'underscore';

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

function addNotes(DUT, n, cb) {
    let i = 0;
    let incr = (compass) => {
        i += 1;
        if (i === n) cb(compass);
    };

    for (let j=0; j<n; j++)
        Compass.addNote(DUT._id, NOTE, incr);
}

describe('Compass: models', () => {
    let DUT;

    before(done => {
        if (mongoose.connection.readyState === 0) {
            mongoose.connect('mongodb://localhost/test', (err) => {
                if (err) throw err;
                done();
            });
        }
    });

    after(done => {
        clearDB(done);
        mongoose.disconnect();
    });

    beforeEach(done => {
        Compass.makeCompass(CENTER, c => {
            DUT = c;
            done();
        });
    });

    afterEach(done => {
        Compass.remove({_id: DUT._id}, done);
    });

    it('#makeCompass', (done) => {
        expect(DUT.editCode).to.have.lengthOf(8);
        expect(DUT.viewCode).to.have.lengthOf(8);
        expect(DUT.center).to.equal(CENTER);
        expect(DUT.notes).to.be.empty;
        done();
    });

    it('#findByEditCode', (done) => {
        Compass.findByEditCode(DUT.editCode,(c) => {
            expect(c.editCode).to.not.be.undefined;
            expect(c.viewCode).to.not.be.undefined;
            expect(c.center).to.equal(CENTER);
            done();
        });
    });

    it('#findByViewCode', (done) => {
        Compass.findByViewCode(DUT.viewCode, (c) => {
            expect(c.editCode).to.be.undefined;
            expect(c.viewCode).to.not.be.undefined;
            expect(c.center).to.equal(CENTER);
            done();
        });
    });

    it('#findCode', (done) => {
        let found = false;

        Compass.findCode(DUT.editCode, (c, viewOnly) => {
            expect(c).to.not.be.null;
            expect(viewOnly).to.equal(false);
            if (found) done();
            else found = true;
        });

        Compass.findCode(DUT.viewCode, (c, viewOnly) => {
            expect(c).to.not.be.null;
            expect(viewOnly).to.equal(true);
            if (found) done();
            else found = true;
        });
    });

    it('#addNote', (done) => {
        Compass.addNote(DUT._id, NOTE, (c) => {
            DUT = c;
            expect(c.notes).to.have.lengthOf(1);
            done();
        });
    });

    it('#updateNote', (done) => {
        addNotes(DUT, 3, compass => {
            let updated = Object.assign({}, compass.notes[1]._doc);
            updated.text = 'Updated';
            updated._id = updated._id.toString(); // emulate client side request
            Compass.updateNote(compass._id, updated, (c) => {
                expect(c.notes).to.have.lengthOf(3);
                expect(c.notes[1].text).to.equal('Updated'); // expect no ordering changes
                done();
            });
        });
    });

    it('#bulkUpdateNotes', (done) => {
        Compass.addNote(DUT._id, NOTE, (c) => {
            let noteIds = _.map(c.notes, note => note._id.toString());
            DUT = c;

            let transformation = {
                style: { bold: true, italic: false, underline: true }
            };
            Compass.bulkUpdateNotes(DUT._id, noteIds, transformation, (c) => {
                _.map(c.notes, (note) => {
                    expect(note.style.bold).to.be.true;
                    expect(note.style.italic).to.be.false;
                    expect(note.style.underline).to.be.true;
                });
                done();
            });
        });
    });

    it('#deleteNote', (done) => {
        addNotes(DUT, 2, compass => {
            Compass.deleteNote(compass._id, compass.notes[1]._id.toString(), (notes, deletedIdx) => {
                expect(notes).to.have.lengthOf(1);
                expect(deletedIdx).to.have.lengthOf(1);
                expect(deletedIdx[0]).to.equal(1);
                done();
            });
        });
    });

    it('#deleteNotes', (done) => {
        addNotes(DUT, 4, compass => {
            let noteIds = _.map(compass.notes, note => note._id.toString());
            noteIds.splice(1, 1);
            expect(noteIds).to.have.lengthOf(3);

            Compass.deleteNotes(DUT._id, noteIds, (notes, deletedIdx) => {
                expect(notes).to.have.lengthOf(1);
                expect(deletedIdx).to.have.lengthOf(3);
                expect(deletedIdx[0]).to.equal(0);
                expect(deletedIdx[1]).to.equal(2);
                expect(deletedIdx[2]).to.equal(3);
                done();
            });
        });
    });
});
