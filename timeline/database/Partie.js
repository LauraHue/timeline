"use strict";

const mongoose = require('mongoose');



const PartieSchema = new mongoose.Schema({
    _id: Number,
    date: Date,
    invites: [{joueur: String}],
    pioche: [{carte: Number}],
    tapis: [{carte: Number}]
});

module.exports = mongoose.model('Partie', PartieSchema);