var mongoose = require("mongoose");

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

module.exports = mongoose.model('Compass', compassSchema);
