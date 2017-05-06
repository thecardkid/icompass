var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var compassSchema = mongoose.Schema({
    id: {type: String},
    center: String,
    notes: [{
        quadrant: String,
        user: String,
        text: String
    }],
});

module.exports = mongoose.model('Compass', compassSchema);
