"use strict";

var express = require('express');
var router = express.Router();


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:/timeline', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
const db = mongoose.connection;

var carteModel = require('../database/Carte');

router.get('/',function(req,res){
   res.render('creercarte_form');
});

module.exports = router;