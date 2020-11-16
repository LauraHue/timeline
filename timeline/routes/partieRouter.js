"use strict";

var express = require('express');
var router = express.Router();

// Mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:/timeline', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
var db = mongoose.connection;

// Les models
var utilisateurModel = require('../database/Utilisateur');
var partieModel = require('../database/Partie');




module.exports = router;