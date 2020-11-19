"use strict";

const mongoose = require('mongoose');



const PartieSchema = new mongoose.Schema({
    date: Date,
    invites: [String],
    pioche: [Number],
    tapis: [Number]
});

module.exports = mongoose.model('Partie', PartieSchema);