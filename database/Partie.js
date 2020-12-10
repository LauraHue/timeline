"use strict";

const mongoose = require('mongoose');

const PartieSchema = new mongoose.Schema({ 
    date: Date,
    invites: [String]

});

module.exports = mongoose.model('Partie', PartieSchema);