"use strict";

const mongoose = require('mongoose');

const CarteSchema = new mongoose.Schema({
    cue: String,
    show: String,
    rep: Number
});

module.exports = mongoose.model('Carte', CarteSchema);