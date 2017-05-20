var mongoose = require('mongoose');
var logger = require('../utils/logger.js');
var MODES = require('../utils/constants.js').MODES;
var DefaultCompass = require('../models/defaultCompass.js');
var Schema = mongoose.Schema;
var _ = require('underscore');

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

var compassSchema = mongoose.Schema({
    editCode: String,
    viewCode: String,
    center: String,
    notes: [{
        color: String,
        text: String,
        doodle: String,
        isImage: Boolean,
        x: Number,
        y: Number
    }]
});

compassSchema.statics.addNote = function(id, newNote, cb) {
    this.findByIdAndUpdate(
        id,
        {$push: {notes: newNote}},
        {$safe: true, upsert: false, new: true},
        function(err, compass) {
            if (err) logger.error('Could not add note to compass', id, newNote, err);
            cb(compass);
        }
    );
}

compassSchema.statics.updateNote = function(id, updatedNote, cb) {
    this.findOne({_id: id}, function(err, c) {
        if (err) logger.error('Could not find compass to update note', id, updateNote, err);

        var note;
        for (var i=0; i<c.notes.length; i++) {
            note = c.notes[i];
            if (note._id.toString() === updatedNote._id) {
                note.text = updatedNote.text;
                note.isImage = updatedNote.isImage;
                note.x = updatedNote.x;
                note.y = updatedNote.y;
            }
        }

        c.save(function(err, updatedCompass) {
            if (err) logger.error('Could not update note in compass', id, updatedNote, err);
            cb(updatedCompass);
        })
    })
}

compassSchema.statics.makeCompass = function(center, cb) {
    var newCompass = DefaultCompass;
    newCompass.editCode = generateUUID();
    newCompass.viewCode = generateUUID();
    newCompass.center = center;
    this.create(newCompass, function (err, compass) {
        if (err) return logger.error('Could not create compass with center', center, err);

        logger.debug('Created compass with center', center, compass._id);
        cb(compass);
    });
}

compassSchema.statics.findCode = function(code, cb) {
    var root = this;
    root.findOne({editCode: code}, function(err, compassEdit) {
        if (err) logger.error('Could not find compass for editing', code, err);

        if (!compassEdit) {
            root.findOne({viewCode: code}, function(err, compassView) {
                if (err) logger.error('Could not find compass for viewing', code, err);

                if (!compassView) {
                    cb(null, null);
                    return;
                }

                logger.debug('Found compass for viewing', compassView._id);
                var copy = JSON.parse(JSON.stringify(compassView));
                delete copy.editCode;
                // TODO delete comment code
                cb(copy, copy.viewCode, MODES.VIEW);
            });
        } else {
            logger.debug('Found compass for editing', compassEdit._id);
            cb(compassEdit, compassEdit.editCode, MODES.EDIT);
        }
    })
}

compassSchema.statics.deleteNote = function(compassId, noteId, cb) {
    this.findOne({_id: compassId}, function(err, c) {
        if (err) logger.error('Could not find compass to delete note', compassId, noteId, err);

        c.notes = _.filter(c.notes, function(e) {
            return e._id.toString() !== noteId;
        });

        c.save(function(err, updatedCompass) {
            if (err) logger.error('Could not delete note', compassId, noteId, err);

            cb(updatedCompass.notes);
        });
    });
}

module.exports = mongoose.model('Compass', compassSchema);

