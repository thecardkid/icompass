let mongoose = require('mongoose');
let _ = require('underscore');

let logger = require('../lib/logger');
let DefaultCompass = require('./defaultCompass');

function generateUUID() {
  let d = new Date().getTime();
  let uuid = 'xxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

mongoose.Promise = global.Promise;
let compassSchema = mongoose.Schema({
  editCode: String,
  viewCode: String,
  topic: String,
  center: String,
  notes: [{
    user: String,
    color: String,
    text: String,
    style: {
      bold: Boolean,
      italic: Boolean,
      underline: Boolean,
    },
    doodle: String,
    isImage: Boolean,
    x: Number,
    y: Number,
  }],
});

compassSchema.statics.makeCompass = function(topic, cb) {
  let newCompass = Object.assign({}, DefaultCompass, {
    editCode: generateUUID(),
    viewCode: generateUUID(),
    topic: topic,
  });
  this.create(newCompass, function(err, compass) {
    if (err) return logger.error('Could not create compass with topic', topic, err);

    cb(compass);
  });
};

compassSchema.statics.setCenter = function(id, center, cb) {
  this.findByIdAndUpdate(
    id,
    { $set: { center: center } },
    { $safe: true, upsert: false, new: true },
    function(err, compass) {
      if (err) logger.error(`Could not set center to ${center} for compass ${id}`);
      cb(compass);
    }
  );
};

compassSchema.statics.addNote = function(id, newNote, cb) {
  this.findByIdAndUpdate(
    id,
    { $push: { notes: newNote } },
    { $safe: true, upsert: false, new: true },
    function(err, compass) {
      if (err) logger.error('Could not add note to compass', id, newNote, err);
      cb(compass);
    }
  );
};

compassSchema.statics.updateNote = function(id, updatedNote, cb) {
  this.findOne({ _id: id }, function(err, c) {
    if (err) logger.error('Could not find compass to update note', id, updatedNote, err);

    let note;
    for (let i = 0; i < c.notes.length; i++) {
      note = c.notes[i];
      if (note._id.toString() === updatedNote._id) {
        Object.assign(note, updatedNote);
      }
    }

    c.save(function(err, updatedCompass) {
      if (err) logger.error('Could not update note in compass', id, updatedNote, err);
      cb(updatedCompass);
    });
  });
};

compassSchema.statics.bulkUpdateNotes = function(id, noteIds, transformation, cb) {
  this.findOne({ _id: id }, function(err, c) {
    if (err) logger.error('Could not find compass to update note', id, noteIds, err);
    let s = transformation.style;

    c.notes = _.map(c.notes, function(note) {
      if (_.contains(noteIds, note._id.toString())) {
        if (!note.doodle) {
          if (s.bold !== null) note.style.bold = s.bold;
          if (s.italic !== null) note.style.italic = s.italic;
          if (s.underline !== null) note.style.underline = s.underline;
        }
        if (transformation.color) note.color = transformation.color;
      }
      return note;
    });

    c.save(function(err, updatedCompass) {
      if (err) logger.error('Could not update notes in compass', id, noteIds, err);
      cb(updatedCompass);
    });
  });
};

compassSchema.statics.findByEditCode = function(code, cb) {
  this.findOne({ editCode: code }, function(err, c) {
    if (err) logger.error('Could not find compass for editing', code, err);
    cb(c);
  });
};

compassSchema.statics.findByViewCode = function(code, cb) {
  this.findOne({ viewCode: code }, function(err, c) {
    if (err) logger.error('Could not find compass for viewing', code, err);
    if (c === null) return cb(null);

    let copy = JSON.parse(JSON.stringify(c));
    delete copy.editCode;
    cb(copy);
  });
};

compassSchema.statics.findCode = function(code, cb) {
  let schema = this;
  schema.findByEditCode(code, function(compassEdit) {
    if (compassEdit === null) {
      schema.findByViewCode(code, function(compassView) {
        if (compassView === null)
          return cb(null, null);

        cb(compassView, true);
      });
    } else {
      cb(compassEdit, false);
    }
  });
};

compassSchema.statics.deleteNote = function(compassId, noteId, cb) {
  this.deleteNotes(compassId, [noteId], cb);
};

compassSchema.statics.deleteNotes = function(compassId, noteIds, cb) {
  this.findOne({ _id: compassId }, function(err, c) {
    if (err) logger.error('Could not find compass to delete notes', compassId, noteIds, err);

    let deletedIdx = [];
    c.notes = _.filter(c.notes, function(e, idx) {
      if (_.contains(noteIds, e._id.toString())) {
        deletedIdx.push(idx);
        return false;
      }

      return true;
    });

    c.save(function(err, updatedCompass) {
      if (err) logger.error('Could not delete notes', compassId, noteIds, err);
      cb(updatedCompass.notes, deletedIdx);
    });
  });
};

module.exports = mongoose.model('Compass', compassSchema);

