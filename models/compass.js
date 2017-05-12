var mongoose = require('mongoose');
var logger = require('../logger.js');

var Schema = mongoose.Schema;

var compassSchema = mongoose.Schema({
    id: {type: String},
    center: String,
    notes: [{
        color: String,
        text: String,
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
//
module.exports = mongoose.model('Compass', compassSchema);
